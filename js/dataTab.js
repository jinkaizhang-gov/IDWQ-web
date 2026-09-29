/**
 * dataTab.js
 * ----------
 * Data tab: site list table, hover highlight, and click-to-zoom.
 */

import { state } from "./state.js";
import { F_DIST, F_NAME, F_DESC } from "./constants.js";

// ── Hover highlight ───────────────────────────────────────────────────────────

window.highlightPoint = function (lat, lon) {
    clearHoverHighlight();
    state.hoverHighlightLayer = L.marker([lat, lon], {
        icon: L.divIcon({
            className: "hover-circle-highlight",
            iconSize: [28, 28],
            iconAnchor: [14, 14],
        }),
        interactive: false,
    }).addTo(state.map);
};

window.clearHoverHighlight = function () {
    if (state.hoverHighlightLayer) {
        state.map.removeLayer(state.hoverHighlightLayer);
        state.hoverHighlightLayer = null;
    }
};

// ── Zoom to site ──────────────────────────────────────────────────────────────

window.zoomToSiteFromDataTab = function (lat, lon) {
    if (lat && lon) state.map.setView([lat, lon], 14);
};

// ── Site list collapse ────────────────────────────────────────────────────────

window.toggleSiteListCollapse = function () {
    const header  = document.getElementById("siteListHeader");
    const content = document.getElementById("siteListContent");
    if (!header || !content) return;

    const isCollapsed = header.classList.toggle("collapsed");
    content.classList.toggle("hidden-content");

    const icon = header.querySelector(".expand-icon");
    if (icon) icon.textContent = isCollapsed ? "expand_more" : "expand_less";
};

// ── Render site list ──────────────────────────────────────────────────────────

export function renderDataSiteList() {
    const container = document.getElementById("dataSiteListContainer");
    if (!container) return;

    if (state.currentDownloadMode !== "filtered") {
        container.innerHTML = `
            <p style="font-style: italic; color:#666;">
                Site list is disabled when downloading the full dataset.
            </p>`;
        return;
    }

    container.innerHTML = "";

    const selectedDistrict = state.currentDistrictValue;

    // Filter by district, deduplicate by site name
    let sitesForDistrict = state.raw.filter((f) => {
        const d = (f.properties[F_DIST] || "").trim().toUpperCase();
        return selectedDistrict === "ALL" || d === selectedDistrict.trim().toUpperCase();
    });

    const siteMap = new Map();
    sitesForDistrict.forEach((f) => {
        const name = f.properties[F_NAME];
        if (name && !siteMap.has(name)) siteMap.set(name, f);
    });
    sitesForDistrict = Array.from(siteMap.values());

    if (sitesForDistrict.length === 0) {
        container.innerHTML = `<p style="color: #c00;">No sites found for the selected criteria.</p>`;
        return;
    }

    const districtName = selectedDistrict === "ALL" ? "All Districts" : selectedDistrict;
    const siteCount    = sitesForDistrict.length;

    let tableBodyHtml = "";
    sitesForDistrict.forEach((f) => {
        const p       = f.properties;
        const name    = p[F_NAME] || "N/A";
        const desc    = p[F_DESC] || "No Description Available";
        const [lon, lat] = f.geometry.coordinates;

        tableBodyHtml += `
            <tr onclick="zoomToSiteFromDataTab(${lat}, ${lon})"
                onmouseenter="highlightPoint(${lat}, ${lon})"
                onmouseleave="clearHoverHighlight()">
                <td>${name}</td>
                <td>${desc}</td>
            </tr>`;
    });

    container.innerHTML = `
        <h3 class="site-list-header" id="siteListHeader" onclick="toggleSiteListCollapse()">
            Sites in ${districtName} (${siteCount} total)
            <span class="material-symbols-outlined expand-icon">expand_less</span>
        </h3>
        <div id="siteListContent" class="site-list-content">
            <table class="guideline-table">
                <thead>
                    <tr>
                        <th style="width: 30%;">Site Name</th>
                        <th>Site Description</th>
                    </tr>
                </thead>
                <tbody>${tableBodyHtml}</tbody>
            </table>
        </div>`;
}
