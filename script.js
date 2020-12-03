const height = 1000;
const width = 2000;
const width_menu = 500;
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
var svg = canvas.append("g");
function zoom(event) {
  svg.attr("transform", event.transform);
}

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

d3.csv("./data/voice_actors.csv").then((data) => {
  data.forEach((d) => {
    const work = worksList.find(
      (w) => w.title == d.title && w.jenre == d.jenre
    );
    if (work === undefined) {
      worksList.push({
        jenre: d.jenre,
        title: d.title,
        selected: false,
        dataAboutWork: [d],
      });
    } else {
      work.dataAboutWork.push(d);
    }
  });

  console.log(worksList);
});

menu
  .append("input")
  .attr("id", "search-text")
  .attr("type", "text")
  .attr("placeholder", "検索ワードを入力")
  .on("input", searchWorks);

menu.append("div").attr("id", "search-result-hit-num");

menu.append("div").attr("id", "search-result-list");

function searchWorks() {
  const searchText = d3.select("#search-text").node().value;

  d3.selectAll("#search-result-list > div").remove();
  d3.selectAll("#search-result-hit-num").text("");

  if (searchText != "") {
    worksList
      .filter((d) => d.title.indexOf(searchText) != -1)
      .forEach((d) => {
        const checkboxWrapper = d3
          .select("#search-result-list")
          .append("div")
          .attr("class", "work");
        const checkbox = checkboxWrapper
          .append("input")
          .attr("type", "checkbox")
          .attr("value", d.title)
          .on("change", () => {
            d.selected = !d.selected;
            updateGraph();
          });
        if (d.selected) checkbox.attr("checked", "checked");
        checkboxWrapper.append("div").text(`${d.title}`);
      });
    const hitNum = d3.selectAll("#search-result-list .work").size();
    d3.selectAll("#search-result-hit-num").text(`${hitNum}件ヒットしました`);
  }
}

var center_x = (width - width_menu) / 2;
var center_y = height / 2;

function updateGraph() {
  var simulation = d3
    .forceSimulation()
    .force(
      "link",
      d3.forceLink().id((d) => d.id)
    )
    .force("charge", d3.forceManyBody())
    .force("center", d3.forceCenter(center_x, center_y));

  const validDataList = [];
  worksList
    .filter((w) => w.selected)
    .forEach((w) => {
      w.dataAboutWork.forEach((d) => {
        validDataList.push(d);
      });
    });

  //validDataListに一つしか含まれない声優を弾く処理で、少し複雑です。
  validDataList.sort(sortData);
  while (true) {
    if (validDataList.length == 1) {
      validDataList.splice(0, 1);
      break;
    }
    if (validDataList.length == 0) {
      break;
    }
    if (validDataList[0].name == validDataList[1].name) break;
    validDataList.splice(0, 1);
  }
  for (var i = 2; i < validDataList.length; i++) {
    if (
      validDataList[i - 2].name != validDataList[i - 1].name &&
      validDataList[i - 1].name != validDataList[i].name
    ) {
      validDataList.splice(i - 1, 1);
      i--;
    }
  }
  const tmpListLength = validDataList.length;
  if (tmpListLength > 1) {
    if (
      validDataList[tmpListLength - 2].name !=
      validDataList[tmpListLength - 1].name
    ) {
      validDataList.pop();
    }
  }

  const actorsAndChars = [];

  validDataList.forEach((d) => {
    if (actorsAndChars.filter((a) => a.name == d.name).length == 0) {
      actorsAndChars.push({ name: d.name, type: "actor", id: d.name });
    }
    actorsAndChars.push({
      name: d.character,
      type: "character",
      id: d.name + d.jenre + d.title + d.character,
    });
  });

  const connections = validDataList.map((d) => {
    return {
      source: d.name,
      target: d.name + d.jenre + d.title + d.character,
    };
  });

  svg.selectAll("line").remove();
  svg.selectAll("g").remove();

  const links = svg
    .selectAll("line")
    .data(connections)
    .enter()
    .append("line")
    .attr("stroke", "lightgrey")
    .attr("stroke-width", 1);

  const nodes = svg
    .selectAll("circle")
    .data(actorsAndChars)
    .enter()
    .append("g")
    .attr("class", "node_group")
    .call(
      d3
        .drag()
        .on("start", dragstarted_node)
        .on("drag", dragged_node)
        .on("end", dragended_node)
    );

  nodes
    .append("circle")
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("r", 15);

  nodes
    .append("text")
    .attr("font-size", 12)
    .attr("stroke", "black")
    .text((d) => d.name);

  simulation.nodes(actorsAndChars).on("tick", ticked);

  simulation.force("link").links(connections).distance(50);

  function ticked() {
    links
      .attr("x1", (d) => d.source.x)
      .attr("y1", (d) => d.source.y)
      .attr("x2", (d) => d.target.x)
      .attr("y2", (d) => d.target.y);

    nodes
      .selectAll("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    nodes
      .selectAll("text")
      .attr("x", (d) => d.x + 10)
      .attr("y", (d) => d.y + 10);
  }

  function dragstarted_node(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged_node(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended_node(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }
}

//     svg.call(
//         d3.drag()
//             .on("start", dragstarted_all)
//             .on("drag", dragged_all)
//             .on("end", dragended_all)
//     );

//     function dragstarted_all(d) {

//     }

//     function dragged_all(event, d) {
//         center_x += event.dx;
//         center_y += event.dy;
//         simulation
//             .force("center", d3.forceCenter(center_x, center_y));
//     }

//     function dragended_all(d) {

//     }
// }

function sortData(a, b) {
  return b.name > a.name;
}
