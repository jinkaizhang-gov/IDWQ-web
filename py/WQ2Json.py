import arcpy
import json

# paths
table = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQwebtoolupdate20241114\IDWQ_Pro\IDWQ_update20241114\IDWQ_update20241114.gdb\IDWQIndexData"   # standalone table
output = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\WQ_Index.geojson"

features = []
fields = ["Site", "IndexYear", "IndexValue"]  # REQUIRED

with arcpy.da.SearchCursor(table, fields) as cursor:
    for row in cursor:
        feature = {
            "type": "Feature",
            "geometry": None,   # important, tabular only
            "properties": {
                "Site": row[0],
                "IndexYear": row[1],
                "IndexValue": row[2]
            }
        }
        features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

# write file
with open(output, "w", encoding="utf-8") as f:
    json.dump(geojson, f, ensure_ascii=False, indent=2)

print("DONE:", output)
