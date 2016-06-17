
// code for locating coldest pixel in rectangular region
for(var jkl=0, ttt=1900, tempLocation=aggregateAnomalyResponse; jkl < (aggregateAnomalyResponse.length-1); jkl++ ){
	if( aggregateAnomalyResponse[jkl].mean < ttt ){
		ttt = aggregateAnomalyResponse[jkl].mean
		tempLocation = aggregateAnomalyResponse[jkl]
		console.log("new min: " + ttt)
	}
}

//new min: 1617.0149253731342
//Object {longi: 25.61548, lati: -80.6783, mean: 1617.0149253731342, frequency: 67}