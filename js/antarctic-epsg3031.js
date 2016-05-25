// main data products: https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products

window.onload = function() {

	// definitions for 3031 projection
	proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
	ol.proj.get("EPSG:3031").setExtent([-4194304, -4194304, 4194304, 4194304]);
	
	// for outputting the mouse position
	var mousePositionControl = new ol.control.MousePosition({
		//coordinateFormat: ol.coordinate.createStringXY(2),
		projection: 'EPSG:4326',
		coordinateFormat: function(coordinate){
			return "EPSG:3031 " + ol.coordinate.format(coordinate, '{y}, {x}', 3);
		},
		className: 'custom-mouse-position',					// comment the following two lines to have the mouse position
		target: document.getElementById('mouse-position'),	// be placed within the map.
		undefinedHTML: 'EPSG: 3031' //&nbsp;'
	});

	// create the map
	map = new ol.Map({
		controls: ol.control.defaults().extend([
				mousePositionControl,
				new ol.control.ScaleLine()
			]),
		view: new ol.View({
			maxResolution: 8192.0,
			projection: ol.proj.get("EPSG:3031"),
			extent: [-4194304, -4194304, 4194304, 4194304],
			center: [-1069056, 695296], // map.getView().getCenter()
			zoom: 2, // map.getView().getZoom()
			maxZoom: 4
		}),
		target: "map",
		renderer: ["canvas","dom"]
	});

	// vars for computing pixelation size for data overlay
	gridSize = 25000; // 25 kilometers for some satellites, 12.5 km for others
	epsgCode = 'EPSG:3031';
	projection = ol.proj.get(epsgCode);
	projectionExtent = projection.getExtent();
	size = ol.extent.getWidth(projectionExtent) / 512; // 512 is # of tiles
	
//https://earthdata.nasa.gov/labs/gibs/examples/openlayers/antarctic-epsg3031.html
// this service seems to be a higher resolution ...maybe import it when you can geotag the results that the user queries	
	
	// create layer for binary layers of water, land, and permanent glacier
	sourceLandWater = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "SCAR_Land_Water_Map", // jpeg 500m
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_250m",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerLandWater = new ol.layer.Tile({source: sourceLandWater});
	map.addLayer(layerLandWater);
	
	// https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products#expand-EarthatNight1Product
	// coastline: SCAR antarctic digital database
	sourceBaseMap = new ol.source.WMTS({
		opacity: 0.1,
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		//layer: "MODIS_Terra_CorrectedReflectance_TrueColor", // png 250m
		//layer: "BlueMarble_ShadedRelief_Bathymetry", // jpeg 500m
		layer: "BlueMarble_ShadedRelief", // jpeg 500m
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/jpeg",
		matrixSet: "EPSG3031_500m",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerBaseMap = new ol.layer.Tile({source: sourceBaseMap});
	map.addLayer(layerBaseMap);

	// add layer with outlines of coasts and permanent glacier boundaries
	sourceCoastlines = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "Coastlines", // jpeg 500m
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_250m",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerCoastlines = new ol.layer.Tile({source: sourceCoastlines});
	map.addLayer(layerCoastlines);
	
////////////////////////////////////
/*
	// SMAP_L3_Active_AM_Freeze_Thaw
	sourceFreezeThaw = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "SMAP_L3_Active_AM_Freeze_Thaw",
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_1km",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerFreezeThaw = new ol.layer.Tile({source: sourceFreezeThaw});
	map.addLayer(layerFreezeThaw);
*/

/*
	// MODIS_Terra_Sea_Ice and MODIS_Aqua_Sea_Ice
	sourceSeaIce = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "MODIS_Aqua_Sea_Ice",
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_1km",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerSeaIce = new ol.layer.Tile({source: sourceSeaIce});
	map.addLayer(layerSeaIce);
*/

/*
	// MODIS_Aqua_Snow_Cover and MODIS_Terra_Snow_Cover
	sourceSnowCover = new ol.source.WMTS({
		//resource --> https://github.com/nasa-gibs/worldview-options-eosdis/blob/master/release/gc/gibs-arctic.xml
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "MODIS_Terra_Snow_Cover",
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_500m",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerSnowCover = new ol.layer.Tile({source: sourceSnowCover});
	map.addLayer(layerSnowCover);
*/
	
	// add layer with latitude and longitude lines
	sourceGraticule = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "Graticule", // jpeg 500m
		extent: [-4194304, -4194304, 4194304, 4194304],
		format: "image/png",
		matrixSet: "EPSG3031_250m",
		tileGrid: new ol.tilegrid.WMTS({
			origin: [-4194304, 4194304],
			resolutions: [
				8192.0,
				4096.0,
				2048.0,
				1024.0,
				512.0,
				256.0
			],
			matrixIds: [0, 1, 2, 3, 4, 5],
			tileSize: 512
		})
	});
	layerGraticule = new ol.layer.Tile({source: sourceGraticule});
	map.addLayer(layerGraticule);
	
/////////////////////////////////////
	
	// Create an image layer, <http://www.acuriousanimal.com/thebookofopenlayers3/chapter02_04_image_layer.html>
	// add layer with the climatology
//
// ...this might help!?
//ol.extent.getBottomLeft(projection.getExtent())

	imageLayer = new ol.layer.Image({
		opacity: 0.5,
		source: new ol.source.ImageStatic({
			url: 'images/climatology/oct.png',
			imageSize: [632, 664],
			imageExtent: [ -3950000, -3950000, 3700000, 4100000],
			projection: 'EPSG:4326'
		})
	});
	
	// for drawing the selection box
	source = new ol.source.Vector();
	vector = new ol.layer.Vector({
		source: source,
		//projection: 'EPSG:3031',
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.5)'
			}),
			stroke: new ol.style.Stroke({
				color: '#ffffff',
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
					color: '#ffffff'
				})
			})
		})
	});
	map.addLayer(vector);

	// for drawing anomalies
	vectorSource = new ol.source.Vector(); // empty vector
	
	//create the style
	iconStyle = new ol.style.Style({
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
			anchor: [.01, .1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',
			src: 'images/greenMarker.jpg'
		}))
	});
	
	//add the feature vector to the layer vector, and apply a style to whole layer
	vectorLayer = new ol.layer.Vector({
		opacity: 0.25,
		source: vectorSource,
		style: iconStyle
	});
	
///////////////////////////////

	// storage for the "pixels" to be drawn on map
	points = {
		type: 'FeatureCollection',
		features: []
	};
	
///////////////////////////////

	// for drawing aggregate results
	redVectorSource = new ol.source.Vector();
	greyVectorSource = new ol.source.Vector();
	
	//create the style for hot and then cold
	redIconStyle = new ol.style.Style({
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
			/*anchor: [1, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',*/
			src: 'images/redMarker.jpg'
		}))
	});
	greyIconStyle = new ol.style.Style({
		image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
			/*anchor: [1, 1],
			anchorXUnits: 'fraction',
			anchorYUnits: 'fraction',*/
			src: 'images/greyMarker.jpg'
		}))
	});
	
	// red vs blue - anomalies inside and outside specified interval ...should change the outside to clear or grey
	redVectorLayer = new ol.layer.Vector({
		opacity: 0.25,
		source: redVectorSource,
		style: redIconStyle
	});
	greyVectorLayer = new ol.layer.Vector({
		opacity: 0.25,
		source: greyVectorSource,
		style: greyIconStyle
	});

};