/* file contains various methods for interacting with the page */

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// add anomalies to the map
function updateMap(){
	var k, j = 0; // loop vars
	var foo = []; // each entry on list

	// wait for response
	if( ( requestReturned == 1 ) && ( anomalyResponse.length !== 0 ) ){

		firstAnomaly = new Date(0);
		firstAnomaly.setUTCSeconds( anomalyResponse[0]["date"] / 1000 );

		secondAnomaly = new Date(0);
		secondAnomaly.setUTCSeconds( anomalyResponse[anomalyResponse.length - 1]["date"] / 1000 );
		
		console.log("first anomaly: " + firstAnomaly);
		console.log("last anomaly: " + secondAnomaly);
		console.log("...with " + anomalyResponse.length + " anomalies.")
		
		// http://jsfiddle.net/6RS2z/356/
		vectorSource = new ol.source.Vector(); //create empty vec
		
		 //create a bunch of icons and add to source vector
		for(var k = 0; k < anomalyResponse.length; k++){
			
			if(k == 0){ vectorSource.clear(); }
			foo = anomalyResponse[k];
			longi = foo["longi"];
			lati = foo["lati"];

			var locations = ol.proj.transform([longi, lati], 'EPSG:4326', 'EPSG:3031');

			var iconFeature = new ol.Feature({
				//geometry: new ol.geom.Point(ol.proj.transform([lati, longi],'EPSG:4326','EPSG:3031')),
				geometry: new ol.geom.Point(locations),
				name: 'Null Island',
				population: 400,
				rainfall: 500
			});
			vectorSource.addFeature(iconFeature);
		}
		
		//create the style
		iconStyle = new ol.style.Style({
			image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
				anchor: [.01, .1],
				anchorXUnits: 'fraction',
				anchorYUnits: 'fraction',
				src: '../images/redMarker.jpg'
			}))
		});
		
		//add the feature vector to the layer vector, and apply a style to whole layer
		vectorLayer = new ol.layer.Vector({
			source: vectorSource,
			style: iconStyle
		});
		
		map.addLayer(vectorLayer);

	} else { // if request returned is 1
		console.log("...waiting for the data ____or___ the length of anomalyResponse is zero?!");
	}
} // end updateMap

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var dataSet = "SSMI";
var frequency = "19";
var polarization = "h";
var startDate = "2010-12-12";
var endDate = "2010-12-20";

// bounding box for request
var loctnArray = Array();
loctnArray[0] = { "longitude": -39.3, "latitude": -42.5 };
loctnArray[1] = { "longitude": -41.4, "latitude": 136 };
boxCoordinates = loctnArray;

var startYear = 1987; // set up as the same for the slider
var endYear = 2014;
var startMonth = 0;
var endMonth = 11;

anomalyRequest = {
	"dsName": dataSet,
	"dsFreq": frequency,
	"dsPolar": polarization,
	"sDate": startDate,
	"eDate": endDate,
	"locations": loctnArray
};

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// variables that control the timelilne view -- start zoomed to years
var minYear = 1987;
var maxYear = 2014;
var sliderTimelineMin = minYear;
var sliderTimelineMax = maxYear;
var sliderTimelineStep = 1;
var sliderTimelineValue = 1;
var timelineZoomLevel = "day";

// http://jsfiddle.net/3TssG/
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

