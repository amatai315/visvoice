const height = 1000;
const width = 2000;
const width_menu = 500;
var colorScale = d3.scaleOrdinal(d3.schemePaired);
var currentTransform = { k: 1, x: 0, y: 0 };
var actorSelected = false;
const canvas = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(d3.zoom().scaleExtent([1, 8]).on("zoom", zoom));
canvas
  .append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "floralwhite");
const animeSelectionSVG = canvas.append("g");
function zoom(event) {
  if (!actorSelected) {
    animeSelectionSVG.attr("transform", event.transform);
    currentTransform = event.transform;
  }
}

var actorDataSVG;

const selectedWorkTextElement = canvas
  .append("text")
  .attr("font-size", 50)
  .attr("x", 20)
  .attr("y", 50);

function transform(t) {
  return function (d) {
    return "translate(" + t.apply(d) + ")";
  };
}

const menu = d3
  .select("body")
  .append("div")
  .attr("class", "menu")
  .style("height", height)
  .style("width", width_menu);

const worksList = [];
const actorsDict = {};

// const dataProcessingText = canvas
//   .append("text")
//   .attr("x", width / 2)
//   .attr("y", height / 2)
//   .attr("font-size", 60)
//   .attr("text-anchor", "middle")
//   .text("データ処理中です");
const processPlace = d3
  .select("body")
  .append("div")
  .attr("class", "loader-wrap");
const dataProcessingText = processPlace.append("div").attr("class", "loader");

d3.csv("data/voice_actors_greater_than_100characters.csv").then((data) => {
  var i = 0;
  data.forEach((d) => {
    const work = worksList.find(
      (w) => w.title == d.title && w.jenre == d.jenre
    );
    if (work === undefined) {
      worksList.push({
        jenre: d.jenre,
        title: d.title,
        dataAboutWork: [d],
      });
    } else {
      work.dataAboutWork.push(d);
    }
    if (actorsDict[d.name] === undefined) {
      actorsDict[d.name] = [
        {
          jenre: d.jenre,
          title: d.title,
          character: d.character,
          year: d.year,
          hitNum: d.hit_num,
          imageLink: d.image_link,
        },
      ];
    } else
      actorsDict[d.name].push({
        jenre: d.jenre,
        title: d.title,
        character: d.character,
        year: d.year,
        hitNum: d.hit_num,
        imageLink: d.image_link,
        id: i,
      });
    i = i + 1;
  });

  processPlace.transition().delay(500).remove();
  searchWorks();
});

menu.append("div").text("作品名で検索");

menu
  .append("input")
  .attr("id", "search-text")
  .attr("type", "text")
  .attr("placeholder", "作品名で検索")
  .on("input", searchWorks);

menu.append("div").attr("id", "search-result-hit-num");
const searchResultListElement = menu
  .append("div")
  .attr("id", "search-result-list");
const jenreList = [
  "アニメ",
  "ゲーム",
  "ドラマ",
  "日本映画",
  "海外映画",
  "漫画",
  "特撮/人形劇",
  "その他",
];

function searchWorks() {
  const searchText = d3.select("#search-text").node().value;

  d3.selectAll("#search-result-hit-num").text("");
  d3.selectAll("#search-result-list div").remove();

  if (searchText != "") {
    jenreList.forEach((jenre) => {
      searchResultListElement
        .append("div")
        .attr("class", "jenre")
        .attr("id", `jenre-${jenreToAlphabet(jenre)}`)
        .text(`${jenre}`)
        .style("font-weight", "bold");
    });
    worksList
      .filter((d) => d.title.indexOf(searchText) != -1)
      .forEach((d) => {
        const applyWorkButtonWrapper = d3
          .select(`#jenre-${jenreToAlphabet(d.jenre)}`)
          .append("div")
          .attr("class", "work")
          .style("font-weight", "normal");
        applyWorkButtonWrapper.append("div").text(`${d.title}`);
        applyWorkButtonWrapper
          .append("button")
          .attr("value", d.title)
          .text("Apply")
          .on("click", () => {
            if (actorSelected) {
              clickedReturnToWorkButton();
            }
            selectedWorkTextElement.text(d.title);
            updateActorsBubble(d.title);
          });
      });
    const hitNum = d3.selectAll("#search-result-list .work").size();
    d3.selectAll("#search-result-hit-num").text(`${hitNum}件ヒットしました`);
    jenreList.forEach((jenre) => {
      const jenreElement = d3.select(`#jenre-${jenreToAlphabet(jenre)}`);
      if (jenreElement.selectChildren(".work").size() == 0)
        jenreElement.remove();
    });
  } else {
    const recommendedWorks = [
      "涼宮ハルヒの憂鬱",
      "ソードアート・オンライン",
      "とある魔術の禁書目録<インデックス>",
      "氷菓",
      "ノーゲーム・ノーライフ",
      "鬼滅の刃",
      "四月は君の嘘",
    ];
    searchResultListElement
      .append("div")
      .attr("class", "jenre")
      .attr("id", "recommended-works")
      .text("おすすめ作品")
      .style("font-weight", "bold");
    worksList
      .filter((work) => recommendedWorks.indexOf(work.title) != -1)
      .forEach((d) => {
        const applyWorkButtonWrapper = d3
          .select("#recommended-works")
          .append("div")
          .attr("class", "work")
          .style("font-weight", "normal");
        applyWorkButtonWrapper.append("div").text(`${d.title}`);
        applyWorkButtonWrapper
          .append("button")
          .attr("value", d.title)
          .text("Apply")
          .on("click", () => {
            if (actorSelected) {
              clickedReturnToWorkButton();
            }
            selectedWorkTextElement.text(d.title);
            updateActorsBubble(d.title);
          });
      });
  }
}

