var anomalyResults = [];

function updateDate() {
    startDate = "" + document.getElementById('startDate').value;
    endDate = "" + document.getElementById('endDate').value;
    anomalyRequest["sDate"] = startDate;
    anomalyRequest["eDate"] = endDate;
}

function changeDataSet(ds) {
    dataSet = ds;
    updateDate();
    anomalyRequest["dsName"] = ds;
};

function changeVariableSelection(variable, selectionList) {
    updateDate();

}


function changePolarization(pol) {
    polarization = pol;
    updateDate();
    anomalyRequest["dsPolar"] = pol;

    if (pol == 'v') {
        document.getElementById("vertical").style.color = "black";
        document.getElementById("horizontal").style.color = "#B6B6B4";
    } else {
        document.getElementById("horizontal").style.color = "black";
        document.getElementById("vertical").style.color = "#B6B6B4";
    }
}

//pass full request to a new page, in localStorage
function sendRequest(anomalyRequest, mode) {
    //remove the current box
    dragNewBox();
    //
    if (mode === 0) {
        updateDate(); //update start/end date based on query
    }
    anomalyRequest["dsFreq"] = "s" + frequency + polarization;
    console.log(anomalyRequest);
    localStorage['userQuery'] = JSON.stringify(anomalyRequest);
    parseRequest(); //send and parse results
    updateDateValues(); //first 10 days from user query
    updatePixels(); //visualize results
};

function parseRequest(e) {
    console.log("making request....");

    ajaxHandle = $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        url: "./anomaly/ajaxRetrvAnomaly.do",
        data: localStorage["userQuery"],
        dataType: 'json',
        async: true,
        success: function(response) {
            console.log("________________ajax success!_________________");
            if ($.isEmptyObject(response)) {
                alert('No Anomaly Found, Try Another Query');
            } else {
                anomalyResults = response;
                requestReturned = 1;
                updatePixels();
            }
        }
    });
}

var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
var activeMonth = new Date().getMonth();
var save = 0;
var arrDates = [];

function updateDateValues() {
    sDate = JSON.parse(localStorage.userQuery)["sDate"];
    eDate = JSON.parse(localStorage.userQuery)["eDate"];

    startDate = new Date(sDate);
    slideDate = startDate;
    cDateNum = startDate;
    arrDates = GetDates(startDate, 10);
    //udpate labels for slider bar
    $(".slider").slider({
        min: 0,
        max: 9,
        value: 0
    }).slider("pips", {
        rest: "label",
        labels: arrDates
    });
}

function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
}

function changeDateRange(num) {
    var currentDate = new Date(slideDate.getDate());
    currentDate.setDate;
    slideDate.setDate(currentDate.getTime() + num);

    startDate = formatDate(slideDate); //update start date
    var currentDate = new Date(startDate);
    currentDate.setDate(slideDate.getDate() + 10);
    endDate = formatDate(currentDate); //update end date, need simplify code

    arrDates = GetDates(slideDate, 10); // next 10 days
    $(".slider").slider({
        min: 0,
        max: 9,
        value: 0
    }).slider("pips", {
        rest: "label",
        labels: arrDates
    })

    //send new query to server, no data cached so far, always query new data
    anomalyRequest["sDate"] = startDate;
    anomalyRequest["eDate"] = endDate;
    sendRequest(anomalyRequest, 1);
}

// find the next set of days
function GetDates(startDate, daysToAdd) {
    arrDates = [];
    for (var i = 1; i <= daysToAdd; i++) {
        var currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        arrDates.push(currentDate.getDate() + " " + months[currentDate.getMonth()] + " " + currentDate.getFullYear());
    }
    return arrDates;
}

function updatePixels() {
    var k, j = 0;
    var foo = [];

    var sliderValue = 0;

    if ((requestReturned == 1) && (anomalyResults.length !== 0)) {
        sliderValue = $(".slider").slider("value"); // which selection is highlighted
        timeSeconds = (slideDate.getTime() + sliderValue * 24 * 60 * 60 * 1000);

        slDate = new Date(0);
        slDate.setUTCSeconds((slideDate.getTime() + (sliderValue + 1) * 24 * 60 * 60 * 1000) / 1000);
        aReq = new Date(0);
        // should be zero!

        // if there is nothing, then what?
        aReq.setUTCSeconds(anomalyResults[0]["date"] / 1000);

        console.log("slideDate: " + slDate.getDate() + " " + (slDate.getMonth() + 1) + " " + slDate.getFullYear());
        console.log("requestDate: " + aReq.getDate() + " " + (aReq.getMonth() + 1) + " " + aReq.getFullYear());

        for (k = 0; k < anomalyResults.length; k++) {
            foo = anomalyResults[k];
            num = foo["date"] / 1000;
            d = new Date(0); // set date to epoch
            d.setUTCSeconds(num);

            // if the slider day matches any of the json anomalies
            if (d.getDate() == slDate.getDate() && d.getMonth() == slDate.getMonth() && d.getFullYear() == slDate.getFullYear()) {

                longi = foo["longi"];
                lati = foo["lati"];

            }
        } // end loop through anomalyResults json
    } else { // if request returned is 1
        console.log("...either waiting for the data or something went wrong?!");
    }
}
