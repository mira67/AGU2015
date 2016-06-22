////////////////////////////////////////////////////////////////////////////////////////
// Example for Larson ice shelf fracturing:
// http://earthobservatory.nasa.gov/Features/WorldOfChange/larsenb.php
////////////////////////////////////////////////////////////////////////////////////////

// Bounding box for anomaly request. The Java code figures out the nearest xy coordinate
// within each image to figure out what points are within the bounding box.
loctnArray = Array();
loctnArray[0] = { "longitude": -39.3, "latitude": -42.5 };
loctnArray[1] = { "longitude": -41.4, "latitude": 136 };
boxCoordinates = loctnArray;

dataSet = "SSMI"; // SSMI data set with 19 GHz horizontal polarization
frequency = "19";
polarization = "h";

months = [	"jan", "feb", "mar", "apr",
			"may", "jun", "jul", "aug",
			"sep", "oct", "nov", "dec"	];

startYear = 1987; // set up as the same for the slider
endYear = 2014;
startMonth = 0; // used for searching seasons (like "summer") ...for now this isn't being used
endMonth = 0;
startDay = 1;
endDay = 1;

startDate = new Date(Date.UTC(startYear, startMonth, startDay)); //startYear + "-01-01";
endDate = new Date(Date.UTC(endYear, endMonth, endDay)); //endYear + "-01-01";

startDatePrint = function(){
	 return startDate.getUTCFullYear() + "-"
		+ ("00"+(startDate.getUTCMonth()+1)).slice(-2) + "-"
		+ ("00"+startDate.getUTCDate()).slice(-2);
}
endDatePrint = function(){
	return endDate.getUTCFullYear() + "-"
		+ ("00"+(endDate.getUTCMonth()+1)).slice(-2) + "-"
		+ ("00"+endDate.getUTCDate()).slice(-2);
}

// variables that control the timeline slider
minYear = startYear;
maxYear = endYear;

// main container for any requests to be made
anomalyRequest = {
	"dsName": dataSet,
	"dsFreq": frequency,
	"dsPolar": polarization,
	"sDate": startDatePrint(),
	"eDate": endDatePrint(),
	"sMonth": 1,
	"eMonth": 12,
	"sYear": startYear,
	"eYear": endYear,
	"locations": loctnArray
};
////////////////////////////////////////////////////////////////////////////////////////

