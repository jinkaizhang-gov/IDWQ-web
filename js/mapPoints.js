/**
 * mapPoints.js
 * ------------
 * Draws point markers and labels on the map.
 * Handles popup content, label collision avoidance, and the map legend.
 */

import { state } from "./state.js";
import { styleFor, getColorByValue } from "./mapStyles.js";
import { F_NAME, F_DESC, F_DIST, F_TYPE, F_STAT, F_YEAR, F_VALUE, LEGEND_HTML_WQ, LEGEND_HTML_SITE } from "./constants.js";

// ── Popup helpers ────────────────────────────────────────────────────────────

function getPhotoUrl(siteName) {
    if (!siteName) return "";
    return `sitePhotos/${siteName}.jpg`;
}

export function makeWQTimelineHtml(props) {
    const recs = props.WQIndexRecords || [];
    if (!recs.length) return "";

    const sorted = [...recs].sort((a, b) => a[F_YEAR] - b[F_YEAR]);
    const firstYear = sorted[0][F_YEAR];
    const lastYear  = sorted[sorted.length - 1][F_YEAR];

    const segments = sorted.map((r) => `
        <div class="wq-timeline-segment"
             style="background:${getColorByValue(r[F_VALUE])}"
             title="${r[F_YEAR]}: ${r[F_VALUE]}">
        </div>
    `).join("");

    return `
        <div class="wq-timeline-container">
            <div class="wq-timeline-label">Water Quality Index</div>
            <div class="wq-timeline-years-header">
                <span class="wq-year-left">${firstYear}</span>
                <span class="wq-year-right">${lastYear}</span>
            </div>
            <div class="wq-timeline">
                ${segments}
            </div>
        </div>
    `;
}

// ── Label helpers ────────────────────────────────────────────────────────────

function isOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function runCollisionAvoidance() {
    const labels = Array.from(document.querySelectorAll(".point-label"));
    const rects  = labels.map((el) => ({ el, box: el.getBoundingClientRect() }));

    rects.forEach((r1, i) => {
        let hide = false;
        for (let j = 0; j < i; j++) {
            if (isOverlap(r1.box, rects[j].box)) { hide = true; break; }
        }
        r1.el.classList.toggle("visible", !hide);
    });
}

export function updateLabels() {
    const zoom = state.map.getZoom();

    state.labelLayerGroup.eachLayer((layer) => {
        const el = layer._icon;
        if (!el) return;
        el.classList.toggle("visible", zoom >= 10);
    });

    if (zoom >= 10) setTimeout(runCollisionAvoidance, 50);
}

// ── Legend ───────────────────────────────────────────────────────────────────

export function setLegend(mode) {
    const el = document.getElementById("mapLegend");
    if (!el) return;
    const html = mode === "WQ" ? LEGEND_HTML_WQ : LEGEND_HTML_SITE;
    el.innerHTML = `<div class="legend-content">${html}</div>`;
}

// ── Draw points ───────────────────────────────────────────────────────────────

export function drawPoints() {
    if (state.pointLayer) state.map.removeLayer(state.pointLayer);
    state.labelLayerGroup.clearLayers();

    state.pointLayer = L.geoJSON(
        {
            type: "FeatureCollection",
            features: state.mapFeatures.length ? state.mapFeatures : state.raw,
        },
        {
            pointToLayer: (f, latlng) => L.circleMarker(latlng, styleFor(f)),

            onEachFeature: (f, marker) => {
                const p = f.properties;
                const siteName    = p[F_NAME] || "N/A";
                const photoUrl    = getPhotoUrl(siteName);
                const escapedName = siteName.replace(/'/g, "\\'");

                const popupContent = `
                    <div class="site-popup">
                        <div class="site-popup-header"><span>${siteName}</span></div>
                        <div class="site-photo-container">
                            <img src="${photoUrl}"
                                 alt="Photo of site ${siteName}"
                                 title="Photo of site ${siteName}"
                                 onerror="this.style.display='none';">
                        </div>
                        <table class="popup-attr-table">
                            <tr><td class="attr-label">Description</td>
                                <td class="attr-value">${p[F_DESC] || ""}</td></tr>
                            <tr><td class="attr-label">Irrigation District</td>
                                <td class="attr-value">${p[F_DIST] || ""}</td></tr>
                            <tr><td class="attr-label">Site Type</td>
                                <td class="attr-value">${p[F_TYPE] || ""}</td></tr>
                            <tr><td class="attr-label">Status</td>
                                <td class="attr-value">${p[F_STAT] || ""}</td></tr>
                        </table>
                        ${makeWQTimelineHtml(p)}
                        <button class="get-data-btn"
                                data-site-name="${escapedName}"
                                onclick="window.downloadSiteData(this.dataset.siteName)">
                            Get Data ...
                        </button>
                    </div>
                `;

                const popup = L.responsivePopup({
                    offset: L.point(0, -6),
                    autoPanPadding: L.point(10, 10),
                }).setContent(popupContent);

                marker.bindPopup(popup, { closeButton: true });

                // Label
                const lbl = L.marker(marker.getLatLng(), {
                    icon: L.divIcon({
                        className: "point-label",
                        html: p[F_NAME],
                        iconSize: [0, 0],
                        iconAnchor: [12, -5],
                    }),
                    interactive: false,
                });
                state.labelLayerGroup.addLayer(lbl);
            },
        }
    );

    const chk = document.querySelector('.layer-toggle[data-layer-id="points"]');
    if (chk && chk.checked) {
        state.pointLayer.addTo(state.map);
        state.labelLayerGroup.addTo(state.map);
    }

    updateLabels();
}
