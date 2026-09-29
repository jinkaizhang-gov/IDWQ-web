/**
 * filters.js
 * ----------
 * District / year filter logic, dropdown population, and zoom-to-extent.
 *
 * RULES (from original design):
 *  - District is the ONLY spatial filter (year never filters geometry)
 *  - Year only changes marker colour (handled inside styleByWQ)
 *  - filtered[] = raw filtered by district only
 *  - mapFeatures[] = ALL sites always
 */

import { state } from "./state.js";
import { F_DIST, F_NAME, F_YEAR } from "./constants.js";
import { drawPoints } from "./mapPoints.js";
import { renderDataSiteList } from "./dataTab.js";
import { downloadWQIndexData } from "./downloads.js";

// ── Zoom to filtered extent ───────────────────────────────────────────────────

export function zoomToFiltered() {
    if (state.suppressAutoZoom) return;

    const b = L.latLngBounds([]);
    state.filtered.forEach((f) => {
        const coords = f.geometry.coordinates;
        if (coords) b.extend([coords[1], coords[0]]);
    });

    if (!b.isValid()) return;

    if (b.getNorth() === b.getSouth() && b.getWest() === b.getEast()) {
        state.map.setView(b.getCenter(), 12);
    } else {
        state.map.fitBounds(b, { padding: [40, 40] });
    }
}

// ── Apply filters ─────────────────────────────────────────────────────────────

export function applyFilters() {
    const d = state.currentDistrictValue;

    state.filtered = state.raw.filter((f) => {
        const dist = (f.properties[F_DIST] || "").trim().toUpperCase();
        return d === "ALL" || dist === d.trim().toUpperCase();
    });

    state.mapFeatures = [...state.raw];

    const dLabel = d === "ALL" ? "All Districts" : d;
    if (state.wqSummary) {
        if (state.filtered.length > 0) {
            state.wqSummary.textContent = `${state.filtered.length} WQ Index records shown for ${dLabel}.`;
        } else {
            state.wqSummary.innerHTML = `<p style="color:#c00; font-weight:600; margin:0;">
                No sites found for the selected criteria.
            </p>`;
        }
    }

    drawPoints();

    if (!state.suppressAutoZoom) zoomToFiltered();

    if (state.currentActiveTab === "data") renderDataSiteList();
}

// ── Populate dropdowns ────────────────────────────────────────────────────────

