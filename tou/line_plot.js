var width = 1200;
var height = 1000;
var margin = { top: 30, bottom: 60, right: 30, left: 60 };
var time = 0;
let dataset = {};
let focus = [];
var maxtime = 0;
var mintime = 0;
var forPlot = [];
var scale = [];
let color = d3.rgb("#fbc2eb");

var svg = d3
  .select("body")
  .append("div")
  .attr("id", "chartbox")
  .append("svg")
  .attr("id", "field")
  .attr("width", width)
  .attr("height", height);

d3.json("data/voice_actors.json").then(function (data) {
  // let dataset = {};
  focus = data["沢城みゆき"];
  focus.forEach((d) => {
    time = d.year.slice(0, 4);
    if (!Object.keys(dataset).includes(time)) {
      dataset[time] = 1;
    } else {
      dataset[time] += 1;
    }
  });
  var years = Object.keys(dataset);
  maxtime = Math.max(...years);
  mintime = Math.min(...years);
  scale.push(mintime);
  scale.push(maxtime);
  for (var i = 0; i < years.length; i++) {
    forPlot.push([parseInt(years[i]), dataset[years[i]]]);
  }
  ///

  //軸のスケール設定・表示
  var xScale = d3
    .scaleLinear()
    .domain(scale)
    .range([margin.left, width - margin.right]);

  var yScale = d3
    .scaleLinear()
    .domain([0, 80])
    .range([height - margin.bottom, margin.top]);

  var axisx = d3.axisBottom(xScale).ticks(scale[1] - scale[0]);
  var axisy = d3.axisLeft(yScale).ticks(5);

  // svg
  //   .append("g")
  //   .attr("transform", "translate(" + 0 + "," + (height - margin.bottom) + ")")
  //   .call(axisx)
  //   .append("text")
  //   .attr("fill", "black")
  //   .attr("x", (width - margin.left - margin.right) / 2 + margin.left)
  //   .attr("y", 35)
  //   .attr("text-anchor", "middle")
  //   .attr("font-size", "10pt")
  //   .attr("font-weight", "bold")
  //   .text("year");

  svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")")
    .call(axisy)
    .append("text")
    .attr("fill", "black")
    .attr("text-anchor", "middle")
    .attr("x", -(height - margin.top - margin.bottom) / 2 - margin.top)
    .attr("y", -35)
    .attr("transform", "rotate(-90)")
    .attr("font-weight", "bold")
    .attr("font-size", "10pt")
    .text("A number of titles");
  //ラインの表示
  var line = svg
    .append("path")
    .datum(forPlot)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 1.5)
    .attr(
      "d",
      d3
        .line()
        .x(function (d) {
          return xScale(d[0]);
        })
        .y(function (d) {
          return yScale(d[1]);
        })
    );
  //エリアの表示
  var linearea = svg
    .append("path")
    .datum(forPlot)
    .attr("fill", "url('#gradient')")
    .attr(
      "d",
      d3
        .area()
        .x(function (d) {
          return xScale(d[0]);
        })
        .y1(function (d) {
          return yScale(d[1]);
        })
        .y0(yScale(0))
    );

  // g = svg.append("g");
  var linearGradient = svg
    .append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("gradientTransform", "rotate(90)");

  linearGradient
    .append("stop")
    .attr("class", "stop-left")
    .attr("offset", "0%")
    .attr("stop-color", "#fbc2eb");

  linearGradient
    .append("stop")
    .attr("class", "stop-right")
    .attr("offset", "100%")
    .attr("stop-color", "#a6c1ee");

  let totalLength = line.node().getTotalLength();
  line
    .attr("stroke-dasharray", totalLength + " " + totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
    .duration(1000)
    .ease(d3.easeCircleInOut)
    .attr("stroke-dashoffset", 0);
  linearea
    .style("opacity", 0)
    .transition()
    .delay(500)
    .duration(300)
    .ease(d3.easeCircleOut)
    .style("opacity", 1);

  //スライドバー設定
  // var slidevar = d3.select("svg#field").append("g").attr("id", "timevalue");
  var timevalue = svg.append("g").attr("id", "timeslider");

  var timelabel = [];
  for (var i = mintime; i <= maxtime; i++) {
    timelabel.push(i);
  }
  var sliderTime = d3
    .sliderBottom()
    .min(mintime)
    .max(maxtime)
    .step(1)
    .width(1000 + 100)
    .tickValues(timelabel)
    .on("onchange", (val) => {
      console.log(val);
      // d3.select("p#timevalue").text(val);
    });
  var gTime = d3
    .select("g#timeslider")
    .attr(
      "transform",
      "translate(" +
        (margin.left - 23) +
        "," +
        (height - margin.bottom - 10) +
        ")"
    )
    .append("g")
    .attr("transform", "translate(25,10)");

  gTime.call(sliderTime);
  //初期表示値
  // d3.select("p#timevalue").text(mintime);
});
