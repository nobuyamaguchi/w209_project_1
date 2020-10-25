/* global d3, crossfilter, timeSeriesChart, barChart */

// date format for Date and Pace
var dateFmt = d3.timeParse("%Y-%m-%d %H:%M:%S");
var dateFmt2 = d3.timeParse("%M:%S")

// timeline
var chartTimeline = timeSeriesChart()
  .width(1080)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

// barchart for distance
var barChartDistance = barChart()
  .width(1080)
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

// barchart for cadence
var barChartCadence = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

// barchart for Avg HR
var barChartAvgHR = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

// barchart for training hour
var barChartHour = barChart()
  .x(function (d) { return d.key;})
  .y(function (d) { return d.value;});

// Define the div for the tooltip
var tooltips = d3.select("body").append("div")
    .attr("class", "tooltip")
    .attr("style", "opacity", 0);

d3.csv("static/data/Activities.csv",
  function (d) {
    // This function is applied to each row of the dataset
    // call dateFmt and dateFmt2
    d.Date = dateFmt(d.Date);
    d["Avg Pace"] = dateFmt2(d["Avg Pace"]);
    return d;
  },
  function (err, data) {
    if (err) throw err;

    var csData = crossfilter(data);

    // We create dimensions for each attribute we want to filter by
    csData.dimTime = csData.dimension(function (d) { return d.Date; });
    csData.dimDistance = csData.dimension(function (d) { return Math.floor(d.Distance); });

    // create dimension by 10 bpm
    csData.dimHeartRate = csData.dimension(function (d) { return Math.floor(d["Avg HR"]/10)*10; });
    csData.dimHour = csData.dimension(function (d) { return d.Date.getHours(); }); //

    csData.dimCadence = csData.dimension(function (d) { return Math.floor(d["Avg Run Cadence"]/10)*10; });

    // We bin each dimension
    // csData.timesByHour = csData.dimTime.group(d3.timeHour);
    csData.timesByHour = csData.dimTime.group(d3.timeWeek); // how many times per week
    csData.distanceBin = csData.dimDistance.group();
    csData.heartRateBin = csData.dimHeartRate.group();
    csData.extractHour = csData.dimHour.group(); //
    csData.cadenceBin = csData.dimCadence.group();

    // filter when brushed
    chartTimeline.onBrushed(function (selected) {
      csData.dimTime.filter(selected);
      update();
    });

    // filter on mounse over
    barChartDistance.onMouseOver(function (d) {
      csData.dimDistance.filter(d.key);
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "#90EE90"); // change the color on mounse over
      var xPosition = parseFloat(d3.select(this).attr("x"));
      var yPosition = parseFloat(d3.select(this).attr("y")) + 40;

      // show tooltip & add value inside tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 20)
                .style("background", "lightsteelblue")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");
      tooltips.html("You select "+d.key + " km<br/>"+ d.value + " times" )
          .style("left", (d3.event.pageX+5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimDistance.filterAll();

      // cleear tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 0);

      //change the color to steelblue
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "steelblue");
      update();
    });


    barChartCadence.onMouseOver(function (d) {

      csData.dimCadence.filter(d.key);

      // show tooltip & add value inside tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 20)
                .style("background", "lightsteelblue")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");
      tooltips.html("You select "+d.key + " spm<br/>"+ d.value + " times" )
          .style("left", (d3.event.pageX+5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "#90EE90"); // change the color on mounse over
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimCadence.filterAll();

      // cleear tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 0);

      //change the color to steelblue
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "steelblue");
      update();
    });

    barChartAvgHR.onMouseOver(function (d) {
      csData.dimHeartRate.filter(d.key);

      // show tooltip & add value inside tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 20)
                .style("background", "lightsteelblue")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");
      tooltips.html("You select "+d.key + " bpm<br/>"+ d.value + " times" )
          .style("left", (d3.event.pageX+5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

      // change the color on mounse over
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "#90EE90");
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimHeartRate.filterAll();

      // cleear tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 0);

      // change the color to steelblue
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "steelblue");
      update();
    });

    barChartHour.onMouseOver(function (d) {
      csData.dimHour.filter(d.key);

      // show tooltip & add value inside tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 20)
                .style("background", "lightsteelblue")
                .style("padding", "2px")
                .style("font", "12px sans-serif")
                .style("border", "0px")
                .style("border-radius", "8px")
                .style("pointer-events", "none");
      tooltips.html("You select "+d.key + " o'clock<br/>"+ d.value + " times" )
          .style("left", (d3.event.pageX+5) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

      // change the color on mounse over
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "#90EE90");
      update();
    }).onMouseOut(function () {
      // Clear the filter
      csData.dimHour.filterAll();

      // cleear tooltip
      tooltips.transition()
                .duration(200)
                .style("opacity", 0);

      // change the color to steelblue
      d3.select(this)
        .transition()
        .duration(250)
        .style("fill", "steelblue");
      update();
    });

    // update function
    function update() {
      d3.select("#timeline")
        .datum(csData.timesByHour.all())
        .call(chartTimeline);

      d3.select("#distance")
        .datum(csData.distanceBin.all())
        .call(barChartDistance);

      d3.select("#cadence")
        .datum(csData.cadenceBin.all())
        .call(barChartCadence);

      d3.select("#AverageHR")
        .datum(csData.heartRateBin.all())
        .call(barChartAvgHR);

      d3.select("#exerciseHour")
          .datum(csData.extractHour.all())
          .call(barChartHour);

    }

    update();


  }
);
