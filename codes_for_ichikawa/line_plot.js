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

///
const width2 = 1000;
const height2 = 800;
const width_menu = 300;
const height_menu = 300;

// var menu_character = d3.select("body")
//   .append("div")
//   .attr("width", width_menu)
//   .attr("height", height_menu)
//   .attr("class", "menu_character");

// var svg_character = d3.select("body")
//   .append("svg")
//   .attr("width", width2)
//   .attr("height", height2)
//   .attr("class", "svg_chara");

var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var month_day_sum = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334, 365];
//const person = "子安武人"; 
const person = "沢城みゆき";  //全体の実装では、声優のノードをタッチした時に、ここに声優の名前を取得できるようにする
//const person = "神木龍之介";

var personal_data = [];
var yearScale = [];
var max_year = 0;
var min_year = 2030;
var marge = 100;
var keys = [];
const fixed_r = 35;
const img_width = 60;
const img_height = 60;
var select_year_range = 3; //年を選んだ時、その前後3年のデータのみを取ってくる
var select_node_num = 20; //画面に表示する最大のノード数
var current_year;
//上の二つは、そのうちボタンとかつけてユーザーが選べるようにする

var svg = d3
  .select("body")
  .append("div")
  .attr("id", "chartbox")
  .append("svg")
  .attr("id", "field")
  .attr("width", width)
  .attr("height", height);

var tooltip = d3.select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("visibility", "hidden");