function jenreToAlphabet(jenre) {
  switch (jenre) {
    case "アニメ":
      return "anime";
    case "ゲーム":
      return "game";
    case "ドラマ":
      return "dorama";
    case "日本映画":
      return "japanese-movie";
    case "海外映画":
      return "foreign-movie";
    case "漫画":
      return "comic";
    case "特撮/人形劇":
      return "special-photographing-and-puppet-show";
    default:
      return "others";
  }
}

function updateActorsBubble(titleSelected) {
  var simulation = d3
    .forceSimulation()
    .force(
      "collision",
      d3.forceCollide().radius((d) => d.radius + 2)
    )
    .force("center", d3.forceCenter(width / 2, height / 2));

  const validDataList = [];
  worksList
    .find((w) => w.title == titleSelected)
    .dataAboutWork.forEach((d) => {
      validDataList.push(d);
    });

  const actorsAndChars = [];

  validDataList.forEach((d) => {
    actorsAndChars.push({
      name: d.name,
      type: "actor",
      char: d.character,
      image_link: d.image_link,
      radius: nodeRadius(),
    });
  });

  animeSelectionSVG.selectAll("line").remove();
  animeSelectionSVG.selectAll("g").remove();

  const nodes = animeSelectionSVG
    .selectAll("circle")
    .data(actorsAndChars)
    .enter()
    .append("g")
    .attr("class", "node_group")
    .call(
      d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    )
    .on("click", clickedActorNode)
    .style("cursor", "pointer");

  nodes
    .append("circle")
    .attr("stroke", "pink")
    .attr("fill", "white")
    .attr("r", (d) => d.radius);

  nodes
    .append("text")
    .attr("class", "char-name")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .attr("stroke", "black")
    .text((d) => d.char);

  nodes
    .append("text")
    .attr("class", "actor-name")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .attr("stroke", "black")
    .text((d) => d.name);

  const imageWidth = 60;
  const imageHeight = 60;

  nodes
    .append("image")
    .attr("width", imageWidth)
    .attr("height", imageHeight)
    .attr("text-anchor", "middle")
    .attr("xlink:href", (d) => d.image_link);

  simulation.nodes(actorsAndChars).on("tick", ticked);

  function ticked() {
    nodes
      .selectAll("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    nodes
      .selectAll(".char-name")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 40);

    nodes
      .selectAll(".actor-name")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y + 40);

    nodes
      .selectAll("image")
      .attr("x", (d) => d.x - imageWidth / 2)
      .attr("y", (d) => d.y - imageHeight / 2);
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

  function nodeRadius() {
    return 60;
  }
}

