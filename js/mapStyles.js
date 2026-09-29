/**
 * mapStyles.js
 * ------------
 * Marker / polygon style functions.
 * All functions are pure (no side-effects) except they read from state.
 */

import { state } from "./state.js";
import { F_TYPE, F_STAT, F_DIST, F_YEAR, F_VALUE } from "./constants.js";

// ── WQ colour helpers ────────────────────────────────────────────────────────

export function getColorByValue(v) {
    if (!v) return "#d9d9d9";
    v = v.toUpperCase();
    if (v === "EXCELLENT") return "#0235ee";
    if (v === "GOOD")      return "#00b050";
    if (v === "FAIR")      return "#ffff00";
    if (v === "MARGINAL")  return "#ff9600";
    if (v === "POOR")      return "#ff0a0a";
    return "#d9d9d9";
}

/**
 * Returns Leaflet marker style based on the Water Quality Index
 * for the currently selected year.
 */
export function styleByWQ(f) {
    const recs = f.properties.WQIndexRecords || [];
    let v = "NA";

    if (state.yearSelect && state.yearSelect.value) {
        const selYear = parseInt(state.yearSelect.value);
        const match = recs.find((r) => parseInt(r[F_YEAR]) === selYear);
        if (match) v = match[F_VALUE];
    }

    let fill = "#d9d9d9";
    if (v === "EXCELLENT") fill = "#0235ee";
    else if (v === "GOOD")      fill = "#00b050";
    else if (v === "FAIR")      fill = "#ffff00";
    else if (v === "MARGINAL")  fill = "#ff9600";
    else if (v === "POOR")      fill = "#ff0a0a";

    return { radius: 6, color: "#000", weight: 0.5, fillColor: fill, fillOpacity: 1 };
}

/**
 * Returns marker style based on site type & status.
 * Used in all tabs except the WQ tab.
 */
export function styleBySiteType(f) {
    const p = f.properties || {};
    const typeVal = (p[F_TYPE] || "").toString().toUpperCase();
    const statVal = (p[F_STAT] || "").toString().toUpperCase();

    let fill;
    if (statVal.includes("INACTIVE"))       fill = "#E0E0E0";
    else if (typeVal.includes("PRIMARY"))   fill = "#00CFFF";
    else if (typeVal.includes("SECONDARY")) fill = "#D56BFF";
    else if (typeVal.includes("RETURN"))    fill = "#FFA500";
    else                                    fill = "#E0E0E0";

    return { radius: 6, color: "#505050", weight: 1, fillColor: fill, fillOpacity: 1 };
}

/**
 * Master style selector — picks WQ or SiteType mode,
 * then applies district highlight on top.
 */
export function styleFor(f) {
    const base = state.currentColorMode === "WQ"
        ? styleByWQ(f)
        : styleBySiteType(f);

    const p = f.properties || {};
    const siteDist   = (p[F_DIST] || "").trim().toUpperCase();
    const selectedDist = state.currentDistrictValue.trim().toUpperCase();

    const isSelected =
        selectedDist !== "ALL" && siteDist === selectedDist;

    if (isSelected) {
        return {
            ...base,
            radius: (base.radius || 6) + 3,
            stroke: true,
            color: "#004a8f",
            weight: 2.5,
            fillOpacity: 1,
        };
    }

    return base;
}