d3.json("voice_actors.json").then(function (data) {
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
      current_year = val;
      showBubbleChart();
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


  /////ここからマージ

  
  const menu_character = d3.select("body")
  .append("div")
  .attr("class","menu_character")
  .attr("id","menu_character");

  menu_character.append("div")
  .text("年の幅")
  .attr("id","year_range_text");

  var year_range = menu_character
    .append("input")
    .attr("type","number")
    .attr("id","year_range")
    .attr("value","3")
    .attr("min","1")
    .attr("max","10")
    .on("input",()=>{
      var now_input = document.getElementById("year_range");
      select_year_range = parseInt(now_input.value);
      showBubbleChart();
    });

  menu_character.append("div")
    .text("ノードの数")
    .attr("id","num_node_text");
  
  var num_node = menu_character
    .append("input")
    .attr("type","number")
    .attr("id","num_node")
    .attr("class","input")
    .attr("min","5")
    .attr("max","40")
    .attr("step","5")
    .attr("value","20")
    .on("input",()=>{
      var now_input = document.getElementById("num_node");
      select_node_num = parseInt(now_input.value);
      showBubbleChart();
    });;

    


  d3.json("./voice_actors_with_img_url.json").then(function (data) {

    

    personal_data = data[person];


    personal_data.forEach(function (d) {
      var year = parseFloat(d.year.slice(0, 4));
      var month = parseFloat(d.year.slice(5, 7));
      var day = parseFloat(d.year.slice(8, 10));
      year += (month_day_sum[month] + day) / 365;

      d.year_double = year; //作品の年を数値に変換したものを付け加える
      if (max_year < year) { max_year = year; }
      if (min_year > year) { min_year = year; }

      if (keys.indexOf(d.jenre) == -1) {
        keys.push(d.jenre);  //含まれるジャンルの配列
      }

      d.radius = fixed_r; //ノードの半径
    });

    keys.sort();

    max_year = Math.ceil(max_year);
    min_year = Math.floor(min_year);
    yearScale = d3.scaleLinear().domain([min_year, max_year]).range([marge, width - marge]);

    var size = 20;
    var svg_labelcolor = svg
      .append("g")
      .attr("class", "labelcolor");
    svg_labelcolor.selectAll("myrect")
      .data(keys)
      .enter()
      .append("rect")
      .attr("x", 100)
      .attr("y", function (d, i) { return 10 + i * (size + 5) }) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function (d) { return colorScale(d) });

    // Add one dot in the legend for each name.
    svg_labelcolor.selectAll("mylabels")
      .data(keys)
      .enter()
      .append("text")
      .attr("x", 100 + size * 1.2)
      .attr("y", function (d, i) { return 10 + i * (size + 5) + (size * 3 / 4) }) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function (d) { return colorScale(d) })
      .text(function (d) { return d })
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

    

  });

  function showBubbleChart() {
    //current_year = val;
    var input = current_year;



    let xScale = d3.scaleLinear()
      .domain([input - select_year_range, input + select_year_range])
      .range([marge, width2 - marge]);

    //初期化操作
    const element = document.getElementById("x_axis");
    if (element != null) { element.remove(); }
    //svg_character.selectAll("circle").remove();
    //svg_character.selectAll("text").remove();
    svg.selectAll(".node_group_character").remove();
    //svg.selectAll("g").remove();


    yearScale = d3.scaleLinear().domain([input - select_year_range, input + select_year_range])
      .range([marge, width2 - marge]);

    var simulation = d3.forceSimulation()
      /*.force("link", d3.forceLink().id(function(d){
        return d.character;
      }))*/
      .force("charge", d3.forceManyBody().strength(5));
    //.force("center", d3.forceCenter(width/2, height/2)); //反発力の設定

    /*data_selected: 半径が大きい上位20個を取ってくる配列*/
    data_selected = []
    data_selected = personal_data
      .filter(function (d) {
        if ((d.year_double <= input + select_year_range) && (d.year_double >= input - select_year_range)) {
          return true;
        }
      });

    data_selected.sort(function (a, b) {
      if (a.radius > b.radius) return -1;
      if (a.radius < b.radius) return 1;
      return 0;
    });

    data_selected = data_selected.slice(0, select_node_num);

    console.log(input);
    console.log(data_selected);


    var nodes = svg
      .selectAll("circle")
      .data(data_selected)
      .enter()
      .append("g")
      .attr("class", "node_group_character")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    //console.log(nodes);
    var circles = svg.selectAll(".node_group_character")
      .append("circle")
      .attr("id", (d) => d.character)
      .attr("class", "chara_node")
      .attr("fill", function (d) { return colorScale(d.jenre); })
      .attr("class", function (d) { return "node_" + d.character; })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .attr("r", (d) => d.radius);
    //.on("click",clicked);

    svg.selectAll(".node_group_character").append("clipPath")
      .attr("id", (d) => `clip-${d.character.replace(' ', '')}`)
      .append("use")
      .attr("xlink:href", (d) => `#${d.character.replace(' ', '')}`)


    
    svg.selectAll(".node_group_character")
      .append("image")
      .attr("clip-path",(d)=>`url(#clip-${d.character.replace(' ', '')})`)
      .attr("xlink:href", (d) => d.img_url)
      .attr("width", 200)
      .attr("height", 200)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut);

    var text = svg.selectAll(".node_group_character")
      .append("text")
      .attr("class", "chara_node")
      .attr("font-size", 10)
      .attr("stroke", "none")
      .attr("fill", "black")
      .text(function (d) { return d.character.replace(' ', ''); });

    simulation.nodes(data_selected)
      // .force("x", d3.forceX((d) => yearScale(d.year_double)).strength(0.05))
      // .force("y", d3.forceY(height / 2).strength(0.05))
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 4).strength(0.1))
      .force("charge", d3.forceManyBody().strength(1))
      .force("collision", d3.forceCollide().radius((d) => d.radius).iterations(5))
      .on("tick", ticked);

    function mouseOver(event, d) {
      tooltip.html("anime:" + d.title + "<br/>character:" + d.character)
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY) + "px")
        .style("visibility", "visible");
    }

    function mouseOut() {
      tooltip.style("visibility", "hidden");
    }

    function ticked() {
      nodes
        .selectAll("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y);

      nodes
        .selectAll("text")
        .attr("x", (d) => d.x + 10)
        .attr("y", (d) => d.y + 10);

      nodes
        .selectAll("image")
        .attr("x", (d) => d.x - img_width / 2)
        .attr("y", (d) => d.y - img_height / 2);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }
});