function clickedActorNode(event, d) {
  //ここに、声優のノードがノードがクリックされたときの挙動を書く感じです。
  //声優名は、d.nameで取得できます。
  const selectedActorNode = d3.select(event.currentTarget);
  const durationTime = 750;

  if (!actorSelected) {
    selectedWorkTextElement
      .transition()
      .duration(durationTime)
      .attr("opacity", 0);
    const node = selectedActorNode.select("circle");
    const k = 30;
    animeSelectionSVG
      .transition()
      .duration(durationTime)
      .attr(
        "transform",
        `translate(${width / 2},${height / 2})scale(${k})
             translate(${-node.attr("cx")},${-node.attr("cy")})`
      );
    animeSelectionSVG
      .selectAll("text")
      .transition()
      .duration(durationTime)
      .attr("opacity", 0);
    animeSelectionSVG
      .selectAll("image")
      .transition()
      .duration(durationTime)
      .attr("opacity", 0);
    actorDataSVG = d3
      .select("body")
      .append("svg")
      .attr("id", `detail_${d.name}`)
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute");
    //
    actorDetail(d.name, actorDataSVG);
    // actorDataSVG
    //   .append("circle")
    //   .attr("x", 1100)
    //   .attr("y", 100)
    //   .attr("height", 100)
    //   .attr("width", 100)
    //   .attr("fill", "red")
    //   .on("click", clickedReturnToWorkButton);
    actorDataSVG
      .append("image")
      .attr("xlink:href", "./image/share-solid.svg")
      .attr("x", 1100)
      .attr("y", 100)
      .attr("width", 100)
      .attr("height", 100)
      .on("click", clickedReturnToWorkButton)
      .style("cursor", "pointer");
    actorSelected = !actorSelected;
  }
}

function clickedReturnToWorkButton() {
  const durationTime = 750;
  selectedWorkTextElement
    .transition()
    .duration(durationTime)
    .attr("opacity", 1);
  animeSelectionSVG
    .transition()
    .duration(durationTime)
    .attr(
      "transform",
      `translate(${currentTransform.x},${currentTransform.y})scale(${currentTransform.k})`
    );
  animeSelectionSVG
    .selectAll("text")
    .transition()
    .duration(durationTime)
    .attr("opacity", 1);
  animeSelectionSVG
    .selectAll("image")
    .transition()
    .duration(durationTime)
    .attr("opacity", 1);
  actorDataSVG.remove();
  actorSelected = !actorSelected;

  d3.select("#menu_character").remove();
}

