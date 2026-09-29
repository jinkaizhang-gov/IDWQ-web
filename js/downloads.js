/**
 * downloads.js
 * ------------
 * CSV export functions:
 *  - WQ Index data (district-filtered, expanded rows)
 *  - Site measurement data (single site / district filtered / full)
 *  - Field metadata loading and CSV header helpers
 */

import { state } from "./state.js";
import {
    F_NAME, F_DIST, F_TYPE, F_STAT, F_YEAR, F_VALUE,
    F_SITEDATA_SITE_NAME, SERVICE_URL_SITEDATA,
} from "./constants.js";

// ── Field metadata ────────────────────────────────────────────────────────────

export async function loadFieldMetadata() {
    try {
        const res  = await fetch("data/fieldJson.json");
        state.fieldMeta = await res.json();
        console.log(`Loaded metadata for ${Object.keys(state.fieldMeta).length} fields`);
    } catch (e) {
        console.warn("Field metadata JSON not loaded. CSV will use raw field names.", e);
        state.fieldMeta = {};
    }
}

export function getHeaderName(field) {
    return state.fieldMeta[field]?.fieldName?.trim() || field;
}

export function getHeaderUnit(field) {
    return state.fieldMeta[field]?.units || "";
}

export function getHeaderGuideline(field) {
    return state.fieldMeta[field]?.guideline || "";
}

// ── WQ Index CSV export ───────────────────────────────────────────────────────

export function downloadWQIndexData() {
    const dataToExport = state.filtered;
    if (dataToExport.length === 0) {
        alert("No data found for the current filter to export.");
        return;
    }

    const header = ["SiteName", "IrrDist", "SiteType", "SiteStatus",
                    "IndexYear", "IndexValue", "Longitude", "Latitude"];
    const rows   = [header.join(",")];

    dataToExport.forEach((f) => {
        const p         = f.properties;
        const [lon, lat] = f.geometry.coordinates || [null, null];

        if (!Array.isArray(p.WQIndexRecords) || p.WQIndexRecords.length === 0) {
            rows.push([p[F_NAME], p[F_DIST], p[F_TYPE], p[F_STAT], "", "", lon, lat].join(","));
            return;
        }

        p.WQIndexRecords.forEach((rec) => {
            rows.push([
                p[F_NAME], p[F_DIST], p[F_TYPE], p[F_STAT],
                rec[F_YEAR], rec[F_VALUE], lon, lat,
            ].join(","));
        });
    });

    // Sort by site name then year (skip header row)
    const dataRows = rows.slice(1).sort((a, b) => {
        const A = a.split(","), B = b.split(",");
        if (A[0] < B[0]) return -1;
        if (A[0] > B[0]) return  1;
        return parseInt(A[4] || "0") - parseInt(B[4] || "0");
    });
    rows.splice(1, rows.length - 1, ...dataRows);

    const fname =
        "IDWQ_Index_" +
        (state.currentDistrictValue === "ALL"
            ? "ALL"
            : state.currentDistrictValue.replace(/ /g, "_"));

    triggerCsvDownload(rows.join("\r\n"), fname + ".csv");
}

// ── Site measurement data export ──────────────────────────────────────────────

window.downloadSiteData = async function (singleSiteName = null, isFullDownload = false) {
    const statusEl = document.getElementById("dataDownloadStatus");
    if (statusEl) statusEl.textContent = "Loading site data…";

    try {
        const res  = await fetch(SERVICE_URL_SITEDATA);
        const json = await res.json();
        const all  = json.features || [];

        let rows;
        if (isFullDownload) {
            rows = all;
        } else if (singleSiteName) {
            rows = all.filter((r) => r.properties[F_SITEDATA_SITE_NAME] === singleSiteName);
        } else {
            const selectedDistrict = state.currentDistrictValue.trim().toUpperCase();
            const siteNames = [...new Set(
                state.raw
                    .filter((f) => {
                        const d = (f.properties[F_DIST] || "").trim().toUpperCase();
                        return selectedDistrict === "ALL" || d === selectedDistrict;
                    })
                    .map((f) => f.properties[F_NAME])
                    .filter(Boolean)
            )];
            rows = all.filter((r) => siteNames.includes(r.properties[F_SITEDATA_SITE_NAME]));
        }

        if (rows.length === 0) {
            alert("No measurement data found for the selected criteria.");
            if (statusEl) statusEl.textContent = "No data found.";
            return;
        }

        const fields    = Object.keys(rows[0].properties);
        const csvRows   = [
            fields.map(getHeaderName).join(","),
            fields.map(getHeaderUnit).join(","),
            fields.map(getHeaderGuideline).join(","),
        ];

        rows.forEach((r) => {
            const vals = fields.map((field) => {
                let v = r.properties[field];
                if (v == null) v = "";
                v = String(v).replace(/"/g, '""');
                if (/[,"\n\r]/.test(v)) v = `"${v}"`;
                return v;
            });
            csvRows.push(vals.join(","));
        });

        let fname = "IDWQ_SiteData";
        if (singleSiteName)                     fname += "_" + singleSiteName.replace(/ /g, "_");
        if (isFullDownload)                     fname += "_FULL";
        if (!isFullDownload && !singleSiteName) {
            fname += "_" + (state.currentDistrictValue === "ALL"
                ? "ALL"
                : state.currentDistrictValue.replace(/ /g, "_"));
        }

        triggerCsvDownload(csvRows.join("\r\n"), fname + ".csv");
        if (statusEl) statusEl.textContent = "Download complete.";
    } catch (err) {
        console.error("Site data download error:", err);
        alert("Error downloading data — check console");
        if (statusEl) statusEl.textContent = "Error.";
    }
};

// ── Helper ────────────────────────────────────────────────────────────────────

function triggerCsvDownload(csvString, filename) {
    const blob = new Blob([csvString], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
