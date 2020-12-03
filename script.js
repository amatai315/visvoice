const height = 1000;
const width = 2000;
const width_menu = 500;
var currentTransform = { k: 1, x: 0, y: 0 };
var actor_selected = false;
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
  currentTransform = event.transform;
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

menu.append("div")
  .text("作品名で検索");

menu
  .append("input")
  .attr("id", "search-text")
  .attr("type", "text")
  .attr("placeholder", "作品名で検索")
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
            updateBubble();
          });
        if (d.selected) checkbox.attr("checked", "checked");
        checkboxWrapper.append("div").text(`${d.title}`);
      });
    const hitNum = d3.selectAll("#search-result-list .work").size();
    d3.selectAll("#search-result-hit-num").text(`${hitNum}件ヒットしました`);
  }
}

function updateBubble() {
  var simulation = d3.forceSimulation()
    .force("x", d3.forceX(width / 2).strength(0.2))
    .force("y", d3.forceY(height / 2).strength(0.2))
    .force("collision", d3.forceCollide().radius(d => d.radius + 2))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const validDataList = [];
  worksList
    .filter((w) => w.selected)
    .forEach((w) => {
      w.dataAboutWork.forEach((d) => {
        validDataList.push(d);
      });
    });

  const actorsAndChars = [];

  validDataList.forEach((d) => {
    actorsAndChars.push({ name: d.name, type: "actor", char: d.character, radius: node_radius() });
  });

  svg.selectAll("line").remove();
  svg.selectAll("g").remove();

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
    )
    .on("click", clicked_actor_node);

  nodes
    .append("circle")
    .attr("stroke", "black")
    .attr("fill", "white")
    .attr("r", d => d.radius);

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

  simulation.nodes(actorsAndChars).on("tick", ticked);

  function ticked() {
    nodes
      .selectAll("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y);

    nodes
      .selectAll(".char-name")
      .attr("x", (d) => d.x)
      .attr("y", (d) => d.y - 10);

    nodes
      .selectAll(".actor-name")
      .attr("x", (d) => d.x)
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

  function node_radius() {
    return 60;
  }
}

function clicked_actor_node(event, d) {
  //ここに、声優のノードがノードがクリックされたときの挙動を書く感じです。
  const selectedActorNode = d3.select(event.currentTarget);

  if (!actor_selected) {
    const node = selectedActorNode.select("circle");
    const k = 30;
    svg.transition()
      .duration(750)
      .attr("transform", `translate(${width / 2},${height / 2})scale(${k})
    translate(${-node.attr("cx")},${-node.attr("cy")})
    translate(${currentTransform.x},${currentTransform.y})`);
  } else {
    svg.transition()
      .duration(750)
      .attr("transform", `translate(0,0)scale(1)`);
  }
  actor_selected = !actor_selected;
}