// change opacity of the layer
$(".sliderLayerOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 1,
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

// change opacity of the markers
$(".sliderMarkerOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 0.75,
	slide: function( event, ui ){
		//$("#markerOpacityText").text( ui.value );
		$( imageLayer.setOpacity( ui.value ) );
	},
	change: function( event, ui ){
		//$("#markerOpacityText").text( ui.value );
		$( imageLayer.setOpacity( ui.value ) );
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	//$("#markerOpacityText").text( ui.value );
	$( imageLayer.setOpacity( ui.value ) );
	$( updateResults( anomalyRequest ) );
});

// sliderHeatmapOpacity
$(".sliderHeatmapOpacity")
.slider({
	min: 0,
	max: 1,
	step: 0.05,
	value: 1,
	slide: function( event, ui ){
		//$("#markerOpacityText").text( ui.value );
		$( heatmapLayer.setOpacity( ui.value ) );
	},
	change: function( event, ui ){
		//$("#markerOpacityText").text( ui.value );
		$( heatmapLayer.setOpacity( ui.value ) );
	}
})
.slider("pips", {
	rest: "label",
	step: 5
})
.on("slidechange", function( event, ui ){
	//$("#markerOpacityText").text( ui.value );
	$( heatmapLayer.setOpacity( ui.value ) );
	$( updateResults( anomalyRequest ) );
});

// user input of the date
$(".sliderYears")
	.slider({
		min: minYear,
		max: maxYear,
		range: true,
		step: 1,
		values: [2001, 2011],
		//this gets a live reading of the value and prints it on the page
		slide: function( event, ui ){
			//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
		},
		change: function( event, ui ){
			//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
		}
	})
	.slider("pips", {
		rest: "label",
		step: 3
	})
	.on("slidechange", function( event, ui ){
		//$("#yearsText").text( ui.values[0] + " to " + ui.values[1] );
		$( updateResults( anomalyRequest ) );
});

// slider for patterns of date input
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

// slider for main timeline at bottom of page
$(".sliderTimeline")
	.slider({ 
		min: sliderTimelineMin,
		max: sliderTimelineMax,
		step: sliderTimelineStep,
		values: [sliderTimelineMin, sliderTimelineMax],
		slide: function( event, ui ){
			//$("#timelineText").text( ui.value );
		},
		change: function( event, ui ){
			//$("#timelineText").text( ui.value );
		}
	})
	.slider("pips", {
		rest: "label",
		step: 1
	})
	.on("slidechange", function( event ,ui ){
		//$("#timelineText").text( ui.value );
		$( updateResults( anomalyRequest ) );
});

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

// updates the variables that will be input into the query
function updateResults( anomalyRequest ){	
	// determine frequency
	if( $("#chk19").is(':checked') ){
		frequency = "19";
	} else if( $("#chk22").is(':checked') ){
		frequency = "22";
	} else if( $("#chk37").is(':checked') ){
		frequency = "37";
	} else if( $("#chk85").is(':checked') ){
		frequency = "85";
	} else if( $("#chk91").is(':checked') ){
		frequency = "91";
	}
	
	// determine polarization
	if( $("#chkVertical").is(':checked') ){
		polarization = "v";
	} else if( $("#chkHorizontal").is(':checked') ){
		polarization = "h";
	}
	
	// determine timeline zoom
	if( $("#chkDay").is(':checked') ){
		timelineZoomLevel = "day";
	} else if( $("#chkMonth").is(':checked') ){
		timelineZoomLevel = "month";
	} else if( $("#chkYear").is(':checked') ){
		timelineZoomLevel = "year";
	}
	
	startYear = $(".sliderYears").slider("values")[0];
	endYear = $(".sliderYears").slider("values")[1];
	startMonth = $(".sliderPattern").slider("values")[0] + 1;
	endMonth = $(".sliderPattern").slider("values")[1] + 1;
	
	startDate = startYear + "-" + ("00" + startMonth).slice(-2) + "-01";
	endDate = endYear + "-" + ("00" + startMonth).slice(-2) + "-01";

	document.getElementById("outputResults").innerHTML =
		"<p>" + dataSet + ", " + frequency + ", " + polarization + ", " + startDate + ", " + endDate + "<br>"
		//+ "timeline zoom: " + timelineZoomLevel + "</p>"
		//+ "layer opacity: " + $(".sliderLayerOpacity").slider("value") + "</p>"
		//+ "marker opacity: " + $(".sliderMarkerOpacity").slider("value") + "</p>"
		+ "dates: " + startDate + ", " + endDate + "<br>"
		//+ "location array: " + loctnArray[0] + ", " + loctnArray[1] + "</p>";
		+ "coordinates top-left: " + boxCoordinates[0]["latitude"] + ",   " + boxCoordinates[0]["longitude"] + "<br>"
		+ "coordinates bottom-right: " + boxCoordinates[1]["latitude"] + ",   " + boxCoordinates[1]["longitude"] + "<br>"
		+ "slider years: " + startYear + ", " + endYear + "<br>"
		+ "slider pattern: " + months[$(".sliderPattern").slider("values")[0]] + " to " + months[$(".sliderPattern").slider("values")[1]]
		+ "</p>";
	
	// update anomaly request values
	anomalyRequest["dsName"] = dataSet;
	anomalyRequest["dsFreq"] = "s" + frequency + polarization;
	anomalyRequest["dsPolar"] = polarization;
	anomalyRequest["sDate"] = startDate;
	anomalyRequest["eDate"] = endDate;
	anomalyRequest["locations"] = loctnArray
}

////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
// http://jsfiddle.net/jfhartsock/cM3ZU/
Date.prototype.addDays = function ( days ){
	var dat = new Date(this.valueOf())
	dat.setDate(dat.getDate() + days);
	return dat;
}
function getDates( startDate, stopDate ){
	var dateArray = new Array();
	var currentDate = startDate;
	while( currentDate <= stopDate ){
		dateArray.push(currentDate)
		currentDate = currentDate.addDays(1);
	}
	return dateArray;
}

// update labels of timeline pips
function updateDateValues( ){

	// generate a list of all days between start and end of input
	var beginningDate = new Date(startDate);
	var endingDate = new Date(endDate);

	dateArray = getDates(beginningDate, endingDate);

// print out all the dates to the console		
for( i = 0; i < dateArray.length; i++ ){
//console.log( dateArray[i] );
}
	
	if( $("#chkMonth").is(':checked') ){
		// months
		$(".sliderTimeline")
		.slider({
			min: 0,
			max: 11,
			step: 1,
			value: 5
		}).slider("pips", {
			rest: "label",
			labels: months
		});
	} else if( $("#chkYear").is(':checked') ){
		// years
		$(".sliderTimeline")
		.slider({
			min: minYear,
			max: maxYear,
			step: 1,
			value: 1
		}).slider("pips", {
			rest: "label",
			step: 1
		});
	} else {
		// days
		$(".sliderTimeline")
		.slider({
			min: 0,
			max: 31,
			step: 1,
			value: 0
		}).slider("pips", {
			rest: "label",
			step: 1
		});
	}
}


////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////

function sendRequest( anomalyRequest, mode ){

	anomalyRequest["dsName"] = dataSet;
	anomalyRequest["dsFreq"] = "s" + frequency + polarization;
	anomalyRequest["dsPolar"] = polarization;
	anomalyRequest["sDate"] = "2012-12-01";//startDate;
	anomalyRequest["eDate"] = "2012-12-31";//endDate;
	anomalyRequest["locations"] = loctnArray
	
	console.log("anomalyRequest" + anomalyRequest);
	localStorage['userQuery'] = JSON.stringify(anomalyRequest);
	console.log("localStorage: " + localStorage['userQuery']);
	
	updateDateValues();
	
	parseRequest();
	//parseRequest(); //send and parse results
	//updateDateValues(); //first 10 days from user query
};

var requestReturned = 0;
var anomalyResponse = [];
var aggregateAnomalyResponse = [];
// anomaly results

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
			console.log("respones: " + response);
			anomalyResponse = response;
			requestReturned = 1;
			updateMap();
		}
	});
}