// Add anomalies to the map when querying "daily" anomalies
function updateMap( ){
	
	var k, j = 0;

	// wait for response
	if( ( requestReturned == 1 ) && ( anomalyResponse.length !== 0 ) ){
// need to reset request returned at some point
		document.getElementById("dailyAnomRes").innerHTML = anomalyResponse.length + " anomalies found!";

		firstAnomaly = new Date(0);
		firstAnomaly.setUTCSeconds( anomalyResponse[0]["date"] / 1000 );
		lastAnomaly = new Date(0);
		lastAnomaly.setUTCSeconds( anomalyResponse[anomalyResponse.length - 1]["date"] / 1000 );
		
		console.log("first anomaly: " + firstAnomaly + "\nlast anomaly: " + lastAnomaly);
		console.log("...with " + anomalyResponse.length + " anomalies.")
		
		source.clear(); // clear the map
		
		//create a bunch of icons and add to source vector
		for( k = 0; k < anomalyResponse.length; k++ ){
			
			if( k == 0 ){ vectorSource.clear(); } // clear the selection rectangle
			
			var foo = anomalyResponse[k];
			var longi = foo["longi"];
			var lati = foo["lati"];
			var locations = ol.proj.transform([longi, lati], 'EPSG:4326', 'EPSG:3031');
//date?
			var tempDate = new Date(0);
			tempDate.setUTCSeconds( foo.date / 1000 );
/*
			if( tempDate ){ // is equal to the current day
				
				// add to the current map
			} else {
				// for next 10 days add to each day?!
			}
*/
			var iconFeature = new ol.Feature({
				//geometry: new ol.geom.Point(ol.proj.transform([lati, longi],'EPSG:4326','EPSG:3031')),
				geometry: new ol.geom.Point(locations)//,
				//name: 'Null Island',
				//population: 400,
// add mean value
				//rainfall: 500
			});
			vectorSource.addFeature(iconFeature);			
		}
			
		map.addLayer(vectorLayer);
		requestReturned = 0; // reset for next time

	} else { // if request returned is 1
		console.log("...waiting for the data ____or___ the length of anomalyResponse is zero?!");
	}
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// add anomalies to the map when querying "aggregate" anomalies as specified between 2 dates
function updateMapAggregate( ){
	var k, j = 0; // loop vars
	var foo = []; // each entry on list

	// wait for response
	if( ( requestReturned == 1 ) && ( aggregateAnomalyResponse.length !== 0 ) ){
		console.log("...with " + aggregateAnomalyResponse.length + " anomalies.")
		document.getElementById("aggAnomRes").innerHTML = aggregateAnomalyResponse.length + " anomalies found!";
		
		source.clear();
		
		for(var k = 0; k < aggregateAnomalyResponse.length; k++){
			
			if( k == 0 ){
				redVectorSource.clear();
				greyVectorSource.clear();
			}
			
			foo = aggregateAnomalyResponse[k];
			longi = foo["longi"];
			lati = foo["lati"];
			mean = foo["mean"];
			frequency = foo["frequency"];
			locations = ol.proj.transform([longi, lati], 'EPSG:4326', 'EPSG:3031');
			id = "test";
			
			// for i in __
			points.features.push({
				type: 'Feature',
				id: id,
				properties: mean,
				geometry: {
					type: 'Point',
					coordinates: [locations[0] + size / 2, locations[1] + size / 2]
				}
			});
			
			//////////////////////////////////////////
			iconFeature = new ol.Feature({
				geometry: new ol.geom.Point(locations)
			});
			//////////////////////////////////////////
			
			//console.log("threshold: greater than " + $(".sliderThreshold").slider("values")[0] + ", and less than " + $(".sliderThreshold").slider("values")[1] );
			
			if( mean > $(".sliderThreshold").slider("values")[0]*10 && mean < $(".sliderThreshold").slider("values")[1]*10 ){
				redVectorSource.addFeature(iconFeature);
			} else {
				greyVectorSource.addFeature(iconFeature);
			}
		}

		//////////////////////////////////
		// Create layer form vector grid and style function
		grid = new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(points),
			attributions: [new ol.Attribution({ 						// delete this....
				html: '<a href="http://ssb.no/">SSB</a>'
			})]
		});

		gridStyle = function( feature ){
			var coordinate = feature.getGeometry().getCoordinates();
			var x = coordinate[0] - gridSize / 2;
			var y = coordinate[1] - gridSize / 2;//,
				//pop = parseInt(feature.getProperties().sum);
				//rgb = d3.rgb(colorScale(pop)); //asdf = {r:"254";g:"178";b:"76"}

			return [
				new ol.style.Style({
					fill: new ol.style.Fill({
						color: [254, 178, 22, 0.7]//[rgb.r, rgb.g, rgb.b, 0.6]
					}),
					geometry: new ol.geom.Polygon([[
						[x,y], [x, y + gridSize], [x + gridSize, y + gridSize], [x + gridSize, y]
					]])
				})
			];
		};
		
		gridLayer = new ol.layer.Vector({
			source: grid//,
			//style: gridStyle
		});
		map.addLayer(gridLayer);

		/////////////////////////////////
		map.addLayer(redVectorLayer);
		map.addLayer(greyVectorLayer);
		requestReturned = 0; // reset for next time		
	} else { // if request returned is 1
		console.log("...waiting for the data or the length of aggregate anomaly request is zero?!");
	}
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// need to work on this
function updateResults( anomalyRequest ){	
	
	// determine frequency in GHz
	if( $("#chk91").is(':checked') ){
		frequency = "91";
	} else if( $("#chk22").is(':checked') ){
		frequency = "22";
	} else if( $("#chk37").is(':checked') ){
		frequency = "37";
	} else if( $("#chk85").is(':checked') ){
		frequency = "85";
	} else {
		frequency = "19";
	}
	
	// determine polarization
	if( $("#chkVertical").is(':checked') ){
		polarization = "v";
	} else if( $("#chkHorizontal").is(':checked') ){
		polarization = "h";
	}
		
	startYear = $(".sliderYears").slider("values")[0];
	endYear = $(".sliderYears").slider("values")[1]; // need to validate these values
	
	//startMonth = 1; //$(".sliderPattern").slider("values")[0] + 1;
	//endMonth = 12;
	// String for date parsing ...Right now the java will return 10 days no matter the
	// specified length of time. This is to reduce the amount of data passed to the page.
	
	var beginningDate = new Date( new Date(startDate).getTime() + 420 * 60 * 1000 ); // accommodate the timezone offset
	var beginningDateIncremented = new Date( new Date(beginningDate).getTime() + 24 * 60 * 60 * 1000 )
	
	//
	startDate = startYear + "-" 
		+ ("00" + beginningDateIncremented.getMonth()+1).slice(-2) + "-"
		+ ("00" + beginningDateIncremented.getDate()).slice(-2);
	
	console.log(startDate);
	//startDate = startYear + "-" + ("00" + startMonth).slice(-2) + "-01";
	endDate = endYear + "-" + ("00" + startMonth).slice(-2) + "-01";

startDate = new Date(Date.UTC(startYear, startMonth, startDay)); //startYear + "-01-01";
endDate = new Date(Date.UTC(endYear, endMonth, endDay)); //endYear + "-01-01";


	document.getElementById("stringOfDates").innerHTML = startDate + " to " + endDate;

	// update anomaly request values
	anomalyRequest["dsName"] = dataSet;
	anomalyRequest["dsFreq"] = "s" + frequency + polarization;
	anomalyRequest["dsPolar"] = polarization;
	anomalyRequest["sDate"] = startDate;
	anomalyRequest["eDate"] = endDate;
	anomalyRequest["sYear"] = startYear;
	anomalyRequest["eYear"] = endYear;
	anomalyRequest["sMonth"] = 1;
	anomalyRequest["eMonth"] = 12;
	anomalyRequest["locations"] = loctnArray	
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Find offset for days from the current date - http://jsfiddle.net/jfhartsock/cM3ZU/
Date.prototype.addDays = function ( days ){
	
	var date = new Date(this.valueOf())
	date.setDate(date.getDate() + days);
	return date;
}

// Generate an array of dates between the two input dates
function getDates( startDate, stopDate ){
	
	var dateArray = new Array();
	var currentDate = startDate;
	while( currentDate <= stopDate ){
		dateArray.push(currentDate)
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// +1 or -1 are the two ways to increment
function changeStartDate( value ){
	
	var beginningDate = new Date( new Date(startDate).getTime() + 420 * 60 * 1000 ); // accommodate the timezone offset
	var beginningDateIncremented = new Date( new Date(beginningDate).getTime() + value * 24 * 60 * 60 * 1000 )
	
	startDate = beginningDateIncremented.getFullYear() + "-" 
		+ ("00" + beginningDateIncremented.getMonth()+1).slice(-2) + "-"
		+ ("00" + beginningDateIncremented.getDate()).slice(-2);
	console.log(startDate);
	
	//return beginningDateIncremented;
}

// update labels of timeline pips
//new Date(year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]);
function updateDateValues( ){

	// generate a list of all days between start and end of input
	var beginningDate = new Date( new Date(startDate).getTime() + 420 * 60 * 1000 ); // accommodate the timezone offset
	//var beginningDatePlusOne = new Date( new Date(beginningDate).getTime() + 24* 60 * 60 * 1000 )
	var endingDate = new Date( new Date(endDate).getTime() + 420 * 60 * 1000 );
	var dateLabels = [];
	var tempString;
	
	var dateArray = getDates(beginningDate, endingDate);

	// generate an array of strings for labels ...just need 10 labels
	for( var j = 0; j < 10; j++ ){
		tempString = months[dateArray[j].getMonth()] + "-" + dateArray[j].getDate()
			+ "<br>" + dateArray[j].getFullYear();
		dateLabels[j] = tempString;
	}

	// updating the day timeline
	$(".sliderTimeline")
	.slider({
		min: 0,
		max: 9,
		step: 1,
		value: 0
	}).slider("pips", {
		rest: "label",
		labels: dateLabels
	});
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

requestReturned = 0;
anomalyResponse = [];
aggregateAnomalyResponse = [];

// if mode is '0' parse daily results, if mode is '1' parse aggregate results
function sendRequest( anomalyRequest, mode ){
	
	//updateDateValues();
	anomalyRequest["dsName"] = dataSet;
	anomalyRequest["dsFreq"] = "s" + frequency + polarization;
	anomalyRequest["dsPolar"] = polarization;
	anomalyRequest["sDate"] = startDatePrint();
	anomalyRequest["eDate"] = endDatePrint();
	anomalyRequest["locations"] = loctnArray
	
	console.log("anomalyRequest" + anomalyRequest);
	
	if( mode == 0 ){
		parseRequest();
	} else if( mode == 1 ){
		parseRequestAggregate();
	} else {
		console.log("error with request...");
	}
};
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Retrieve Daily Anomaly Results
function parseRequest( e ){
	console.log("making request....");

	ajaxHandle = $.ajax({
		type : "POST",
		contentType : "application/json; charset=utf-8",
		url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvAnomaly.do",
		//data : localStorage["userQuery"], // don't need localstorage anymore
		data : JSON.stringify(anomalyRequest),
		dataType : 'json',
		async : true,
		success : function(response) {
			console.log("ajax success!________________ajax success!");
			//console.log("respones: " + response);
			anomalyResponse = response;
			requestReturned = 1;
			updateMap();
		}
	});
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Retrieve Aggregate Anomaly Results
function parseRequestAggregate( e ){
	console.log("making aggregate request....");

	ajaxHandle = $.ajax({
		type : "POST",
		contentType : "application/json; charset=utf-8",
		url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvYearlyAggAnomaly.do",
		// to query monthly, just change the string 
		//url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvYearlyAggAnomaly.do",
		data : JSON.stringify(anomalyRequest),
		dataType : 'json',
		async : true,
		success : function( response ){
			console.log("ajax success! ajax success!");
			//console.log("respones: " + response);
			aggregateAnomalyResponse = response;
			requestReturned = 1;
			updateMapAggregate();
		}
	});	
	// [{"longi":168.17851, "lati":-55.5503, "mean":2061.5, "frequency":2},{"longi":153.50965, "lati":-51.8394, "mean":2002, "frequency":1}]
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// aggregate results
function parseRequestAggregateMonthly( e ){
	console.log("making aggregate request....");

	ajaxHandle = $.ajax({
		type : "POST",
		contentType : "application/json; charset=utf-8",
		url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvMonthlyAggAnomaly.do",
		// to query monthly, just change the string 
		//url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvYearlyAggAnomaly.do",
		data : JSON.stringify(anomalyRequest),
		dataType : 'json',
		async : true,
		success : function( response ){
			console.log("ajax success! ajax success!");
			//console.log("respones: " + response);
			aggregateAnomalyResponse = response;
			requestReturned = 1;
			updateMapAggregate();
		}
	});
	// [{"longi":168.17851, "lati":-55.5503, "mean":2061.5, "frequency":2},{"longi":153.50965, "lati":-51.8394, "mean":2002, "frequency":1}]
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

var draw;
function addInteraction( ){
	var locationArray = Array();
	locationArray[0] = { "longitude": -39.3, "latitude": -42.5 };
	locationArray[1] = { "longitude": -41.4, "latitude": 136 };

	var geometryFunction;
	
	function geometryFunction( coordinates, geometry ){
		if( !geometry ){
			geometry = new ol.geom.Polygon(null);
		}
		var start = coordinates[0];
		var end = coordinates[1];
		geometry.setCoordinates([[start, [start[0], end[1]], end, [end[0], start[1]], start]]);
		
		locationArray[0]["longitude"] = ol.proj.transform([coordinates[0][0], coordinates[0][1]], 'EPSG:3031', 'EPSG:4326')[0].toFixed(2);
		locationArray[0]["latitude"] = ol.proj.transform([coordinates[0][0], coordinates[0][1]], 'EPSG:3031', 'EPSG:4326')[1].toFixed(2);
		
		locationArray[1]["longitude"] = ol.proj.transform([coordinates[1][0], coordinates[1][1]], 'EPSG:3031', 'EPSG:4326')[0].toFixed(2);
		locationArray[1]["latitude"] = ol.proj.transform([coordinates[1][0], coordinates[1][1]], 'EPSG:3031', 'EPSG:4326')[1].toFixed(2);

		console.log("coordinates" + locationArray[0] + ", " + locationArray[1]);
		
		boxCoordinates = locationArray; // add coordinates to the var
		loctnArray = locationArray;
		
		updateResults( anomalyRequest );

		return geometry;
	};
	
	draw = new ol.interaction.Draw({
		source: source,
		type: 'LineString',
		geometryFunction: geometryFunction,
		maxPoints: 2
	});
	
	// return cursor to user after finishing drawing
	draw.on("drawend", function(){
		//var a = draw.getGeometry().getCoordinates();
		//$('#tempOutput').text(a);
		//console.log("coor:" + draw.getGeometry().getcoordinates());
		map.removeInteraction(draw);
	});
	
	map.addInteraction(draw);
}
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// button with listener to draw a rectangle ['clear' button is hard-coded in html]
function buttonDrawRectangle(){
	map.removeInteraction(draw);
	addInteraction();
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// Resource for Sliders:
// http://simeydotme.github.io/jQuery-ui-Slider-Pips/#styling

$('.mutual .checkbox').click( function( ){
	var checkedState = $(this).prop("checked")
		$(this)
			.parent('div')
			.children('.checkbox:checked')
			.prop("checked", false);
	$(this).prop("checked", checkedState);
	$( updateResults( anomalyRequest ) );
	$( updateDateValues() );
});
////////////////////////////////////////////////////////////////////////////////////////

// change opacity of the base layer
$(".sliderLayerOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 1.0,
	slide: function( event, ui ){
		//$("#layerOpacityText").text( ui.value );
		$( layerBaseMap.setOpacity( ui.value) );
	},
	change: function( event, ui ){
		//$("#layerOpacityText").text( ui.value );
		$( layerBaseMap.setOpacity( ui.value) );
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	//$("#layerOpacityText").text( ui.value );
	$( layerBaseMap.setOpacity( ui.value) );
	$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////

// change opacity of the climatology
$(".sliderMarkerOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 0.0,
	slide: function( event, ui ){
		$( imageLayer.setOpacity( ui.value ) );
	},
	change: function( event, ui ){
		$( imageLayer.setOpacity( ui.value ) );
		console.log("ui.value" + ui.value);
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	$( imageLayer.setOpacity( ui.value ) );
	$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////

// partitioning of the brightness threshold
$(".sliderDailyAnomalyOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 0.75,
	slide: function( event, ui ){
		$( vectorLayer.setOpacity( ui.value ) );
	},
	change: function( event, ui ){
		$( vectorLayer.setOpacity( ui.value ) );
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	$( vectorLayer.setOpacity( ui.value ) );
	$( updateResults( anomalyRequest ) );
});

// partitioning of the brightness threshold
$(".sliderAggAnomalyOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 0.75,
	slide: function( event, ui ){
		$( redVectorLayer.setOpacity( ui.value ) );
		$( greyVectorLayer.setOpacity( ui.value ) );
	},
	change: function( event, ui ){
		//$("#markerOpacityText").text( ui.value );
		$( redVectorLayer.setOpacity( ui.value ) );
		$( greyVectorLayer.setOpacity( ui.value ) );
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	$( redVectorLayer.setOpacity( ui.value ) );
	$( greyVectorLayer.setOpacity( ui.value ) );
	$( updateResults( anomalyRequest ) );
});

////////////////////////////////////////////////////////////////////////////////////////

// slider for main timeline at bottom of page
hanzi = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
$(".sliderTimeline")
	.slider({ 
		min: 0,
		max: hanzi.length - 1,
		value: 0,
		slide: function( event, ui ){
			//$("#timelineText").text( ui.value );
		},
		change: function( event, ui ){
			//$("#timelineText").text( ui.value );
		}
	})
	.slider("pips", {
		rest: "label",
		labels: hanzi
	})
	.slider("float", {
        labels: hanzi
    })
	.on("slidechange", function( event ,ui ){
		//$("#timelineText").text( ui.value );
		$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////

// user input of the beginning/end years
$(".sliderYears")
.slider({
	min: minYear,
	max: maxYear,
	step: 1,
	values: [1995, 1996],
	slide: function( event, ui ){
		//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
		$( updateResults( anomalyRequest ) );
		startYear = $(".sliderYears").slider("values")[0];
		endYear = $(".sliderYears").slider("values")[1];
	},
	change: function( event, ui ){
		//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
		$( updateResults( anomalyRequest ) );
		startYear = $(".sliderYears").slider("values")[0];
		endYear = $(".sliderYears").slider("values")[1];
		updateDateValues();
	}
})
.slider("pips", {
	step: 5
})
.slider("float")
.on("slidechange", function( event, ui ){
	//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
	$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////

// slider for patterns of date input
/*
$(".sliderPattern")
	.slider({ 
		min: 0, 
		max: months.length-1,
		range: true,
		values: [0, 11],
		slide: function( event, ui ){
			//$("#patternText").text( months[ui.values[0]] + " to " + months[ui.values[1]] );
		},
		change: function( event, ui ){
			//$("#patternText").text( months[ui.values[0]] + " to " + months[ui.values[1]] );
		}

	})
	.slider("pips", {
		rest: "label",
		labels: months
	})
	.on("slidechange", function( event ,ui ){
		//$("#patternText").text( months[ui.values[0]] + " to " + months[ui.values[1]] );
		$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////
*/

// thresholds for the results to return
$(".sliderThreshold")
	.slider({
		min: 50,
		max: 350,
		range: true,
		values: [50, 350],
		slide: function( event, ui ){
			$( updateResults( anomalyRequest ) );
			$("#sliderThresholdText").text( $(".sliderThreshold").slider("values") );
		},
		change: function( event, ui ){
			$( updateResults( anomalyRequest ) );
			$("#sliderThresholdText").text( $(".sliderThreshold").slider("values") );
		}
	})
	.slider("pips", {
		rest: false
	})
	.on("slidechange", function( event, ui ){
		$( updateResults( anomalyRequest ) );
});
////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////