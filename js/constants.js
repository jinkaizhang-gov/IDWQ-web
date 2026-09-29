// ======================================================================
//  IDWQ OFFLINE WEB APPLICATION – SHARED CONSTANTS
// ======================================================================
//
//  This file centralizes:
//   • Offline JSON data locations
//   • Standardized field names
//   • Basemap configurations
//   • Legend HTML templates
//
//  NOTES:
//  - The application is now 100% OFFLINE (no ArcGIS REST services).
//  - Do NOT append query parameters or attempt dynamic server paging.
//  - All geometry + index attributes are already baked into:
//        data/WQ_Sites_Merged.json
//  - Raw laboratory measurement records are stored in:
//        data/WQ_SiteData.geojson
//
// ======================================================================

// ======================================================================
// 1) OFFLINE DATA SOURCES
// ======================================================================

// Contains:
//   - Point geometries (Lng/Lat)
//   - Site metadata (district, type, status, etc.)
//   - Yearly water quality index results in the attribute table
//
// Every point record represents a SITE, water quality records as a array.
export const SERVICE_URL_SITES = "data/WQ_Sites_Merged.json";

// Full raw laboratory measurements (potentially large)
// Used only when user downloads detailed CSVs
export const SERVICE_URL_SITEDATA = "data/WQ_SiteData.json";

// ======================================================================
// 2) FIELD NAME DEFINITIONS – USED UNIFORMLY ACROSS THE APP
// ======================================================================
//
// These names MUST match exactly the attribute names inside your JSON.
// This keeps all mapping, export, popup, and filtering logic consistent.
//

// Site metadata fields (from WQ_Sites_Merged.json)
export const F_NAME = "SiteName";
export const F_DESC = "SiteDescription";
export const F_DIST = "IrrDist";
export const F_TYPE = "SiteType";
export const F_STAT = "SiteStatus";

// Water Quality Index fields (also inside WQ_Sites_Merged.json)
export const F_YEAR = "IndexYear";
export const F_VALUE = "IndexValue";

// Laboratory dataset field for linking measurement data to a Site
export const F_SITEDATA_SITE_NAME = "Site";

// ======================================================================
// 3) LEAFLET BASEMAP DEFINITIONS
// ======================================================================
//
// Leaflet is available globally via <script> tag, therefore you can
// safely create tile layers here. These basemaps are toggled in app.js.
//

export const basemaps = {
  OpenStreetMap: L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap",
  }),

  "Esri Topo": L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Esri — World Topographic Map" }
  ),

  "Esri Imagery": L.tileLayer(
    "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    { attribution: "Esri — World Imagery" }
  ),
};

// ======================================================================
// 4) LEGEND HTML TEMPLATES
// ======================================================================
//
// These small HTML fragments are injected into the map legend container.
// Styling and color CSS classes are defined in your stylesheet.
//
//  Two modes:
//    • WQ Index Symbology
//    • Site Type / Status Symbology
//

export const LEGEND_HTML_WQ = `
  <b>Water Quality Index</b><br>
  <div class="legend-row">
    <span class="legend-dot legend-excellent"></span>
    Excellent (95–100)
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-good"></span>
    Good (80–94.9)
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-fair"></span>
    Fair (65–79.9)
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-marginal"></span>
    Marginal (45–64.9)
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-poor"></span>
    Poor (0–44.9)
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-na"></span>
    Not Available
  </div>
`;

export const LEGEND_HTML_SITE = `
  <b>Site Type and Status</b><br>
  <div class="legend-row">
    <span class="legend-dot legend-primary"></span>
    Primary site Active
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-secondary"></span>
    Secondary site Active
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-return"></span>
    Return site Active
  </div>
  <div class="legend-row">
    <span class="legend-dot legend-inactive"></span>
    Inactive site
  </div>
`;
