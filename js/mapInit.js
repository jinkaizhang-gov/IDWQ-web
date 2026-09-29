/**
 * mapInit.js
 * ----------
 * Initialises the Leaflet map, loads the polygon layer,
 * and wires up all map controls (basemap toggles, layer toggles,
 * zoom-to-extent, reset-district, layer panel).
 */

import { state } from "./state.js";
import { basemaps } from "./constants.js";
import { setLegend, updateLabels } from "./mapPoints.js";
import { applyFilters, zoomToFiltered } from "./filters.js";

// ── Map initialisation ────────────────────────────────────────────────────────

export function initMap() {
    setLegend(state.currentColorMode);

    state.map = L.map("mapView", {
        zoomControl: false,
        layers: [basemaps["OpenStreetMap"]],
    }).setView([50.2, -112.8], 8);

    // Leaflet layer groups that need L to be ready
    state.labelLayerGroup        = L.layerGroup();
    state.reportingAreasLabelLayer = L.layerGroup();

    // ── Mouse coordinate display ──────────────────────────────────────
    state.map.on("mousemove", (e) => {
        const el = document.getElementById("mouseCoordDisplay");
        if (el) el.textContent = `Lat: ${e.latlng.lat.toFixed(5)}, Lon: ${e.latlng.lng.toFixed(5)}`;
    });
    state.map.on("mouseout",  () => { const el = document.getElementById("mouseCoordDisplay"); if (el) el.style.opacity = "0"; });
    state.map.on("mouseover", () => { const el = document.getElementById("mouseCoordDisplay"); if (el) el.style.opacity = "1"; });

    // Default zoom control
    L.control.zoom({ position: "topright" }).addTo(state.map);

    // ── Polygon layer ─────────────────────────────────────────────────
    loadPolygonLayer();

    setTimeout(() => state.map.invalidateSize(), 300);

    state.map.on("zoomend moveend", updateLabels);

    setupMapControls();
    addZoomToExtentControl();
    addResetDistrictControl();
    addLayerPanelToggleControl();
}

// ── Polygon (Reporting Areas) ─────────────────────────────────────────────────

function loadPolygonLayer() {
    fetch("data/ReportingAreas.json")
        .then((r) => r.json())
        .then((polyData) => {
            state.reportingAreasLayer = L.geoJSON(polyData, {
                interactive: false,
                style: {
                    color: "#666666",
                    weight: 1,
                    fillColor: "#cccccc",
                    fillOpacity: 0.1,
                    lineCap: "round",
                    lineJoin: "round",
                },
                onEachFeature: (feature, layer) => {
                    const name   = feature.properties?.NAME || "Unknown Area";
                    const center = layer.getBounds().getCenter();

                    const label = L.marker(center, {
                        icon: L.divIcon({
                            className: "polygon-label",
                            html: name,
                            iconSize: [0, 0],
                            iconAnchor: [0, 0],
                        }),
                        interactive: false,
                    });
                    state.reportingAreasLabelLayer.addLayer(label);
                },
            });

            state.reportingAreasLayer.addTo(state.map).bringToBack();

            state.map.on("zoomend", () => {
                const polygonChecked = document.querySelector('.layer-toggle[data-layer-id="polygons"]')?.checked;
                if (polygonChecked && state.map.getZoom() >= 10) {
                    state.map.addLayer(state.reportingAreasLabelLayer);
                } else {
                    state.map.removeLayer(state.reportingAreasLabelLayer);
                }
            });
        })
        .catch((err) => console.error("Polygon load error:", err));
}

// ── Map controls ──────────────────────────────────────────────────────────────

function setupMapControls() {
    // Basemap radio buttons
    document.querySelectorAll(".basemap-toggle").forEach((radio) => {
        radio.addEventListener("change", (e) => {
            if (!e.target.checked) return;
            Object.values(basemaps).forEach((l) => { if (state.map.hasLayer(l)) state.map.removeLayer(l); });
            basemaps[e.target.dataset.basemapId]?.addTo(state.map);
        });
    });

    // Points layer toggle
    document.querySelector('.layer-toggle[data-layer-id="points"]').onchange = (e) => {
        const legendEl = document.getElementById("mapLegend");
        if (e.target.checked) {
            if (state.pointLayer)      state.pointLayer.addTo(state.map);
            if (state.labelLayerGroup) state.labelLayerGroup.addTo(state.map);
            if (legendEl) legendEl.style.display = "block";
        } else {
            if (state.pointLayer)      state.map.removeLayer(state.pointLayer);
            if (state.labelLayerGroup) state.map.removeLayer(state.labelLayerGroup);
            if (legendEl) legendEl.style.display = "none";
        }
    };

    // Polygon layer toggle
    document.querySelector('.layer-toggle[data-layer-id="polygons"]').onchange = (e) => {
        if (e.target.checked) {
            if (state.reportingAreasLayer)      state.reportingAreasLayer.addTo(state.map);
            if (state.reportingAreasLabelLayer) state.reportingAreasLabelLayer.addTo(state.map);
        } else {
            if (state.reportingAreasLayer)      state.map.removeLayer(state.reportingAreasLayer);
            if (state.reportingAreasLabelLayer) state.map.removeLayer(state.reportingAreasLabelLayer);
        }
    };

    // Zoom to extent button
    const zoomBtn = document.getElementById("zoomToExtentBtn");
    if (zoomBtn) {
        zoomBtn.onclick = () => { if (!state.suppressAutoZoom) zoomToFiltered(); };
    }
}

function addZoomToExtentControl() {
    const ZoomToExtentControl = L.Control.extend({
        options: { position: "topright" },
        onAdd() {
            const container = document.getElementById("zoomToExtentControl");
            L.DomEvent.disableClickPropagation(container);
            return container;
        },
    });
    state.map.addControl(new ZoomToExtentControl());
}

function addResetDistrictControl() {
    const ResetDistrictControl = L.Control.extend({
        options: { position: "topright" },
        onAdd() {
            const btn = L.DomUtil.create(
                "button",
                "leaflet-reset-district-btn leaflet-reset-district-container"
            );
            btn.title = "Reset District Selection";
            L.DomEvent.disableClickPropagation(btn);
            btn.onclick = () => {
                state.currentDistrictValue = "ALL";
                if (state.districtSelect)     state.districtSelect.value = "ALL";
                if (state.dataDistrictSelect) state.dataDistrictSelect.value = "ALL";
                state.suppressAutoZoom = true;
                applyFilters();
                state.suppressAutoZoom = false;
            };
            return btn;
        },
    });
    state.map.addControl(new ResetDistrictControl());
}

function addLayerPanelToggleControl() {
    const LayerPanelToggle = L.Control.extend({
        options: { position: "topright" },
        onAdd() {
            const container = document.getElementById("layerPanelToggleControl");
            L.DomEvent.disableClickPropagation(container);
            return container;
        },
    });
    state.map.addControl(new LayerPanelToggle());

    const panel = document.getElementById("mapLayersPanel");
    const btn   = document.getElementById("layerPanelToggleBtn");
    btn.onclick = () => {
        const hidden = window.getComputedStyle(panel).display === "none";
        panel.style.display = hidden ? "block" : "none";
    };
}
