window.onload = function() {

	// definitions
	proj4.defs("EPSG:3031", "+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs");
	ol.proj.get("EPSG:3031").setExtent([-4194304, -4194304, 4194304, 4194304]);

	// for outputting the mouse position
	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		projection: 'EPSG:4346',
		// comment the following two lines to have the mouse position
		// be placed within the map.
		//className: 'custom-mouse-position',
		//target: document.getElementById('mouse-position'),
		undefinedHTML: '&nbsp;'
	});
	
	// create the map
	map = new ol.Map({
		controls: ol.control.defaults().extend([mousePositionControl]), // for displaying the mouse
		view: new ol.View({
			maxResolution: 8192.0,
			projection: ol.proj.get("EPSG:3031"),
			extent: [-4194304, -4194304, 4194304, 4194304],
			center: [0, 0],
			zoom: 0.5,
			maxZoom: 5,
		}),
		target: "map",
		renderer: ["canvas","dom"],
	});

	// create layer for binary layers of water, land, and permanent glacier
	sourceLandWater = new ol.source.WMTS({
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		layer: "SCAR_Land_Water_Map", // jpeg 500m
		extent: [-3923000, -3923000, 3923000, 3923000],//[-4194304, -4194304, 4194304, 4194304],
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
	// add picture-like image layer
	sourceBaseMap = new ol.source.WMTS({
		opacity: 0.5,
		url: "//map1{a-c}.vis.earthdata.nasa.gov/wmts-antarctic/wmts.cgi",
		//layer: "MODIS_Terra_CorrectedReflectance_TrueColor", // png 250m
		layer: "BlueMarble_ShadedRelief_Bathymetry", // jpeg 500m
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

	// Create an image layer, <http://www.acuriousanimal.com/thebookofopenlayers3/chapter02_04_image_layer.html>
	// add layer with the climatology
	imageLayer = new ol.layer.Image({
		opacity: 0.7,
		source: new ol.source.ImageStatic({
			url: 'images/jan.png',
			imageSize: [632, 664],
			projection: map.getView().getProjection(),
			imageExtent: [-4194304, -3923000, 4194304, 4194304]//[-3929786, -3929786, 3923000, 3923000]
		})
	});
	map.addLayer(imageLayer);
	
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
	
	// add layer for a heatmap of anomaly points
	heatmapLayer = new ol.layer.Heatmap({
		source: new ol.source.GeoJSON({
			url: 'cities.json',
			projection: 'EPSG:3031'
		}),
		opacity: 0.7
	});
	map.addLayer(heatmapLayer);

};
