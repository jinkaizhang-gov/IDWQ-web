import arcpy
import json
import os

# ---------------------------------------------------------
# USER INPUT
# ---------------------------------------------------------
INPUT_TABLE = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQwebtoolupdate20241114\IDWQ_Pro\IDWQ_update20241114\IDWQ_update20241114.gdb\IDWQSiteData"   # standalone table
OUTPUT_FILE = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\IDWQSiteData.geojson"

# ---------------------------------------------------------
# STEP 1: GET FIELD NAMES
# ---------------------------------------------------------
fields = [f.name for f in arcpy.ListFields(INPUT_TABLE)]

# All fields will be exported as text,
# except "Year" which becomes integer if possible.
print("Detected fields:", fields)

# ---------------------------------------------------------
# STEP 2: READ TABLE ROWS
# ---------------------------------------------------------
features = []

with arcpy.da.SearchCursor(INPUT_TABLE, fields) as cursor:

    for row in cursor:
        properties = {}

        for idx, field in enumerate(fields):
            val = row[idx]

            # === RULE FOR YEAR ==================================
            if field.lower() == "year":
                # convert to integer or None
                if val in (None, "", " "):
                    properties[field] = None
                else:
                    try:
                        properties[field] = int(val)
                    except:
                        # If Year stored as text like "2011 "
                        properties[field] = int(str(val).strip())
                continue

            # === ALL OTHER FIELDS AS TEXT =======================
            if val in (None, "", " "):
                properties[field] = None
            else:
                properties[field] = str(val)

        feature = {
            "type": "Feature",
            "geometry": None,
            "properties": properties
        }

        features.append(feature)

# ---------------------------------------------------------
# STEP 3: BUILD GEOJSON OBJECT
# ---------------------------------------------------------
geojson = {
    "type": "FeatureCollection",
    "features": features
}

# ---------------------------------------------------------
# STEP 4: WRITE FILE
# ---------------------------------------------------------
os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print("DONE →", OUTPUT_FILE)
print("Exported records:", len(features))
