import arcpy
import json
from pathlib import Path

# ============================================================
# USER INPUTS — UPDATE TO YOUR PROJECT
# ============================================================
GDB = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQwebtoolupdate20241114\IDWQ_Pro\IDWQ_update20241114\IDWQ_update20241114.gdb"

# OUTPUT ROOT FOLDER
OUT = Path(r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\Exports")
OUT.mkdir(parents=True, exist_ok=True)


# Feature class with geometry and metadata
FC_SITES = f"{GDB}\\IDWQSites"

# Index table (no geometry)
TB_INDEX = f"{GDB}\\IDWQIndexData"

# SiteData table (no geometry)
TB_SITEDATA = f"{GDB}\\IDWQSiteData"



# ============================================================
# FILE NAMES
# ============================================================
FILE_SITES = OUT / "WQ_Sites.geojson"
FILE_INDEX = OUT / "WQ_Index.geojson"
FILE_SITEDATA = OUT / "WQ_SiteData.geojson"
FILE_SITES_MERGED = OUT / "WQ_Sites_Merged.json"


# ============================================================
# 1) EXPORT FEATURE CLASS → WQ_Sites.geojson
# ============================================================
print("\n=== Exporting SITES (Feature Class → GeoJSON)…")
arcpy.conversion.FeaturesToJSON(
    in_features=FC_SITES,
    out_json_file=str(FILE_SITES),
    format_json="FORMATTED",
    include_z_values="NO_Z_VALUES",
    include_m_values="NO_M_VALUES",
    geoJSON="GEOJSON",
    outputToWGS84="WGS84",             # IMPORTANT
    use_field_alias="USE_FIELD_NAME"   # Use FIELD NAME, not alias
)
print("OK →", FILE_SITES)


# ============================================================
# 2) EXPORT INDEX TABLE → WQ_Index.geojson
# ============================================================
print("\n=== Exporting WQ INDEX TABLE…")

features = []
fields = ["Site", "IndexYear", "IndexValue"]

with arcpy.da.SearchCursor(TB_INDEX, fields) as cursor:
    for row in cursor:
        feature = {
            "type": "Feature",
            "geometry": None,
            "properties": {
                "Site": row[0],
                "IndexYear": row[1],
                "IndexValue": row[2]
            }
        }
        features.append(feature)

geojson = {"type": "FeatureCollection", "features": features}

with open(FILE_INDEX, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print("OK →", FILE_INDEX, "Records:", len(features))


# ============================================================
# 3) EXPORT RAW LAB TABLE → WQ_SiteData.geojson
# ============================================================
print("\n=== Exporting SITE DATA TABLE…")

fields = [f.name for f in arcpy.ListFields(TB_SITEDATA)]
features = []

with arcpy.da.SearchCursor(TB_SITEDATA, fields) as cursor:
    for row in cursor:
        properties = {}

        for idx, field in enumerate(fields):
            val = row[idx]

            # Convert "Year" into integer
            if field.lower() == "year":
                if val in (None, "", " "):
                    properties[field] = None
                else:
                    try:
                        properties[field] = int(val)
                    except:
                        properties[field] = int(str(val).strip())
                continue

            # Everything else → text or None
            if val in (None, "", " "):
                properties[field] = None
            else:
                properties[field] = str(val)

        features.append({
            "type": "Feature",
            "geometry": None,
            "properties": properties
        })

geojson = {"type": "FeatureCollection", "features": features}

with open(FILE_SITEDATA, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print("OK →", FILE_SITEDATA, "Records:", len(features))


# ============================================================
# 4) MERGE SITES + INDEX → WQ_Sites_Merged.json
# ============================================================
print("\n=== Merging Sites + Index Records…")

# Read Sites
with open(FILE_SITES, "r", encoding="utf-8") as f:
    sites = json.load(f)

# Read Index
with open(FILE_INDEX, "r", encoding="utf-8") as f:
    wq = json.load(f)

# Build lookup by site name
wq_lookup = {}
for feat in wq.get("features", []):
    props = feat["properties"]
    site = props.get("Site")
    if not site:
        continue
    rec = {
        "IndexYear": props.get("IndexYear"),
        "IndexValue": props.get("IndexValue"),
    }
    wq_lookup.setdefault(site, []).append(rec)

# MERGE
merged = {"type": "FeatureCollection", "features": []}

for feat in sites.get("features", []):
    props = feat["properties"]
    site_name = props.get("SiteName")

    new_props = dict(props)

    recs = wq_lookup.get(site_name, [])
    # clean + sort
    recs = [r for r in recs if r.get("IndexYear") is not None]
    recs = sorted(recs, key=lambda x: x["IndexYear"])

    new_props["WQIndexRecords"] = recs

    merged["features"].append({
        "type": "Feature",
        "geometry": feat.get("geometry"),
        "properties": new_props
    })

# Write merged file
with open(FILE_SITES_MERGED, "w", encoding="utf-8") as f:
    json.dump(merged, f, indent=2)

print("\nDONE — MERGED FILE CREATED:\n", FILE_SITES_MERGED)
