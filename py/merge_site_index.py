import json
from pathlib import Path

# ------------------------------------------------------------------
# INPUT FILES (you can change these paths if needed)
# ------------------------------------------------------------------
sites_file = Path(r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\WQ_Sites.geojson")
index_file = Path(r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\WQ_Index.geojson")

# ------------------------------------------------------------------
# OUTPUT FILE
# ------------------------------------------------------------------
output_file = Path(r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\WQ_Sites_Merged.json")

# ------------------------------------------------------------------
# LOAD INPUT DATA
# ------------------------------------------------------------------
print("Loading sites…")
with sites_file.open("r", encoding="utf-8") as f:
    sites = json.load(f)

print("Loading index records…")
with index_file.open("r", encoding="utf-8") as f:
    wq = json.load(f)


# ------------------------------------------------------------------
# BUILD LOOKUP FOR INDEX RECORDS
# ------------------------------------------------------------------
wq_lookup = {}

for feat in wq.get("features", []):
    props = feat.get("properties", {})
    
    # IMPORTANT — determine the correct join field
    # either SiteName or Site field depending on your schema
    site = props.get("SiteName") or props.get("Site")
    if not site:
        continue
    
    record = {
        "IndexYear": props.get("IndexYear"),
        "IndexValue": props.get("IndexValue")
    }
    
    wq_lookup.setdefault(site, []).append(record)


# ------------------------------------------------------------------
# MERGE SITES WITH WQ RECORDS
# ------------------------------------------------------------------
merged = {
    "type": "FeatureCollection",
    "features": []
}

for feat in sites.get("features", []):
    props = feat.get("properties", {})
    site_name = props.get("SiteName")

    # clone geometry + attributes
    new_props = dict(props)

    # attach matching WQ records
    recs = wq_lookup.get(site_name, [])
    # remove missing years & sort
    recs = [r for r in recs if r.get("IndexYear") is not None]
    recs = sorted(recs, key=lambda x: x["IndexYear"])

    new_props["WQIndexRecords"] = recs

    merged["features"].append({
        "type": "Feature",
        "geometry": feat.get("geometry"),
        "properties": new_props
    })


# ------------------------------------------------------------------
# SAVE OUTPUT
# ------------------------------------------------------------------
with output_file.open("w", encoding="utf-8") as f:
    json.dump(merged, f, indent=2)

print(f"\nDONE — merged file created:\n{output_file.resolve()}")
