$(document).ready(function() {
    /*Load User Request from Main page*/
    query = JSON.parse(localStorage["userQuery"]);
    console.log(query);

    /*get Next or Prev 10 days anomalies*/
    $('#next').on('click', getNext);
    $('#prev').on('click', getPrev);

    //image slider bar
    var months = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
    // lets be fancy for the demo and select the current month.
    var activeMonth = new Date().getMonth();

    $(".slider")
        // activate the slider with options
        .slider({
            min: 0,
            max: months.length - 1,
            value: activeMonth
        })

    // add pips with the labels set to "months"
    .slider("pips", {
        rest: "label",
        labels: months
    })

    // and whenever the slider changes, lets echo out the month
    .on("slidechange", function(e, ui) {
        $("#labels-months-output").text("You selected " + months[ui.value] + " (" + ui.value + ")");
        //display corresponding images based on selected date
        $("#image").attr("src", "images/" + months[ui.value] + ".png");
        console.log("images/" + months[ui.value] + ".png");
    });
}); //end of Document Ready

//get Prev, Next 10 days anomalies
function getNext() {
    console.log('test');
}

function getPrev() {

}


/*
            //test data for UI rendering
            testData = [{"date":1350885600000,"val":222.1,"longi":100.0,"lati":100.0},{"date":1375336800000,"val":209.8,"longi":100.0,"lati":100.0},{"date":1375423200000,"val":209.4,"longi":100.0,"lati":100.0},{"date":1375509600000,"val":209.4,"longi":100.0,"lati":100.0},{"date":1375596000000,"val":210.6,"longi":100.0,"lati":100.0},{"date":1375682400000,"val":212.1,"longi":100.0,"lati":100.0}];

            //test local storage to grab user request information
                var _region = localStorage.getItem('_Region');
               //parse to Object Literal the JSON object
               if(_region) _region = JSON.parse(_region);
               //Checks whether the stored data exists
               if(_region) {
                 //Do what you need with the object
                 alert(_region);
                 //If you want to delete the object
                 localStorage.removeItem('_Region');
               }

            //send user request package to server----testing code from Chao
             function sendJson() {
                   var loctnArray = Array();
                   loctnArray[0] = {
                        "longitude" : 100,
                        "latitude" : 100
                   }
                   loctnArray[1] = {
                        "longitude" : 200,
                        "latitude" : 200
                   }
         
                   var anomlyRequest = {
                        "dsName" : "SSMI",
                        "dsFreq" : "s19h",
                        "sDate" : "20120101",
                        "eDate" : "20130101",
                        "locations" : loctnArray
                   }
         
                   var ajaxHandle = $.ajax({
                        type : "POST",
                        contentType : "application/json; charset=utf-8",
                        url : "anomaly/ajaxRetrv.do",
                        data : JSON.stringify(anomlyRequest),
                        dataType : 'jsonp',
                        async : false,
                        success : function(response) {
                             $("#expDiv").html("Hi")
                        }
                   });
                   $("#expDiv").html(ajaxHandle.responseText)
             }

            */