export function populateFilters() {
    // Grab DOM references and store them in state
    state.districtSelect     = document.getElementById("districtSelect");
    state.yearSelect         = document.getElementById("yearSelect");
    state.wqSummary          = document.getElementById("wqSummary");
    state.dataDistrictSelect = document.getElementById("dataDistrictSelect");

    const downloadSiteDataBtn  = document.getElementById("downloadSiteDataBtn");
    const downloadCsvBtn       = document.getElementById("downloadCsvBtn");
    const filteredModeContainer = document.getElementById("filteredModeContainer");
    const modeToggles          = document.querySelectorAll('input[name="downloadMode"]');

    // ── Year options ─────────────────────────────────────────────────
    const yearSet = new Set();
    state.raw.forEach((f) => {
        (f.properties.WQIndexRecords || []).forEach((r) => {
            if (r[F_YEAR] != null) yearSet.add(parseInt(r[F_YEAR]));
        });
    });
    const yVals = [...yearSet].sort((a, b) => a - b);
    const yearOptions =
        `<option value="ALL">All Years</option>` +
        yVals.map((v) => `<option>${v}</option>`).join("");

    // ── District options ─────────────────────────────────────────────
    let districtOptions = "";
    state.districtLookup.forEach((d) => {
        districtOptions += `<option value="${d.code}">${d.name}</option>`;
    });

    // ── Populate selects ─────────────────────────────────────────────
    if (state.districtSelect) {
        state.districtSelect.innerHTML = districtOptions;
        state.districtSelect.disabled  = false;
        state.districtSelect.value     = state.currentDistrictValue;
    }

    if (state.yearSelect) {
        state.yearSelect.innerHTML = yearOptions;
        state.yearSelect.disabled  = false;

        const savedYear = sessionStorage.getItem("WQ_SelectedYear");
        if (savedYear && yearOptions.includes(`<option>${savedYear}</option>`)) {
            state.yearSelect.value = savedYear;
        } else if (yVals.length > 0) {
            state.yearSelect.value = yVals[yVals.length - 1];
            sessionStorage.setItem("WQ_SelectedYear", state.yearSelect.value);
        }
    }

    if (state.dataDistrictSelect) {
        state.dataDistrictSelect.innerHTML = districtOptions;
        state.dataDistrictSelect.disabled  = false;
        state.dataDistrictSelect.value     = state.currentDistrictValue;
    }

    // ── Download mode toggle ──────────────────────────────────────────
    const updateDownloadMode = (mode) => {
        state.currentDownloadMode = mode;
        const isFiltered = mode === "filtered";

        if (filteredModeContainer)
            filteredModeContainer.style.display = isFiltered ? "block" : "none";

        if (downloadSiteDataBtn)
            downloadSiteDataBtn.textContent = isFiltered
                ? "Download Measurement Data (Filtered Sites)"
                : "Download Full Raw Measurement Dataset (All Sites)";

        if (!isFiltered) {
            state.currentDistrictValue = "ALL";
            if (state.districtSelect)     state.districtSelect.value = "ALL";
            if (state.dataDistrictSelect) state.dataDistrictSelect.value = "ALL";
            state.suppressAutoZoom = true;
            applyFilters();
            state.suppressAutoZoom = false;
        }

        if (state.currentActiveTab === "data") renderDataSiteList();

        setTimeout(() => {
            if (state.saveExtent) state.map.fitBounds(state.saveExtent, { animate: false });
            state.suppressAutoZoom = false;
        }, 50);
    };

    if (modeToggles.length > 0) {
        modeToggles.forEach((toggle) => {
            toggle.addEventListener("change", (e) => updateDownloadMode(e.target.value));
        });
        const initialToggle = document.querySelector(
            `input[name="downloadMode"][value="${state.currentDownloadMode}"]`
        );
        if (initialToggle) initialToggle.checked = true;
    }
    updateDownloadMode(state.currentDownloadMode);

    // ── Sync district selects ─────────────────────────────────────────
    const syncAndFilter = (changedEl) => {
        state.currentDistrictValue = changedEl.value;

        const other =
            changedEl === state.districtSelect     ? state.dataDistrictSelect :
            changedEl === state.dataDistrictSelect ? state.districtSelect : null;
        if (other) other.value = changedEl.value;

        applyFilters();
        setTimeout(() => {
            if (state.saveExtent) state.map.fitBounds(state.saveExtent, { animate: false });
            state.suppressAutoZoom = false;
        }, 50);
    };

    if (state.districtSelect)
        state.districtSelect.onchange = (e) => syncAndFilter(e.target);
    if (state.dataDistrictSelect)
        state.dataDistrictSelect.onchange = (e) => syncAndFilter(e.target);

    if (state.yearSelect) {
        state.yearSelect.onchange = (e) => {
            sessionStorage.setItem("WQ_SelectedYear", e.target.value);
            applyFilters();
        };
    }

    // ── Download buttons ──────────────────────────────────────────────
    if (downloadCsvBtn) {
        downloadCsvBtn.disabled = false;
        downloadCsvBtn.onclick  = downloadWQIndexData;
    }
    if (downloadSiteDataBtn) {
        downloadSiteDataBtn.disabled = false;
        downloadSiteDataBtn.onclick  = () => {
            window.downloadSiteData(null, state.currentDownloadMode === "full");
        };
    }

    applyFilters();
    setTimeout(() => {
        if (state.saveExtent) state.map.fitBounds(state.saveExtent, { animate: false });
        state.suppressAutoZoom = false;
    }, 50);
}
