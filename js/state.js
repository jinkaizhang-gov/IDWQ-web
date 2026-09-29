/**
 * state.js
 * --------
 * Single source of truth for all shared global state.
 * Import this in any module that needs to read or write app state.
 *
 * RULES:
 *  - Never import from app.js or other feature modules here (no circular deps)
 *  - Always import { state } and mutate properties directly: state.raw = [...]
 */

export const state = {
    // ── Data ──────────────────────────────────────────────────────────
    raw: [],            // All site features loaded from WQ_Sites_Merged.json
    filtered: [],       // raw filtered ONLY by irrigation district
    mapFeatures: [],    // All sites for map display (never filtered by district)

    // ── Map layers ────────────────────────────────────────────────────
    map: null,
    pointLayer: null,
    labelLayerGroup: null,          // assigned after L is available
    reportingAreasLayer: null,
    reportingAreasLabelLayer: null, // assigned after L is available
    hoverHighlightLayer: null,

    // ── UI references ─────────────────────────────────────────────────
    districtSelect: null,
    yearSelect: null,
    wqSummary: null,
    dataDistrictSelect: null,

    // ── Filter / selection state ───────────────────────────────────────
    currentColorMode: "SITE_TYPE",   // "WQ" | "SITE_TYPE"
    currentActiveTab: null,
    suppressAutoZoom: false,
    saveExtent: null,
    currentDistrictValue: "ALL",
    currentDownloadMode: "filtered", // "filtered" | "full"

    // ── Lookup tables ──────────────────────────────────────────────────
    districtLookup: [],
    fieldMeta: {},                   // keyed by field name
};
