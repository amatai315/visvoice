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

d3.csv("data/voice_actors_greater_than_100characters.csv").then(data => {
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
      actorsDict[d.name] = [{ jenre: d.jenre, title: d.title, character: d.character, year: d.year, hitNum: d.hit_num, imageLink: d.image_link }]
    } else
      actorsDict[d.name].push({ jenre: d.jenre, title: d.title, character: d.character, year: d.year, hitNum: d.hit_num, imageLink: d.image_link })
  });

  dataProcessingText.remove();
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
const searchResultListElement = menu.append("div").attr("id", "search-result-list");
const jenreList = ["アニメ", "ゲーム", "ドラマ", "日本映画", "海外映画", "漫画", "特撮/人形劇", "その他"];

function searchWorks() {
  const searchText = d3.select("#search-text").node().value;

  d3.selectAll("#search-result-hit-num").text("");
  d3.selectAll("#search-result-list div").remove();

  if (searchText != "") {
    jenreList.forEach(jenre => {
      searchResultListElement
        .append("div")
        .attr("class", "jenre")
        .attr("id", `jenre-${jenreToAlphabet(jenre)}`)
        .text(`${jenre}`)
        .style("font-weight", "bold");
    });

    worksList
      .filter(d => d.title.indexOf(searchText) != -1)
      .forEach(d => {
        const checkboxWrapper = d3
          .select(`#jenre-${jenreToAlphabet(d.jenre)}`)
          .append("div")
          .attr("class", "work")
          .style("font-weight", "normal")

        checkboxWrapper.append("div").text(`${d.title}`);
        checkboxWrapper
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

    jenreList.forEach(jenre => {
      const jenreElement = d3.select(`#jenre-${jenreToAlphabet(jenre)}`)
      if (jenreElement.selectChildren(".work").size() == 0)
        jenreElement.remove();
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
      return "others"
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
  
  console.log(validDataList);

  const actorsAndChars = [];

  validDataList.forEach(d => {
    actorsAndChars.push({ name: d.name, type: "actor", char: d.character, image_link: d.image_link, radius: nodeRadius() });
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

  const imageWidth = 60;
  const imageHeight = 60;
  
  nodes
    .append("image")
    .attr("width", imageWidth)
    .attr("height", imageHeight)
    .attr("text-anchor", "middle")
    .attr("xlink:href", d => d.image_link)

  simulation.nodes(actorsAndChars).on("tick", ticked);

  function ticked() {
    nodes
      .selectAll("circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    nodes
      .selectAll(".char-name")
      .attr("x", d => d.x)
      .attr("y", d => d.y - 40);

    nodes
      .selectAll(".actor-name")
      .attr("x", d => d.x)
      .attr("y", d => d.y + 40);

    nodes
      .selectAll("image")
      .attr("x", d => d.x - imageWidth / 2)
      .attr("y", d => d.y - imageHeight / 2);
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
    selectedActorNode
      .selectAll("image")
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
  svg
    .selectAll("image")
    .attr("opacity", 1);
  actorDataSVG.remove();
  actorSelected = !actorSelected;
}


