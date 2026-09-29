import arcpy
import os


INPUT_fc = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQwebtoolupdate20241114\IDWQ_Pro\IDWQ_update20241114\IDWQ_update20241114.gdb\IDWQSites"   # standalone table
OUTPUT_FILE = r"C:\_LOCALdata\IDWQDataToolUpdate\IDWQ-Root - working\temp\test.geojson"

arcpy.conversion.FeaturesToJSON(
    in_features=INPUT_fc,
    out_json_file=OUTPUT_FILE,
    format_json="FORMATTED",
    include_z_values="NO_Z_VALUES",
    include_m_values="NO_M_VALUES",
    geoJSON="GEOJSON",
    outputToWGS84="WGS84",
    use_field_alias="USE_FIELD_NAME"
)

print("Export completed:", OUTPUT_FILE)