// aggregate results
function parseRequestAggregate( e ){
	console.log("making aggregate request....");

	ajaxHandle = $.ajax({
		type : "POST",
		contentType : "application/json; charset=utf-8",
		url : "http://localhost:8080/condensate-web/anomaly/ajaxRetrvAggAnomaly.do",
		//data : localStorage["userQuery"], // don't need localstorage anymore
		data : JSON.stringify(anomalyRequest),
		dataType : 'json',
		async : true,
		success : function(response) {
			console.log("ajax success!________________ajax success!");
			console.log("respones: " + response);
			aggregateAnomalyResponse = response;
//////
			requestReturned = 1;
			updateMap();
		}
	});
}

////////////////////////////////////////////////////////////////////////////////////////
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
		
console.log("coordinates" + coordinates);

// lots of things might be screwed up here!
		locationArray[0]["longitude"] = (coordinates[0][1]/100000).toFixed(2);
		locationArray[0]["latitude"] = (coordinates[0][0]/100000).toFixed(2);
		locationArray[1]["longitude"] = (coordinates[1][1]/100000).toFixed(2);
		locationArray[1]["latitude"] = (coordinates[1][0]/100000).toFixed(2);
		
		boxCoordinates = locationArray; // add coordinates to the var
		loctnArray = locationArray;
// use one variable to store coordinates?!
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
		console.log("here");
		map.removeInteraction(draw);
	});
	
	map.addInteraction(draw);
} // end addInteraction

// button with listener to draw a rectangle ['clear' button is hard-coded in html]
function buttonDrawRectangle(){
	map.removeInteraction(draw);
	addInteraction();
};