function actorDetail(actor, actorDataSVG) {
  var width = 1200;
  var height = 1000;
  var margin = { top: 30, bottom: 60, right: 30, left: 60 };
  var time = 0;
  let dataset = {};
  var maxtime = 0;
  var mintime = 0;
  var forPlot = [];
  var scale = [];
  var forStack = [];
  var StackList = [];
  var jenreList = [];

  var colorScale = d3.scaleOrdinal(d3.schemePaired);

  var month_day_sum = [
    0,
    31,
    59,
    90,
    120,
    151,
    181,
    212,
    243,
    273,
    304,
    334,
    365,
  ];
  const person = actor; //全体の実装では、声優のノードをタッチした時に、ここに声優の名前を取得できるようにする

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
  //上の二つは、そのうちボタンとかつけてユーザーが選べるようにする
  var current_year;

  var svg = actorDataSVG
    .append("g")
    .attr("id", "chartbox")
    .append("svg")
    .attr("id", "field")
    .attr("width", width)
    .attr("height", height);

  var tooltip = actorDataSVG
    .append("g")
    .attr("class", "tooltip")
    .style("visibility", "hidden");

  var focus = actorsDict[person];
  focus.forEach((d) => {
    time = d.year.slice(0, 4);
    if (!Object.keys(dataset).includes(time)) {
      dataset[time] = 1;
    } else {
      dataset[time] += 1;
    }
    if (!Object.values(jenreList).includes(d.jenre)) {
      jenreList.push(d.jenre);
    }
  });

  var years = Object.keys(dataset);
  maxtime = Math.max(...years);
  mintime = Math.min(...years);
  scale.push(mintime);
  scale.push(maxtime);
  var timelabel = [];
  for (var i = mintime; i <= maxtime; i++) {
    timelabel.push(i);
  }
  for (var i = 0; i < years.length; i++) {
    forPlot.push([parseInt(years[i]), dataset[years[i]]]);
  }

  for (var i = 0; i < timelabel.length; i++) {
    forStack.push({ year: timelabel[i] });
    for (var j = 0; j < jenreList.length; j++) {
      forStack[i][jenreList[j]] = 0;
    }
  }
  focus.forEach((d) => {
    time = d.year.slice(0, 4);
    for (var i = 0; i < forStack.length; i++) {
      if (forStack[i].year == time) {
        forStack[i][d.jenre] += 1;
      }
    }
  });

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
    .attr("stroke", "none")
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

  var stackedData = d3.stack().keys(jenreList)(forStack);
  // エリアの表示
  var linearea = svg
    .selectAll("mylayers")
    .data(stackedData)
    .enter()
    // .select("body")
    // .select("div#chartbox")
    // .select("svg#field")
    .append("path")
    .style("fill", function (d, i) {
      return colorScale(d.key);
    })
    .attr(
      "d",
      d3
        .area()
        .x(function (d) {
          return xScale(d.data.year);
        })
        .y0(function (d) {
          return yScale(d[0]);
        })
        .y1(function (d) {
          return yScale(d[1]);
        })
    );

  let totalLength = line.node().getTotalLength();

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

  var sliderTime = d3
    .sliderBottom()
    .min(mintime)
    .max(maxtime)
    .step(1)
    .width(1000 + 100)
    .tickValues(timelabel)
    .on("onchange", (val) => {
      current_year = parseInt(val);
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

  const menu_character = d3
    .select("body")
    .append("div")
    .attr("class", "menu_character")
    .attr("id", "menu_character");

  menu_character.append("div").text("年の幅").attr("id", "year_range_text");

  var year_range = menu_character
    .append("input")
    .attr("type", "number")
    .attr("id", "year_range")
    .attr("value", "3")
    .attr("min", "1")
    .attr("max", "10")
    .on("input", () => {
      var now_input = document.getElementById("year_range");
      select_year_range = parseInt(now_input.value);
      showBubbleChart();
    });

  menu_character.append("div").text("ノードの数").attr("id", "num_node_text");

  var num_node = menu_character
    .append("input")
    .attr("type", "number")
    .attr("id", "num_node")
    .attr("class", "input")
    .attr("min", "5")
    .attr("max", "40")
    .attr("step", "5")
    .attr("value", "20")
    .on("input", () => {
      var now_input = document.getElementById("num_node");
      select_node_num = parseInt(now_input.value);
      showBubbleChart();
    });

  personal_data = actorsDict[person];

  personal_data.forEach(function (d) {
    var year = parseFloat(d.year.slice(0, 4));
    var month = parseFloat(d.year.slice(5, 7));
    var day = parseFloat(d.year.slice(8, 10));
    year += (month_day_sum[month] + day) / 365;

    d.year_double = year; //作品の年を数値に変換したものを付け加える
    if (max_year < year) {
      max_year = year;
    }
    if (min_year > year) {
      min_year = year;
    }

    if (keys.indexOf(d.jenre) == -1) {
      keys.push(d.jenre); //含まれるジャンルの配列
    }
    //ノードの半径
    if (Math.log10(d.hitNum) * 10 < 20) {
      d.radius = 20;
    } else {
      d.radius = Math.log10(d.hitNum) * 10;
    }
  });

  keys.sort();

  max_year = Math.ceil(max_year);
  min_year = Math.floor(min_year);
  yearScale = d3
    .scaleLinear()
    .domain([min_year, max_year])
    .range([marge, width - marge]);

  var size = 20;
  var svg_labelcolor = svg.append("g").attr("class", "labelcolor");
  svg_labelcolor
    .selectAll("myrect")
    .data(keys)
    .enter()
    .append("rect")
    .attr("x", 100)
    .attr("y", function (d, i) {
      return 10 + i * (size + 5);
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function (d) {
      return colorScale(d);
    });

  // Add one dot in the legend for each name.
  svg_labelcolor
    .selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", 100 + size * 1.2)
    .attr("y", function (d, i) {
      return 10 + i * (size + 5) + (size * 3) / 4;
    }) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function (d) {
      return colorScale(d);
    })
    .text(function (d) {
      return d;
    })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");

  function showBubbleChart() {
    var input = current_year;

    let xScale = d3
      .scaleLinear()
      .domain([input - select_year_range, input + select_year_range])
      .range([marge, width - marge]);

    //初期化操作
    const element = document.getElementById("x_axis");
    if (element != null) {
      element.remove();
    }
    //svg_character.selectAll("circle").remove();
    //svg_character.selectAll("text").remove();
    svg.selectAll(".node_group_character").remove();
    //svg.selectAll("g").remove();

    yearScale = d3
      .scaleLinear()
      .domain([input - select_year_range, input + select_year_range])
      .range([marge, width - marge]);

    var simulation = d3
      .forceSimulation()
      .force(
        "link",
        d3.forceLink().id(function (d) {
          return d.character;
        })
      )
      .force("charge", d3.forceManyBody().strength(5));
    // .force("center", d3.forceCenter(width / 2, height / 2)); //反発力の設定

    /*data_selected: 半径が大きい上位20個を取ってくる配列*/
    data_sorted = [];
    data_selected = [];
    data_sorted = personal_data.filter(function (d) {
      if (
        d.year_double <= input + select_year_range &&
        d.year_double >= input - select_year_range
      ) {
        return true;
      }
    });

    data_sorted = data_sorted.sort(function (a, b) {
      if (a.radius > b.radius) return -1;
      if (a.radius < b.radius) return 1;
      return 0;
    });

    var anime_counter = 0;
    for(var i = 0; i < data_sorted.length; i++){
      if((data_sorted[i].jenre == "アニメ" || data_sorted[i].jenre == "ゲーム") && anime_counter < select_node_num){
        data_selected.push(data_sorted[i]);
        anime_counter += 1;
      }
      else if (!(data_sorted[i].jenre == "アニメ" || data_sorted[i].jenre == "ゲーム")){
        data_selected.push(data_sorted[i]);
      }
    }

    var nodes = svg
      .selectAll("circle")
      .data(data_selected)
      .enter()
      .append("g")
      .attr("class", "node_group_character")
      .call(
        d3
          .drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    var circles = svg
      .selectAll(".node_group_character")
      .append("circle")
      .attr("id", (d) => d.id)
      .attr("class", "chara_node")
      .attr("fill", function (d) {
        return colorScale(d.jenre);
      })
      .attr("stroke", function (d) {
        return colorScale(d.jenre);
      })
      .attr("stroke-width", 2.5)
      .attr("class", function (d) {
        return "node_" + d.character;
      })
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .on("click", function (d, click_node) {
        const selectedcharaNode = d3.select(d.currentTarget);
      })
      .attr("x", width / 2)
      .attr("y", height / 4)
      .attr("r", 0)
      .transition()
      .duration(1500)
      .ease(d3.easeElasticOut)
      .tween("circleIn", (d) => {
        //node image and circle action. use moveable d.r value
        let i = d3.interpolateNumber(0, d.radius);
        //what is t??
        return (t) => {
          d.r = i(t);
          simulation.force(
            "collide",
            d3.forceCollide((d) => d.r)
          );
        };
      });

    d3.selectAll(".node_group_character").style("cursor", "pointer");
    svg
      .selectAll(".node_group_character")
      .append("clipPath")
      .attr("id", (d) => `clip-${d.id}`)
      .append("use")
      .attr("xlink:href", (d) => `#${d.id}`);

    svg
      .selectAll(".node_group_character")
      .append("image")
      .classed("node-icon", true)
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .attr("xlink:href", (d) => d.imageLink)
      .on("mouseover", mouseOver)
      .on("mouseout", mouseOut)
      .attr("preserveAspectRatio", "xMidYMid slice");

    var text = svg
      .selectAll(".node_group_character")
      .append("text")
      .attr("class", "chara_node")
      .attr("font-size", 10)
      .attr("stroke", "#mediumblue")
      .attr("text-anchor", "middle")
      .transition()
      .delay(500)
      .text(function (d) {
        return d.character;
      });

    simulation
      .nodes(data_selected)
      .force("x", d3.forceX(width / 2).strength(0.1))
      .force("y", d3.forceY(height / 4).strength(0.1))
      .force("charge", d3.forceManyBody().strength(1))
      .force(
        "collision",
        d3
          .forceCollide()
          .radius((d) => d.radius)
          .iterations(5)
      )
      .on("tick", ticked);

    function mouseOver(event, d) {
      tooltip
        .html("anime:" + d.title + "<br/>character:" + d.character)
        .style("left", event.pageX + "px")
        .style("top", event.pageY + "px")
        .style("visibility", "visible");
    }

    function mouseOut() {
      tooltip.style("visibility", "hidden");
    }

    function ticked() {
      nodes
        .selectAll("circle")
        .attr("cx", (d) => d.x)
        .attr("cy", (d) => d.y)
        .attr("r", (d) => d.r);

      nodes
        .selectAll("text")
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y + d.radius + 10);

      nodes
        .selectAll("image")
        .attr("width", (d) => d.r * 2)
        .attr("height", (d) => d.r * 2)
        .attr("x", (d) => d.x - d.r)
        .attr("y", (d) => d.y - d.r);
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
}
