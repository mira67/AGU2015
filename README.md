# mira67.github.io
Front/Back End Code 
---------------------------------------
Main page content Design, lead by Rudy


---------------------------------------
2nd Page Design, lead by Qi
Design:
1. In main page map: user specify a rectangle region by click and drag
2. Pop up "proceed?" confirmation dialog
  -if 'Yes': open a new tab with anomaly spatial/temporal analysis
  -if 'No': clear selected region, start over
3. 2nd page content - Todo

Progress:
1. Experiment to draw rectangle to select region, a piece of code working, need upgrade to be able to catch coordinaitons and clear up old selection or disregarded selection
2. Experiment to pop new page after user confirmation, using window.open works
3. Experiment to pass variables tp new page, using localStorage, works

To-Do:
1. See detail in progress to polish, upgrade region selection, add a region selection start button to trigger cross selection cursor
2. After main to 2nd page transition done, start working on the content in 2nd page: using region coordination to query anomaly spatial and temporal informaition and visualize


References:
[1]Highmap from highchart: http://www.highcharts.com/docs/maps/getting-started
[2]Jquery confirmation: http://craftpip.github.io/jquery-confirm/
[3]Jquery cookie: https://github.com/js-cookie/js-cookie

