window.onload = function() {

	proj4.defs("EPSG:3031",
		"+proj=stere +lat_0=-90 +lat_ts=-71 +lon_0=0 +k=1 +x_0=0 +y_0=0 " +
		"+datum=WGS84 +units=m +no_defs");
	ol.proj.get("EPSG:3031").setExtent([-4194304, -4194304, 4194304, 4194304]);

	var map = new ol.Map({
		view: new ol.View({
			maxResolution: 8192.0,
			projection: ol.proj.get("EPSG:3031"),
			extent: [-4194304, -4194304, 4194304, 4194304],
			center: [0, 0],
			zoom: 0,
			maxZoom: 7,
		}),
		target: "map",
		renderer: ["canvas"],
	});

	var sourceLandWater = new ol.source.WMTS({
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
	var layerLandWater = new ol.layer.Tile({source: sourceLandWater});
	
	// https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products#expand-EarthatNight1Product
	// coastline: SCAR antarctic digital database
	var sourceBaseMap = new ol.source.WMTS({
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
	var layerBaseMap = new ol.layer.Tile({source: sourceBaseMap});

	var sourceCoastlines = new ol.source.WMTS({
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
	var layerCoastlines = new ol.layer.Tile({source: sourceCoastlines});
	
	// Create an image layer, <http://www.acuriousanimal.com/thebookofopenlayers3/chapter02_04_image_layer.html>
	var imageLayer = new ol.layer.Image({
		opacity: 0.7,
		source: new ol.source.ImageStatic({
			url: 'images/jan.png',
			imageSize: [632, 664],
			projection: map.getView().getProjection(),
			imageExtent: [-4194304, -3923000, 4194304, 4194304]//[-3929786, -3929786, 3923000, 3923000]
		})
	});
	//map.addLayer(imageLayer);
	//map.addLayer(layerLandWater);
	//map.addLayer(layerBaseMap);
	map.addLayer(layerCoastlines);

	var heatmapLayer = new ol.layer.Heatmap({
		source: new ol.source.GeoJSON({
			url: 'cities.json',
			projection: 'EPSG:3031'
		}),
		opacity: 0.9
	});
	map.addLayer(heatmapLayer);
	
	
/*
	// Change layer opacity
	$('input.opacity').slider({
		value: imageLayer.getOpacity()
	}).on('slide', function(ev) {
		imageLayer.setOpacity(ev.value);
	});
*/
	
};
