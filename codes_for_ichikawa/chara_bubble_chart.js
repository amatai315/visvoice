const width = 1000;
const height = 600;
const width_menu = 300;
const height_menu = 300;

var menu_character = d3.select("body")
    .append("div")
    .attr("width",width_menu)
    .attr("height",height_menu)
    .attr("class","menu_character");

var svg_character = d3.select("body")
    .append("svg")
    .attr("width",width)
    .attr("height",height)
    .attr("class","svg_chara");
  
var colorScale = d3.scaleOrdinal(d3.schemeCategory10);

var month_day_sum =[0,31,59,90,120,151,181,212,243,273,304,334,365];
const person = "麻倉もも";  //全体の実装では、声優のノードをタッチした時に、ここに声優の名前を取得できるようにする

var personal_data =[];
var yearScale = [];
var max_year = 0;
var min_year = 2030;
var marge = 100;
var keys = [];
const fixed_r = 30;
const img_width = 60;
const img_height = 60;
const select_year_range = 3; //年を選んだ時、その前後1年のデータのみを取ってくる
d3.json("./voice_actors_with_img_url.json").then(function(data){
  personal_data = data[person];
  
  
  personal_data.forEach(function(d){  
    var year = parseFloat(d.year.slice(0,4));
    var month = parseFloat(d.year.slice(5,7));
    var day = parseFloat(d.year.slice(8,10));
    year += (month_day_sum[month] + day) / 365;

    d.year_double = year; //作品の年を数値に変換したものを付け加える
    if(max_year < year){max_year = year;}
    if(min_year > year){min_year = year;}
    
    if(keys.indexOf(d.jenre) == -1){
      keys.push(d.jenre);  //含まれるジャンルの配列
    }

    d.radius = fixed_r; //ノードの半径
  })

  keys.sort();
  
  max_year = Math.ceil(max_year);
  min_year = Math.floor(min_year);
  yearScale = d3.scaleLinear().domain([min_year,max_year]).range([marge, width-marge]);

  var size = 20;
  var svg_labelcolor = svg_character
        .append("g")
        .attr("class","labelcolor");
  svg_labelcolor.selectAll("myrect")
    .data(keys)
    .enter()
    .append("rect")
      .attr("x", 400)
      .attr("y", function(d,i){ return 10 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return colorScale(d)});

  // Add one dot in the legend for each name.
  svg_labelcolor.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
      .attr("x", 400 + size*1.2)
      .attr("y", function(d,i){ return 10 + i*(size+5) + (size*3/4)}) // 100 is where the first dot appears. 25 is the distance between dots
      .style("fill", function(d){ return colorScale(d)})
      .text(function(d){ return d})
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");

  
})


var range = menu_character
  .append("input")
  .attr("id","select-year")
  .attr("type","range")
  .attr("id","range")
  .attr("min",parseInt(1980))
  .attr("max",parseInt(2020))
  .on("change",show_bubble_chart);  //値(年)を入れるごとにバブルチャートを表示

  


function show_bubble_chart(){
  var input = parseInt(document.getElementById("range").value);


  let xScale = d3.scaleLinear()
    .domain([input - select_year_range, input + select_year_range])
    .range([marge,width-marge]);
  
  //初期化操作
  const element = document.getElementById("x_axis");
  if(element != null){element.remove();}
  //svg_character.selectAll("circle").remove();
  //svg_character.selectAll("text").remove();
  svg_character.selectAll(".node_group_character").remove();
  //svg_character.selectAll("g").remove();
  
  svg_character.append("g")
    .attr("class", "x_axis")
    .attr("id","x_axis")
    .attr(
      "transform",
      "translate(" + [
        0,
        height / 2 + 100
      ].join(",") + ")"
    )
    .call(
      d3.axisBottom(xScale)
        .ticks(5)
    );
  
  yearScale = d3.scaleLinear().domain([input - select_year_range, input + select_year_range])
    .range([marge,width-marge]);

  var simulation =d3.forceSimulation()
    /*.force("link", d3.forceLink().id(function(d){
      return d.character;
    }))*/
    .force("charge",d3.forceManyBody().strength(5));
    //.force("center", d3.forceCenter(width/2, height/2)); //反発力の設定
    
  data_selected = []
  data_selected = personal_data
      .filter(function(d){
        if((d.year_double <= input + select_year_range) && (d.year_double >= input - select_year_range)){
          return true;
        }
      });
  
  console.log(input);
  console.log(data_selected);

  var tooltip = d3.select("body")
          .append("div")
          .attr("class", "tooltip");

  var nodes = svg_character
    .selectAll("circle")
    .data(data_selected).enter()
    .append("g")
    .attr("class", "node_group_character")
    .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
    .on("mouseover", function(event,d){
      //console.log(d);
      console.log(d.character);
      tooltip
        .style("opacity", 1.0)
        .html("anime:" + d.title + "<br/>character:" + d.character);
    })
    .on("mousemove", function(event,d){
      tooltip
      .style("left", (event.pageX) + "px")
      .style("top", (event.pageY) + "px");
    })
    .on("mouseout",function(d){
      //console.log("boo");
      tooltip.style("opacity",0.0);
    });
  
  //console.log(nodes);
    
  var cicles = svg_character.selectAll(".node_group_character")
      .append("circle")
      .attr("class","chara_node")
      .attr("stroke", "black")
      .attr("fill", function(d){return colorScale(d.jenre);})
      .attr("class", function(d){return "node_" + d.character;})
      .attr("r", (d)=>d.radius);
      //.on("click",clicked);
  
  var text = svg_character.selectAll(".node_group_character")
      .append("text")
      .attr("class","chara_node")
      .attr("font-size",9)
      .attr("stroke", "none")
      .attr("fill", "black")
      .text(function(d){return d.character;});

  svg_character.selectAll(".node_group_character")
      .append("image")
      .attr("xlink:href", (d)=>d.img_url)
      //.attr("xlink;href","https://cdn-ak.f.st-hatena.com/images/fotolife/k/k-side/20180212/20180212150928.jpg")
      .attr("width",img_width)
      .attr("height",img_height);

  simulation.nodes(personal_data)
      .force("x",d3.forceX((d)=>yearScale(d.year_double)).strength(0.05))
      .force("y",d3.forceY(height/2).strength(0.05))
      .force("collision",d3.forceCollide().radius((d)=>d.radius).iterations(5))
      .on("tick", ticked);
  
  function ticked() {

    nodes
      .selectAll("circle")
      .attr("cx", (d)=>d.x)
      .attr("cy",(d)=>d.y);

    nodes
      .selectAll("text")
      .attr("x", (d)=>d.x+10)
      .attr("y", (d)=>d.y+10);

    nodes
      .selectAll("image")
      .attr("x", (d)=>d.x - img_width/2)
      .attr("y",(d)=>d.y - img_height/2);

  }

  function dragstarted(event,d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  
  function dragged(event,d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  
  function dragended(event,d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }


}