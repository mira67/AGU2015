function updateMapAggregate( ){
	var k, j = 0; // loop vars
	var foo = []; // each entry on list

	// wait for response
	if( ( requestReturned == 1 ) && ( aggregateAnomalyResponse.length !== 0 ) ){
// need to reset request returned at some point
		console.log("...with " + aggregateAnomalyResponse.length + " anomalies.")
		document.getElementById("aggAnomRes").innerHTML = aggregateAnomalyResponse.length + " anomalies found!";
		
		source.clear();
		
		for(var k = 0; k < aggregateAnomalyResponse.length; k++){
			
			if( k == 0 ){
				redVectorSource.clear();
				blueVectorSource.clear();
			}
			foo = aggregateAnomalyResponse[k];
			longi = foo["longi"];
			lati = foo["lati"];
			mean = foo["mean"];
			frequency = foo["frequency"];

			var locations = ol.proj.transform([longi, lati], 'EPSG:4326', 'EPSG:3031');

			var iconFeature = new ol.Feature({
				geometry: new ol.geom.Point(locations)
			});

//$(".sliderThreshold").slider("values")[1]*10
			console.log("threshold: greater than " + $(".sliderThreshold").slider("values")[0] + ", and less than " + $(".sliderThreshold").slider("values")[1] );
			
			if( mean > $(".sliderThreshold").slider("values")[0]*10 && mean < $(".sliderThreshold").slider("values")[1]*10 ){
				redVectorSource.addFeature(iconFeature);
			} else {
				blueVectorSource.addFeature(iconFeature);
			}
		}
			
		map.addLayer(redVectorLayer);
		map.addLayer(blueVectorLayer);
		requestReturned = 0; // reset for next time
		
	} else { // if request returned is 1
		console.log("...waiting for the data or the length of aggregate anomaly request is zero?!");
	}
} // end updateMapAggregate

