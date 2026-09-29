/**
 * app.js  –  Entry point
 * ----------------------
 * Boots the IDWQ application.
 * All logic lives in the imported modules below.
 *
 * Load order matters:
 *  1. Field metadata  (needed before any CSV export)
 *  2. District lookup (needed before populateFilters)
 *  3. Map             (needs L to be ready)
 *  4. Tabs + side panel
 *  5. Site + WQ data
 */

import { state } from "./state.js";
import { loadFieldMetadata } from "./downloads.js";
import { initMap } from "./mapInit.js";
import { setupTabs, setupSidePanelToggle } from "./tabs.js";
import { applyFilters } from "./filters.js";
import { F_NAME, F_YEAR, SERVICE_URL_SITES } from "./constants.js";

// ── Data loader ───────────────────────────────────────────────────────────────

async function loadData() {
    const introStatus = document.getElementById("introStatus");

    try {
        if (introStatus) introStatus.textContent = "Loading site dataset…";

        const siteRes  = await fetch(SERVICE_URL_SITES);
        const siteJson = await siteRes.json();

        state.raw      = siteJson.features || [];
        state.filtered = [...state.raw];

        // Geometry lookup used by popup "Get Data" button
        window.siteGeometryLookup = {};
        state.raw.forEach((f) => {
            const name = f.properties[F_NAME];
            if (name) window.siteGeometryLookup[name] = f;
        });

        if (introStatus)
            introStatus.textContent = `Loaded ${state.raw.length} sites and index records`;

        // Collect available WQ years
        const allYears = new Set();
        state.raw.forEach((f) => {
            (f.properties?.WQIndexRecords || []).forEach((r) => {
                if (r[F_YEAR] != null) allYears.add(r[F_YEAR]);
            });
        });
        window.availableWQYears = [...allYears].sort((a, b) => a - b);

        state.suppressAutoZoom = true;
        applyFilters();

        setTimeout(() => {
            if (state.saveExtent) state.map.fitBounds(state.saveExtent, { animate: false });
            state.suppressAutoZoom = false;
        }, 80);
    } catch (err) {
        console.error("Data load error:", err);
        if (introStatus) introStatus.textContent = "Error loading dataset.";
    }
}

// ── Application bootstrap ─────────────────────────────────────────────────────

async function initApp() {
    // 1. Field metadata (for CSV headers)
    await loadFieldMetadata();

    // 2. District name lookup
    try {
        const res          = await fetch("tabs/districtNames.json");
        state.districtLookup = await res.json();
    } catch (e) {
        console.error("Cannot load district lookup JSON", e);
        state.districtLookup = [{ name: "All Sites", code: "ALL" }];
    }

    // 3. Map, tabs, side panel
    initMap();
    setupTabs();
    setupSidePanelToggle();

    // 4. Site data
    loadData();
}

document.addEventListener("DOMContentLoaded", initApp);
