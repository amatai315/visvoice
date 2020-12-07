const height = 1000;
const width = 2000;
const width_menu = 500;
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
var svg = canvas.append("g");
function zoom(event) {
  if (!actorSelected) {
    svg.attr("transform", event.transform);
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

const dataProcessingText = canvas
  .append("text")
  .attr("x", width / 2)
  .attr("y", height / 2)
  .attr("font-size", 60)
  .attr("text-anchor", "middle")
  .text("データ処理中です");

d3.csv("./data/voice_actors.csv").then(data => {
  data.forEach(d => {
    const work = worksList.find(
      w => w.title == d.title && w.jenre == d.jenre
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
      actorsDict[d.name] = [{ jenre: d.jenre, title: d.title, character: d.character, year: d.year }]
    } else
      actorsDict[d.name].push({ jenre: d.jenre, title: d.title, character: d.character, year: d.year })
  });

  dataProcessingText.remove();
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

        checkboxWrapper.append("div").text(`${d.title}`);
        checkboxWrapper
          .append("button")
          .attr("value", d.title)
          .text("Apply")
          .on("click", () => {
            selectedWorkTextElement.text(d.title);
            updateActorsBubble(d.title);
          });
      });
    const hitNum = d3.selectAll("#search-result-list .work").size();
    d3.selectAll("#search-result-hit-num").text(`${hitNum}件ヒットしました`);
  }
}

function updateActorsBubble(titleSelected) {
  var simulation = d3.forceSimulation()
    .force("collision", d3.forceCollide().radius(d => d.radius + 2))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const validDataList = [];
  worksList
    .find(w => w.title == titleSelected)
    .dataAboutWork.forEach(d => {
      validDataList.push(d);
    });

  const actorsAndChars = [];

  validDataList.forEach(d => {
    actorsAndChars.push({ name: d.name, type: "actor", char: d.character, radius: nodeRadius() });
  });

  svg.selectAll("line").remove();
  svg.selectAll("g").remove();

  const nodes = svg
    .selectAll("circle")
    .data(actorsAndChars)
    .enter()
    .append("g")
    .attr("class", "node_group")
    .on("click", clickedActorNode);

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
    .text(d => d.char);

  nodes
    .append("text")
    .attr("class", "actor-name")
    .attr("font-size", 12)
    .attr("text-anchor", "middle")
    .attr("stroke", "black")
    .text(d => d.name);

  simulation.nodes(actorsAndChars).on("tick", ticked);

  function ticked() {
    nodes
      .selectAll("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    nodes
      .selectAll(".char-name")
      .attr("x", d => d.x)
      .attr("y", d => d.y - 10);

    nodes
      .selectAll(".actor-name")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 10);
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
    svg.transition()
      .duration(durationTime)
      .attr("transform", `translate(${width / 2},${height / 2})scale(${k})
             translate(${-node.attr("cx")},${-node.attr("cy")})`);
    selectedActorNode
      .selectAll("text")
      .transition()
      .duration(durationTime)
      .attr("opacity", 0)
    actorDataSVG = d3.select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height)
      .style("position", "absolute");
    actorDataSVG.append("rect")
      .attr("x", 100)
      .attr("y", 100)
      .attr("height", 100)
      .attr("width", 100)
      .attr("fill", "red")
      .on("click", clickedReturnToWorkButton);
    actorSelected = !actorSelected;
  }

}

function clickedReturnToWorkButton() {
  const durationTime = 750;
  selectedWorkTextElement
    .transition()
    .duration(durationTime)
    .attr("opacity", 1);
  svg.transition()
    .duration(durationTime)
    .attr("transform", `translate(${currentTransform.x},${currentTransform.y})scale(${currentTransform.k})`);
  svg
    .selectAll("text")
    .transition()
    .duration(durationTime)
    .attr("opacity", 1)
  actorDataSVG.remove();
  actorSelected = !actorSelected;
}


