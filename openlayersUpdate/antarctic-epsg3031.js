window.onload = function() {

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

	// for drawing the box <http://openlayers.org/en/v3.8.2/examples/draw-features.html>
	source = new ol.source.Vector({wrapX: false});
	vector = new ol.layer.Vector({
		source: source,
		style: new ol.style.Style({
			fill: new ol.style.Fill({
				color: 'rgba(255, 255, 255, 0.2)'
			}),
			stroke: new ol.style.Stroke({
				color: '#ffcc33',
				width: 2
			}),
			image: new ol.style.Circle({
				radius: 7,
				fill: new ol.style.Fill({
					color: '#ffcc33'
				})
			})
		})
	});
	
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
	
	// https://wiki.earthdata.nasa.gov/display/GIBS/GIBS+Available+Imagery+Products#expand-EarthatNight1Product
	// coastline: SCAR antarctic digital database
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
	
	// Create an image layer, <http://www.acuriousanimal.com/thebookofopenlayers3/chapter02_04_image_layer.html>
	imageLayer = new ol.layer.Image({
		opacity: 0.7,
		source: new ol.source.ImageStatic({
			url: 'images/jan.png',
			imageSize: [632, 664],
			projection: map.getView().getProjection(),
			imageExtent: [-4194304, -3923000, 4194304, 4194304]//[-3929786, -3929786, 3923000, 3923000]
		})
	});

	heatmapLayer = new ol.layer.Heatmap({
		source: new ol.source.GeoJSON({
			url: 'cities.json',
			projection: 'EPSG:3031'
		}),
		opacity: 0.7
	});
	map.addLayer(heatmapLayer);

	//map.addLayer(layerLandWater);
	map.addLayer(layerBaseMap);
	map.addLayer(layerCoastlines);
	map.addLayer(imageLayer);

	map.addLayer(vector);
	

	typeSelect = document.getElementById('type');

    //var draw; // global so we can remove it later
      function addInteraction() {
		
		console.log("again");

        var value = typeSelect.value;
        if (value !== 'None') {
          var geometryFunction, maxPoints;
          if (value === 'Square') {
            value = 'Circle';
            geometryFunction = ol.interaction.Draw.createRegularPolygon(4);
          } else if (value === 'Box') {
            value = 'LineString';
            maxPoints = 2;
            geometryFunction = function(coordinates, geometry) {
              if (!geometry) {
                geometry = new ol.geom.Polygon(null);
              }
              var start = coordinates[0];
              var end = coordinates[1];
              geometry.setCoordinates([
                [start, [start[0], end[1]], end, [end[0], start[1]], start]
              ]);
              return geometry;
            };
          }
          draw = new ol.interaction.Draw({
            source: source,
            type: /** @type {ol.geom.GeometryType} */ (value),
            geometryFunction: geometryFunction,
            maxPoints: maxPoints
          });
          map.addInteraction(draw);
        }
      }


	addInteraction();
	
};