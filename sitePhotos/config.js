define([
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/Color",
    "esri/InfoTemplate",
    "esri/geometry/Extent",
    "esri/SpatialReference",
    "dojo/date/locale",
    "dojo/text!/individual.html",
    "dojo/domReady!"
], function (
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    PictureMarkerSymbol,
    Color,
    InfoTemplate,
    Extent,
    SpatialReference,
    locale,
    popupContent
) {
    /** properties of the fill symbol for the LBP search, must be defined outside the object literal **/

    //    var resultSimpleLineJSON = {
    //        "type": "esriSLS",
    //        "style": "esriSLSSolid",
    //        "color": [0,255,255,255],
    //        "width": 3
    //    };
    //    
    var operationalLayer = "https://maps.alberta.ca/genesis_tokenauth/rest/services/IDWQDataTool-Layers/20190204/MapServer";
    var IDWQDataTableURL = "https://maps.alberta.ca/genesis_tokenauth/rest/services/IDWQDataTool-Layers/20190204/MapServer/3";

    var config = {

        /** draft site configuration */

        basemap: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/",
        opLayer: operationalLayer,
        initialExtent: new Extent(-12838363, 6233724, -12073993, 6719252, new SpatialReference(102100)),

        pageTitle: "Irrigation District Water Quality Data Tool",

        tabsId: "menuTabs",
        dijitIdSBDistrict: "SBDistrictTool",
        dijitIdWQIndex: "WQIndexTool",
        dijitIdFBPostalCode: "FBPostalCodeTool",
        dijitIdDownloadTermsDialog: "downloadTermsDialog",
        dijitIdDismissButton: "dismissTerms",
        dijitIdFBLegalLandLocation: "FBLegalLandDescriptionTool",
        dijitIdFBAddress: "FBAddressTool",
        dijitIdFBLotBlockPlan: "FBLotBlockPlanTool",
        dijitIdMeasure: "measureTool",
        dijitIdPrint: "printTool",

        menuButtonId: "menubutton",
        menuId: "menu",
        scalebarId: "scalebarContainer",
        desktopWidthThresholdInPixels: 900,

        /*************************** Map Query Layers config ***************************/
        /** assume that the layers are in the operational map service **/
        mapQueryLayers: [{
            serviceLayer: operationalLayer + "/0",
            outFields: ["IrrigationFarmWater.GDB.IDWQSites.OBJECTID", "IrrigationFarmWater.GDB.IDWQSites.SiteName", "IrrigationFarmWater.GDB.IDWQSites.SiteDescription", "IrrigationFarmWater.GDB.IDWQSites.IrrDist", "IrrigationFarmWater.GDB.IDWQSites.SiteType", "IrrigationFarmWater.GDB.IDWQSites.SiteStatus"],
            orderByFields: ["IrrigationFarmWater.GDB.IDWQSites.SiteName"],
            displayField: ["IrrigationFarmWater.GDB.IDWQSites.SiteName"],
            queryField: ["IrrigationFarmWater.GDB.IDWQSites.IrrDist"],
            infoTemplate: new InfoTemplate("Site Name: ${IrrigationFarmWater.GDB.IDWQSites.SiteName}", popupContent),
            resultSymbol: new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                17,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([255, 0, 0, 1]), 3),
                new Color([0, 0, 0, 0])
            ),
            minScale: 100000000,
            maxScale: 0
        }],

        IDWQDataTable: {
            tableURL: IDWQDataTableURL,
            columns:
                { "IrrDist": { "fieldName": "Irrigation District", "units": "", "guideline": "" }, "Site": { "fieldName": "Site", "units": "", "guideline": "" }, "MeasureYear": { "fieldName": "Year", "units": "", "guideline": "" }, "MeasureTimeStamp": { "fieldName": "Time Stamp", "units": "", "guideline": "" }, "WaterTemp": { "fieldName": "Water Temperature", "units": "degrees C", "guideline": "" }, "TSS": { "fieldName": "Total Suspended Solids", "units": "mg/L", "guideline": "" }, "pH": { "fieldName": "pH", "units": "", "guideline": "" }, "EC": { "fieldName": "Electric conductivity", "units": "dS/m", "guideline": "" }, "Ca_Diss": { "fieldName": "Dissolved Calcium", "units": "mg/L", "guideline": "" }, "Mg_Diss": { "fieldName": "Dissolved Magnesium", "units": "mg/L", "guideline": "" }, "Na_Diss": { "fieldName": "Dissolved Sodium", "units": "mg/L", "guideline": "" }, "K_Diss": { "fieldName": "Dissolved Potassium", "units": "mg/L", "guideline": "" }, "SAR": { "fieldName": "Sodium adsorption ratio", "units": "", "guideline": "guideline: 5" }, "Fe_Diss": { "fieldName": "Dissolved Iron", "units": "mg/L", "guideline": "" }, "Mn_Diss": { "fieldName": "Dissolved Manganese", "units": "mg/L", "guideline": "" }, "Cl": { "fieldName": "Chloride", "units": "mg/L", "guideline": "guideline: 178 mg/L" }, "SO4": { "fieldName": "Sulphate", "units": "mg/L", "guideline": "" }, "HCO3": { "fieldName": "Bicarbonate as CaCO3", "units": "mg/L", "guideline": "" }, "CO3": { "fieldName": "Carbonate as CaCO3", "units": "mg/L", "guideline": "" }, "OH": { "fieldName": "Hydroxide as CaCO3", "units": "mg/L", "guideline": "" }, "Alk": { "fieldName": "Total Alkalinity as CaCO3", "units": "mg/L", "guideline": "" }, "Hard": { "fieldName": "Hardness as CaCO3", "units": "mg/L", "guideline": "" }, "Ion": { "fieldName": "Ion Balance", "units": "%", "guideline": "" }, "TDS": { "fieldName": "Total dissolved solids", "units": "mg/L", "guideline": "guideline: 500 mg/L" }, "TN": { "fieldName": "Total nitrogen", "units": "mg/L", "guideline": "" }, "TKN": { "fieldName": "Toltal kjeldahl nitrogen", "units": "mg/L", "guideline": "" }, "NO3_N": { "fieldName": "Nitrate as N", "units": "mg/L", "guideline": "" }, "NO2_N": { "fieldName": "Nitrite as N", "units": "mg/L", "guideline": "" }, "NO3_N_NO2_N": { "fieldName": "Nitrate as N + Nitrite as N", "units": "mg/L", "guideline": "" }, "NH3_N": { "fieldName": "Ammonia as N", "units": "mg/L", "guideline": "" }, "TP": { "fieldName": "Total phosphorus", "units": "mg/L", "guideline": "" }, "TDP": { "fieldName": "Total dissolved phosphorus", "units": "mg/L", "guideline": "" }, "PO4_P": { "fieldName": "Dissolved reactive phosphorus", "units": "mg/L", "guideline": "" }, "Chl_a": { "fieldName": "Chlorophyll-a", "units": "mg/L", "guideline": "" }, "E_coli": { "fieldName": "Escherichia coli", "units": "cfu/100mL", "guideline": "guideline: 100 cfu/100mL" }, "Al": { "fieldName": "Aluminium total", "units": "mg/L", "guideline": "guideline: 5 mg/L" }, "Sb": { "fieldName": "Antimony total", "units": "mg/L", "guideline": "" }, "As_": { "fieldName": "Arsenic total", "units": "mg/L", "guideline": "guideline: 0.16 mg/L" }, "Ba": { "fieldName": "Barium total", "units": "mg/L", "guideline": "" }, "Be": { "fieldName": "Beryllium total", "units": "mg/L", "guideline": "guideline: 0.1 mg/L" }, "Bi": { "fieldName": "Bismuth total", "units": "mg/L", "guideline": "" }, "B": { "fieldName": "Boron total", "units": "mg/L", "guideline": "guideline: 0.5 mg/L" }, "Cd": { "fieldName": "Cadmium total", "units": "mg/L", "guideline": "guideline: 8.2 mg/L" }, "Cr": { "fieldName": "Chromium total", "units": "mg/L", "guideline": "guideline: 4.9 mg/L" }, "Co": { "fieldName": "Cobalt total", "units": "mg/L", "guideline": "guideline: 0.05 mg/L" }, "Cu": { "fieldName": "Copper total", "units": "mg/L", "guideline": "guideline: 0.2 mg/L" }, "Fe": { "fieldName": "Iron total", "units": "mg/L", "guideline": "guideline: 5.0 mg/L" }, "Pb": { "fieldName": "Lead total", "units": "mg/L", "guideline": "guideline: 0.2 mg/L" }, "Li": { "fieldName": "Lithium total", "units": "mg/L", "guideline": "guideline: 2.5 mg/L" }, "Mg": { "fieldName": "Magnesium total", "units": "mg/L", "guideline": "" }, "Mn": { "fieldName": "Manganese total", "units": "mg/L", "guideline": "guideline: 0.2 mg/L" }, "Hg": { "fieldName": "Mercury total", "units": "mg/L", "guideline": "" }, "Mo": { "fieldName": "Molybdenum total", "units": "mg/L", "guideline": "guideline: 0.01 mg/L" }, "Ni": { "fieldName": "Nickel total", "units": "mg/L", "guideline": "guideline: 0.2 mg/L" }, "K": { "fieldName": "Potassium total", "units": "mg/L", "guideline": "" }, "Se": { "fieldName": "Selenium total", "units": "mg/L", "guideline": "guideline: 0.02 mg/L" }, "Si": { "fieldName": "Silicon total", "units": "mg/L", "guideline": "" }, "Ag": { "fieldName": "Silver total", "units": "mg/L", "guideline": "" }, "Na": { "fieldName": "Sodium total", "units": "mg/L", "guideline": "" }, "Sr": { "fieldName": "Strontium total", "units": "mg/L", "guideline": "" }, "S": { "fieldName": "Sulfur total", "units": "mg/L", "guideline": "" }, "Tl": { "fieldName": "Thallium total", "units": "mg/L", "guideline": "" }, "Sn": { "fieldName": "Tin total", "units": "mg/L", "guideline": "" }, "Ti": { "fieldName": "Titanium total", "units": "mg/L", "guideline": "" }, "U": { "fieldName": "Uranium total", "units": "mg/L", "guideline": "guideline: 0.01 mg/L" }, "V": { "fieldName": "Vanadium total", "units": "mg/L", "guideline": "guideline: 0.1 mg/L" }, "Zn": { "fieldName": "Zinc total", "units": "mg/L", "guideline": "guideline: 5.0 mg/L" }, "AMPA": { "fieldName": "Aminomethyl phosphonic acid", "units": "ug/L", "guideline": "" }, "Gluf": { "fieldName": "Glufosinate", "units": "ug/L", "guideline": "" }, "Glyph": { "fieldName": "Glyphosate", "units": "ug/L", "guideline": "" }, "F2_4_D": { "fieldName": "2,4-Dichlorophenoxyacetic acid", "units": "ug/L", "guideline": "" }, "F2_4_DB": { "fieldName": "4-(2,4-dichlorophenoxy)butyric acid", "units": "ug/L", "guideline": "" }, "F2_4_DCP": { "fieldName": "2,4-Dichlorophenol", "units": "ug/L", "guideline": "" }, "Alac": { "fieldName": "Alachlor", "units": "ug/L", "guideline": "" }, "Aldr": { "fieldName": "Aldrin", "units": "ug/L", "guideline": "" }, "Alli": { "fieldName": "Allidochlor", "units": "ug/L", "guideline": "" }, "Atra": { "fieldName": "Atrazine", "units": "ug/L", "guideline": "guideline: 10 ug/L" }, "Azin": { "fieldName": "Azinphos-methyl", "units": "ug/L", "guideline": "" }, "Azos": { "fieldName": "Azoxystrobin", "units": "ug/L", "guideline": "" }, "Bena": { "fieldName": "Benalaxyl", "units": "ug/L", "guideline": "" }, "Benf": { "fieldName": "Benfluralin", "units": "ug/L", "guideline": "" }, "Bent": { "fieldName": "Bentazon", "units": "ug/L", "guideline": "" }, "Benz": { "fieldName": "Benzoylprop-Ethyl", "units": "ug/L", "guideline": "" }, "Bifz": { "fieldName": "Bifenazate", "units": "ug/L", "guideline": "" }, "Bife": { "fieldName": "Bifenthrin", "units": "ug/L", "guideline": "" }, "Broc": { "fieldName": "Bromacil", "units": "ug/L", "guideline": "guideline: 0.2 ug/L" }, "Bro_E": { "fieldName": "Bromophos-Ethyl", "units": "ug/L", "guideline": "" }, "Brop": { "fieldName": "Bromopropylate", "units": "ug/L", "guideline": "" }, "Brox": { "fieldName": "Bromoxynil", "units": "ug/L", "guideline": "guideline: 0.44 ug/L" }, "Bosc": { "fieldName": "Boscalid", "units": "ug/L", "guideline": "" }, "Bupi": { "fieldName": "Bupirimate", "units": "ug/L", "guideline": "" }, "Buta": { "fieldName": "Butachlor", "units": "ug/L", "guideline": "" }, "Butr": { "fieldName": "Butralin", "units": "ug/L", "guideline": "" }, "Buty": { "fieldName": "Butylate", "units": "ug/L", "guideline": "" }, "Capt": { "fieldName": "Captan", "units": "ug/L", "guideline": "" }, "Carb": { "fieldName": "Carbaryl", "units": "ug/L", "guideline": "" }, "Crbf": { "fieldName": "Carbofuran", "units": "ug/L", "guideline": "" }, "Carf": { "fieldName": "Carfentrazone-ethyl", "units": "ug/L", "guideline": "" }, "c_Chl": { "fieldName": "cis-Chlordane", "units": "ug/L", "guideline": "" }, "t_Ch": { "fieldName": "t-Chlordane", "units": "ug/L", "guideline": "" }, "Chmp": { "fieldName": "Chlormephos", "units": "ug/L", "guideline": "" }, "Chrn": { "fieldName": "Chloroneb", "units": "ug/L", "guideline": "" }, "Chlo": { "fieldName": "Chlorothalonil", "units": "ug/L", "guideline": "" }, "Chpy": { "fieldName": "Chlorpyrifos", "units": "ug/L", "guideline": "" }, "Chl_M": { "fieldName": "Chlorpyrifos-Methyl", "units": "ug/L", "guideline": "" }, "Chl_D": { "fieldName": "Chlorthal-Dimethyl", "units": "ug/L", "guideline": "" }, "Chtm": { "fieldName": "Chlorthiamid", "units": "ug/L", "guideline": "" }, "Clod": { "fieldName": "Clodinafop-propargyl", "units": "ug/L", "guideline": "" }, "Clom": { "fieldName": "Clomazone", "units": "ug/L", "guideline": "" }, "Clop": { "fieldName": "Clopyralid", "units": "ug/L", "guideline": "" }, "Cycl": { "fieldName": "Cycloate", "units": "ug/L", "guideline": "" }, "Cyfl": { "fieldName": "Cyfluthrin", "units": "ug/L", "guideline": "" }, "Cypb": { "fieldName": "Cypermethrin-beta", "units": "ug/L", "guideline": "" }, "Cypz": { "fieldName": "Cypermethrin-zeta", "units": "ug/L", "guideline": "" }, "CyhL": { "fieldName": "Cyhalothrin lambda", "units": "ug/L", "guideline": "" }, "Cypr": { "fieldName": "Cyprodinil", "units": "ug/L", "guideline": "" }, "o_p_DDD": { "fieldName": "o,p-Dichlorodiphenyldichloroethane", "units": "ug/L", "guideline": "" }, "p_p_DDD": { "fieldName": "p,p-Dichlorodiphenyldichloroethane", "units": "ug/L", "guideline": "" }, "o_p_DDE": { "fieldName": "o,p-Dichlorodiphenyldichloroethylene", "units": "ug/L", "guideline": "" }, "p_p_DDE": { "fieldName": "p,p-Dichlorodiphenyldichloroethylene", "units": "ug/L", "guideline": "" }, "o_p_DDT": { "fieldName": "o,p-Dichlorodiphenyltrichloroethane", "units": "ug/L", "guideline": "" }, "p_p_DDT": { "fieldName": "p,p-Dichlorodiphenyltrichloroethane", "units": "ug/L", "guideline": "" }, "Delt": { "fieldName": "Deltamethrin", "units": "ug/L", "guideline": "" }, "Desm": { "fieldName": "Desmetryn", "units": "ug/L", "guideline": "" }, "Diaz": { "fieldName": "Diazinon", "units": "ug/L", "guideline": "" }, "Dicm": { "fieldName": "Dicamba", "units": "ug/L", "guideline": "guideline: 0.026 ug/L" }, "Dicb": { "fieldName": "Dichlobenil", "units": "ug/L", "guideline": "" }, "Dcpr": { "fieldName": "Dichlorprop", "units": "ug/L", "guideline": "" }, "Dicv": { "fieldName": "Dichlorvos", "units": "ug/L", "guideline": "" }, "Dicl": { "fieldName": "Dichlofenthion", "units": "ug/L", "guideline": "" }, "Dicf": { "fieldName": "Diclofop", "units": "ug/L", "guideline": "guideline: 0.24 ug/L" }, "Diel": { "fieldName": "Dieldrin", "units": "ug/L", "guideline": "" }, "Dife": { "fieldName": "Difenoconazole", "units": "ug/L", "guideline": "" }, "Dimc": { "fieldName": "Dimethachlor", "units": "ug/L", "guideline": "" }, "Dime": { "fieldName": "Dimethoate", "units": "ug/L", "guideline": "" }, "Diox": { "fieldName": "Dioxathion", "units": "ug/L", "guideline": "" }, "Diph": { "fieldName": "Diphenamid", "units": "ug/L", "guideline": "" }, "Endo": { "fieldName": "alpha-Endosulfan", "units": "ug/L", "guideline": "" }, "Endr": { "fieldName": "Endrin", "units": "ug/L", "guideline": "" }, "EPTC": { "fieldName": "EPTC (S-ethyl dipropylthiocarbamate)", "units": "ug/L", "guideline": "" }, "Etfl": { "fieldName": "Ethalfluralin", "units": "ug/L", "guideline": "" }, "Ethi": { "fieldName": "Ethion", "units": "ug/L", "guideline": "" }, "Etho": { "fieldName": "Ethofumesate", "units": "ug/L", "guideline": "" }, "Etra": { "fieldName": "Etradiazole", "units": "ug/L", "guideline": "" }, "Etri": { "fieldName": "Etrimphos", "units": "ug/L", "guideline": "" }, "Famx": { "fieldName": "Famoxadone", "units": "ug/L", "guideline": "" }, "Fena": { "fieldName": "Fenamidone", "units": "ug/L", "guideline": "" }, "Fenc": { "fieldName": "Fenchlorphos", "units": "ug/L", "guideline": "" }, "Feno": { "fieldName": "Fenoxaprop", "units": "ug/L", "guideline": "" }, "Fent": { "fieldName": "Fenthion", "units": "ug/L", "guideline": "" }, "Fla_I": { "fieldName": "Flamprop-Isopropyl", "units": "ug/L", "guideline": "" }, "Fla_M": { "fieldName": "Flamprop-Methyl", "units": "ug/L", "guideline": "" }, "Flua": { "fieldName": "Fluazifop-p-butyl", "units": "ug/L", "guideline": "" }, "Flud": { "fieldName": "Fludioxonil", "units": "ug/L", "guideline": "" }, "Flum": { "fieldName": "Flumetralin", "units": "ug/L", "guideline": "" }, "Flux": { "fieldName": "Flumioxazin", "units": "ug/L", "guideline": "" }, "Flur": { "fieldName": "Fluroxypyr", "units": "ug/L", "guideline": "" }, "Folp": { "fieldName": "Folpet", "units": "ug/L", "guideline": "" }, "Fono": { "fieldName": "Fonofos", "units": "ug/L", "guideline": "" }, "a_HCH": { "fieldName": "Hexachlorocyclohexane-alpha", "units": "ug/L", "guideline": "" }, "b_HCH": { "fieldName": "Hexachlorocyclohexane-beta", "units": "ug/L", "guideline": "" }, "d_HCH": { "fieldName": "Hexachlorocyclohexane-delta", "units": "ug/L", "guideline": "" }, "Lind": { "fieldName": "Lindane (Hexachlorocyclohexane-gamma)", "units": "ug/L", "guideline": "" }, "Hept": { "fieldName": "Heptachlor", "units": "ug/L", "guideline": "" }, "HepE": { "fieldName": "trans-Heptachlor Epoxide", "units": "ug/L", "guideline": "" }, "HexZ": { "fieldName": "Hexazinone", "units": "ug/L", "guideline": "" }, "Imzb": { "fieldName": "Imazamethabenz", "units": "ug/L", "guideline": "" }, "Imaz": { "fieldName": "Imazethapyr", "units": "ug/L", "guideline": "" }, "Ipco": { "fieldName": "Ipconazole", "units": "ug/L", "guideline": "" }, "Ipro": { "fieldName": "Iprodione", "units": "ug/L", "guideline": "" }, "Isof": { "fieldName": "Isofenphos", "units": "ug/L", "guideline": "" }, "Mala": { "fieldName": "Malathion", "units": "ug/L", "guideline": "" }, "MCPA": { "fieldName": "MCPA (2-methyl-4-chlorophenoxyacetic acid)", "units": "ug/L", "guideline": "guideline: 0.04 ug/L" }, "MCPA_EHE": { "fieldName": "MCPA-EHE", "units": "ug/L", "guideline": "" }, "MCPB": { "fieldName": "MCPB-methyl", "units": "ug/L", "guideline": "" }, "MCPP": { "fieldName": "Mecoprop (methylchlorophenoxypropionic acid)", "units": "ug/L", "guideline": "" }, "Meta": { "fieldName": "Metalaxyl", "units": "ug/L", "guideline": "" }, "Mecz": { "fieldName": "Metconazole", "units": "ug/L", "guideline": "" }, "Metp": { "fieldName": "Methoprene", "units": "ug/L", "guideline": "" }, "Metc": { "fieldName": "Methoxychlor", "units": "ug/L", "guideline": "" }, "Meto": { "fieldName": "Metolachlor", "units": "ug/L", "guideline": "guideline: 28 ug/L" }, "Metb": { "fieldName": "Metribuzin", "units": "ug/L", "guideline": "guideline: 0.5 ug/L" }, "Mire": { "fieldName": "Mirex", "units": "ug/L", "guideline": "" }, "MonL": { "fieldName": "Monolinuron", "units": "ug/L", "guideline": "" }, "Mycb": { "fieldName": "Myclobutanil", "units": "ug/L", "guideline": "" }, "Nale": { "fieldName": "Naled", "units": "ug/L", "guideline": "" }, "Napr": { "fieldName": "Napropamide", "units": "ug/L", "guideline": "" }, "Nico": { "fieldName": "Nicotine", "units": "ug/L", "guideline": "" }, "Nitr": { "fieldName": "Nitrapyrin", "units": "ug/L", "guideline": "" }, "Oxyc": { "fieldName": "Oxycarboxin", "units": "ug/L", "guideline": "" }, "Oxfl": { "fieldName": "Oxyfluorfen", "units": "ug/L", "guideline": "" }, "Pend": { "fieldName": "Pendimethalin", "units": "ug/L", "guideline": "" }, "c_Per": { "fieldName": "cis-Permethrin", "units": "ug/L", "guideline": "" }, "t_Per": { "fieldName": "trans-Permethrin", "units": "ug/L", "guideline": "" }, "Phor": { "fieldName": "Phorate", "units": "ug/L", "guideline": "" }, "Picl": { "fieldName": "Picloram", "units": "ug/L", "guideline": "" }, "Pico": { "fieldName": "Picoxystrobin", "units": "ug/L", "guideline": "" }, "PipB": { "fieldName": "Piperonyl butoxide", "units": "ug/L", "guideline": "" }, "Pica": { "fieldName": "Pirimicarb", "units": "ug/L", "guideline": "" }, "Pir_E": { "fieldName": "Pirimiphos-Ethyl", "units": "ug/L", "guideline": "" }, "Pir_M": { "fieldName": "Pirimiphos-Methyl", "units": "ug/L", "guideline": "" }, "Proc_": { "fieldName": "Procymidone", "units": "ug/L", "guideline": "" }, "Prom": { "fieldName": "Prometon", "units": "ug/L", "guideline": "" }, "Prty": { "fieldName": "Prometryn", "units": "ug/L", "guideline": "" }, "Prof": { "fieldName": "Propetamphos", "units": "ug/L", "guideline": "" }, "Prop": { "fieldName": "Propham", "units": "ug/L", "guideline": "" }, "Proi": { "fieldName": "Propiconazole", "units": "ug/L", "guideline": "" }, "Prox": { "fieldName": "Propoxur", "units": "ug/L", "guideline": "" }, "Proa": { "fieldName": "Propyzamide", "units": "ug/L", "guideline": "" }, "ProD": { "fieldName": "Prothioconazole-Desthio", "units": "ug/L", "guideline": "" }, "Pyme": { "fieldName": "Pymetrozine", "units": "ug/L", "guideline": "" }, "Pyra": { "fieldName": "Pyraclostrobin", "units": "ug/L", "guideline": "" }, "Pyrd": { "fieldName": "Pyridaben", "units": "ug/L", "guideline": "" }, "Pyrm": { "fieldName": "Pyrimethanil", "units": "ug/L", "guideline": "" }, "Quin": { "fieldName": "Quinclorac", "units": "ug/L", "guideline": "" }, "Quit": { "fieldName": "Quintozene", "units": "ug/L", "guideline": "" }, "Quiz": { "fieldName": "Quizalofop-ethyl", "units": "ug/L", "guideline": "" }, "Sima": { "fieldName": "Simazine", "units": "ug/L", "guideline": "guideline: 0.5 ug/L" }, "Spir": { "fieldName": "Spiromesifen", "units": "ug/L", "guideline": "" }, "Slfz": { "fieldName": "Sulfentrazone", "units": "ug/L", "guideline": "" }, "Sulf": { "fieldName": "Sulfotep", "units": "ug/L", "guideline": "" }, "Sulp": { "fieldName": "Sulprophos", "units": "ug/L", "guideline": "" }, "Tebu": { "fieldName": "Tebuconazole", "units": "ug/L", "guideline": "" }, "Tebc": { "fieldName": "Terbacil", "units": "ug/L", "guideline": "" }, "Tebf": { "fieldName": "Terbufos", "units": "ug/L", "guideline": "" }, "Tebt": { "fieldName": "Terbutryn", "units": "ug/L", "guideline": "" }, "Tefo": { "fieldName": "Tetradifon", "units": "ug/L", "guideline": "" }, "Tetm": { "fieldName": "Tetramethrin I", "units": "ug/L", "guideline": "" }, "Tesu": { "fieldName": "Tetrasul", "units": "ug/L", "guideline": "" }, "Tral": { "fieldName": "Triallate", "units": "ug/L", "guideline": "" }, "Tric": { "fieldName": "Triclopyr", "units": "ug/L", "guideline": "" }, "Trif": { "fieldName": "Trifloxystrobin", "units": "ug/L", "guideline": "" }, "Trfl": { "fieldName": "Trifluralin", "units": "ug/L", "guideline": "" }, "Trit": { "fieldName": "Triticonazole", "units": "ug/L", "guideline": "" }, "Vinc": { "fieldName": "Vinclozolin", "units": "ug/L", "guideline": "" }, "Zoxm": { "fieldName": "Zoxamide", "units": "ug/L", "guideline": "" } }
            ,
            IrrDistField: "IrrDist",
            SiteNameField: "Site",
            outFields: ["*"],
            orderByFields: ["IrrDist ASC", "Site ASC", "MeasureTimeStamp ASC"],
            ignoreFields: ["OBJECTID", "MeasureId"],
            formatFields: [{
                fieldName: "MeasureTimeStamp",
                fieldType: Date,
                format: function (inputDate) {
                    return locale.format(inputDate, { datePattern: "yyyy'-'MM'-'dd' 'HH':'mm':'ss", selector: "date" });
                }
            }],
            maxRecordsPerQuery: 1000
        },
        mapClickBufferInPixels: 5,
        /*************************** End Map Query Layers config ***************************/


        /*************************** disable map highlight of features ***************************/
        noHighlightMarker: new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_X,
            0,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL,
                new Color([0, 0, 0, 0]), 0),
            new Color([0, 0, 0, 0])
        ),

        noHighlightLine: new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_NULL,
            new Color([0, 0, 0, 0]),
            1
        ),

        noHighlightFill: new SimpleFillSymbol(
            SimpleFillSymbol.STYLE_NULL,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_NULL, new Color([0, 0, 0, 0]), 1),
            new Color([0, 0, 0, 0])
        ),
        /*************************** End disable map highlight of features ***************************/




        /*************************** Measure config ***************************/
        units: [
            { label: "Metres", displayLength: " m", displayArea: " m²", lengthUnit: "meters", areaUnit: "square-meters", defaultUnit: true },
            { label: "Kilometres", displayLength: " km", displayArea: " km²", lengthUnit: "kilometers", areaUnit: "square-kilometers" },
            { label: "Feet", displayLength: " ft", displayArea: " ft²", lengthUnit: "feet", areaUnit: "square-feet" },
            { label: "Miles", displayLength: " miles", displayArea: " miles²", lengthUnit: "miles", areaUnit: "square-miles" }
        ],
        rounding: 2,
        measureUnitsToolbarId: "measureUnitsToolbar",
        measureFillSymbol: new SimpleFillSymbol({
            "type": "esriSFS",
            "style": "esriSFSSolid",
            "color": [0, 100, 255, 80],
            "outline": {
                "type": "esriSLS",
                "style": "esriSLSSolid",
                "color": [0, 0, 0, 255],
                "width": 2
            }
        }),
        measureLineSymbol: new SimpleLineSymbol({
            "type": "esriSLS",
            "style": "esriSLSSolid",
            "color": [0, 0, 0, 255],
            "width": 2
        }),
        /*************************** End Measure config ***************************/


        /*************************** district search config ***************************/
        districtList: [
            { name: "All Sites", code: "*", extent: { MinX: 563789, MinY: 5671809, MaxX: 572695, MaxY: 5688067 } },
            { name: "Alberta Environment & Parks Canals", code: "AEP Canals", extent: { MinX: 563789, MinY: 5671809, MaxX: 572695, MaxY: 5688067 } },
            { name: "Aetna Irrigation District", code: "AID", extent: { MinX: 531165, MinY: 5988463, MaxX: 545782, MaxY: 5997835 } },
            { name: "Bow River Irrigation District", code: "BRID", extent: { MinX: 479276, MinY: 5649043, MaxX: 494795, MaxY: 5659365 } },
            { name: "Eastern Irrigation District", code: "EID", extent: { MinX: 546785, MinY: 5607131, MaxX: 557938, MaxY: 5618020 } },
            { name: "Lethbridge Northern Irrigation District", code: "LNID", extent: { MinX: 525203, MinY: 5638020, MaxX: 534023, MaxY: 5646465 } },
            { name: "Magrath Irrigation District", code: "MID", extent: { MinX: 547215, MinY: 5627204, MaxX: 585594, MaxY: 5672389 } },
            { name: "Mountain View Irrigation District", code: "MVID", extent: { MinX: 640748, MinY: 5868667, MaxX: 649052, MaxY: 5880366 } },
            { name: "Raymond Irrigation District", code: "RID", extent: { MinX: 467565, MinY: 5648643, MaxX: 485284, MaxY: 5665781 } },
            { name: "Ross Creek Irrigation District", code: "RCID", extent: { MinX: 623853, MinY: 5699230, MaxX: 633180, MaxY: 5706530 } },
            { name: "St. Mary River Irrigation District", code: "SMRID", extent: { MinX: 619127, MinY: 5443835, MaxX: 627991, MaxY: 5452652 } },
            { name: "Taber Irrigation District", code: "TID", extent: { MinX: 528698, MinY: 5655959, MaxX: 553235, MaxY: 5674438 } },
            { name: "United Irrigation District", code: "UID", extent: { MinX: 524682, MinY: 5483526, MaxX: 550331, MaxY: 5499261 } },
            { name: "Western Irrigation District", code: "WID", extent: { MinX: 578022, MinY: 5906358, MaxX: 593297, MaxY: 5917835 } }
        ],

        /*************************** End District search config ***************************/

        /*************************** START: Irrigation Water Quality Index config ***************************/
        idwqiYears: [
            { name: "2018", code: "2018" },
            { name: "2017", code: "2017" },
            { name: "2016", code: "2016" },
            { name: "2015", code: "2015" },
            { name: "2014", code: "2014" },
            { name: "2013", code: "2013" },
            { name: "2012", code: "2012" },
            { name: "2011", code: "2011" }
        ],
        defaultYear: 2018,
        /** assume that the layers are in the base map service **/
        idwqiLayer: {
            uri: operationalLayer + "/0",
            outFields: ["IrrigationFarmWater.GDB.IDWQSites.OBJECTID", "IrrigationFarmWater.GDB.IDWQSites.SiteName", "IrrigationFarmWater.GDB.IDWQSites.SiteDescription", "IrrigationFarmWater.GDB.IDWQSites.IrrDist", "IrrigationFarmWater.GDB.IDWQSites.SiteType", "IrrigationFarmWater.GDB.IDWQSites.SiteStatus", "IDWQIndexData.IndexYear", "IDWQIndexData.IndexValue"],

            labelInfo: {
                labelExpressionInfo: { "value": "{IrrigationFarmWater.GDB.IDWQSites.SiteName}" },
                useCodedValues: false,
                labelPlacement: "above-right",
                symbol: {
                    color: [0, 0, 0, 255],
                    backgroundColor: null,
                    borderLineColor: null,
                    haloColor: [255, 255, 255, 255],
                    haloSize: 1.5,
                    angle: 0,
                    xoffset: 0,
                    yoffset: 0,
                    font: {
                        family: "Arial",
                        size: 10,
                        style: "normal",
                        weight: "bold",
                        decoration: "none"
                    }
                }
            },
            //infoTemplate: new InfoTemplate("Site Name: ${IrrigationFarmWater.GDB.IDWQSites.SiteName}", popupContent),
            uniqueValueSymbolJSON: {
                "type": "uniqueValue",
                "field1": "IrrigationFarmWater.GDB.IDWQIndexData.IndexValue",
                "defaultLabel": "N/A",
                "defaultSymbol": {
                    "color": [230, 230, 230, 255],
                    "size": 10,
                    "outline": {
                        "color": [0, 0, 0, 255],
                        "width": 1,
                        "type": "esriSLS",
                        "style": "esriSLSSolid"
                    },
                    "type": "esriSMS",
                    "style": "esriSMSCircle"
                },
                "uniqueValueInfos": [{
                    "value": "EXCELLENT",
                    "label": "Excellent (95-100)",
                    "symbol": {
                        "color": [2, 53, 238, 255],
                        "size": 10,
                        "outline": {
                            "color": [0, 0, 0, 255],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        },
                        "type": "esriSMS",
                        "style": "esriSMSCircle"
                    }
                }, {
                    "value": "GOOD",
                    "label": "Good (80-94.9)",
                    "symbol": {
                        "color": [0, 176, 80, 255],
                        "size": 10,
                        "outline": {
                            "color": [0, 0, 0, 255],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        },
                        "type": "esriSMS",
                        "style": "esriSMSCircle"
                    }
                }, {
                    "value": "FAIR",
                    "label": "Fair (65-79.9)",
                    "symbol": {
                        "color": [255, 255, 0, 255],
                        "size": 10,
                        "outline": {
                            "color": [0, 0, 0, 255],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        },
                        "type": "esriSMS",
                        "style": "esriSMSCircle"
                    }
                }, {
                    "value": "MARGINAL",
                    "label": "Marginal (45-64.9)",
                    "symbol": {
                        "color": [255, 150, 0, 255],
                        "size": 10,
                        "outline": {
                            "color": [0, 0, 0, 255],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        },
                        "type": "esriSMS",
                        "style": "esriSMSCircle"
                    }
                }, {
                    "value": "POOR",
                    "label": "Poor (0-44.9)",
                    "symbol": {
                        "color": [255, 10, 10, 255],
                        "size": 10,
                        "outline": {
                            "color": [0, 0, 0, 255],
                            "width": 1,
                            "type": "esriSLS",
                            "style": "esriSLSSolid"
                        },
                        "type": "esriSMS",
                        "style": "esriSMSCircle"
                    }
                }]
            },
            resultSymbol: new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_CIRCLE,
                18,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,
                    new Color([0, 0, 0, 0]), 0),
                new Color([255, 255, 0, 1])
            ),
            minScale: 100000000,
            maxScale: 0
        },
        /*************************** END: Irrigation Water Quality Index config ***************************/

    };

    return config;
});