# Irrigation District Water Quality Portal

A static web application for exploring irrigation district water-quality information, viewing Water Quality (WQ) index summaries, mapping monitoring sites, and downloading measurement data.

## Live site

GitHub Pages:

https://jinkaizhang-gov.github.io/IDWQ-web/

The site is deployed from the `master` branch at the repository root.

## Technology

The application is intentionally lightweight and does not require a front-end framework or build process.

- HTML
- CSS
- JavaScript (ES modules)
- Leaflet 1.9.4
- GeoJSON / JSON data
- Python / ArcPy utilities for preparing data

## Project structure

```text
IDWQ-web/
├── index.html              # Landing page
├── app.html                # Main mapping/data application
├── css/
│   └── style.css           # Application styles
├── js/
│   ├── app.js              # Main application initialization
│   ├── constants.js        # File paths, field names, basemaps, constants
│   ├── dataTab.js          # Measurement-data tab logic
│   ├── downloads.js        # CSV/data download functions
│   ├── filters.js          # District/year filtering
│   ├── mapInit.js          # Leaflet map initialization
│   ├── mapPoints.js        # Monitoring-site markers and popups
│   ├── mapStyles.js        # Map styling helpers
│   ├── state.js            # Shared application state
│   └── tabs.js             # Tab loading/navigation
├── data/
│   ├── WQ_Sites.geojson    # Monitoring-site geometry
│   ├── WQ_Sites_Merged.json
│   ├── WQ_SiteData.json    # Detailed measurement data
│   ├── ReportingAreas.json
│   ├── WQ_Index.geojson
│   └── fieldJson.json      # Field names, units, and metadata
├── tabs/
│   ├── intro.html
│   ├── wq.html
│   ├── data.html
│   ├── pubs.html
│   ├── districtNames.json
│   └── guidelines.json
├── images/
├── sitePhotos/
└── py/                     # Data-preparation scripts
```

## Main data files

### `WQ_Sites.geojson`

Monitoring-site point geometry and site attributes.

This file is intentionally retained with a `.geojson` extension.

### `WQ_Sites_Merged.json`

Site information combined with WQ index records for use by the web application.

### `WQ_SiteData.json`

Detailed water-quality measurement records used by the data tab and download functions.

This is currently the largest application data file.

### `ReportingAreas.json`

Reporting-area polygon geometry.

### `fieldJson.json`

Metadata used to provide user-friendly field names, units, and related information.

## Application flow

At startup, `app.html` loads the JavaScript modules and application configuration.

The application then:

1. Initializes the Leaflet map.
2. Loads field metadata and irrigation-district information.
3. Loads site and WQ index data.
4. Creates site markers and map layers.
5. Builds district/year filters.
6. Loads tab content as required.
7. Loads detailed measurement data when needed for data viewing or downloads.

## Running locally

Because the application uses `fetch()` to load local JSON and HTML files, opening `index.html` directly with a `file://` URL may not work correctly.

Run a small local HTTP server from the repository root instead.

Python example:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000/
```

or:

```text
http://localhost:8000/app.html
```

## Deployment

The current deployment uses GitHub Pages.

Configuration:

- Source: Deploy from a branch
- Branch: `master`
- Folder: `/ (root)`
- HTTPS: enabled

Changes pushed to `master` are automatically published by GitHub Pages.

Deployment status can be checked from the repository's **Actions** tab under **pages build and deployment**.

## Data preparation

The `py/` directory contains Python/ArcPy utilities used to convert source GIS and water-quality datasets into files consumed by the web application.

Current scripts include:

- `SiteData2Json.py`
- `WQ2Json.py`
- `ToGeojson_batch.py`
- `fc2Geojson.py`
- `merge_site_index.py`

These scripts are data-preparation tools and are not executed by the website.

## Data-file naming convention

Most application data is served using a `.json` extension for compatibility with normal browser/web-server requests.

The exception is:

```text
WQ_Sites.geojson
```

which is intentionally kept as GeoJSON.

## Notes for maintainers

- Keep relative file paths intact so the application works under the GitHub Pages project path `/IDWQ-web/`.
- Avoid root-absolute paths such as `/data/file.json` unless deployment behavior is explicitly accounted for.
- When data-generation scripts are updated, verify that their output filenames match the files referenced in `js/constants.js`.
- After updating data, test the map, district/year filters, WQ index tab, data tab, and CSV download functions.
- The detailed measurement file is relatively large, so future optimization may include splitting data by irrigation district or another logical partition.

## Repository

https://github.com/jinkaizhang-gov/IDWQ-web
