const height = 1000;
const width = 2000;
const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const menu = d3.select("body").append("div")
    .attr("class", "menu")
    .style("height", height)
    .style("width", 500);

const worksList = [];

d3.csv("./data/voice_actors.csv").then((data) => {

    data.forEach((d) => {
        const work = worksList.find((w) => w.title == d.title && w.jenre == d.jenre);
        if (work === undefined) {
            worksList.push({ jenre: d.jenre, title: d.title, selected: false, dataAboutWork: [d] });
        } else {
            work.dataAboutWork.push(d);
        }
    });

    console.log(worksList);


});

menu.append("input")
    .attr("id", "search-text")
    .attr("type", "text")
    .attr("placeholder", "検索ワードを入力")
    .on("input", searchWord);

menu.append("div")
    .attr("id", "search-result-hit-num");

menu.append("div")
    .attr("id", "search-result-list");

function searchWord() {
    const searchText = d3.select("#search-text").node().value;

    d3.selectAll("#search-result-list > div").remove();
    d3.selectAll("#search-result-hit-num").text("");

    if (searchText != '') {
        worksList.filter((d) => d.title.indexOf(searchText) != -1)
            .forEach((d) => {
                const checkboxWrapper = d3.select("#search-result-list")
                    .append("div")
                    .attr("class", "work");
                const checkbox = checkboxWrapper.append("input")
                    .attr("type", "checkbox")
                    .attr("value", d.title)
                    .on("change", () => {
                        d.selected = !d.selected;
                        updateGraph()
                    });
                if (d.selected) checkbox.attr("checked", "checked");
                checkboxWrapper.append("div")
                    .text(`${d.title}`);
            });
        const hitNum = d3.selectAll("#search-result-list .work").size();
        d3.selectAll("#search-result-hit-num").text(`${hitNum}件ヒットしました`);
    }
}

function updateGraph() {
    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id((d) => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    const validDataList = [];
    worksList.filter((w) => w.selected)
        .forEach((w) => {
            w.dataAboutWork.forEach((d) => {
                validDataList.push(d);
            })
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
        if (validDataList[i - 2].name != validDataList[i - 1].name &&
            validDataList[i - 1].name != validDataList[i].name) {
            validDataList.splice(i - 1, 1);
            i--;
        }
    }
    const tmpListLength = validDataList.length;
    if (tmpListLength > 1) {
        if (validDataList[tmpListLength - 2].name !=
            validDataList[tmpListLength - 1].name) {
            validDataList.pop();
        }
    }

    const actorsAndChars = [];

    validDataList.forEach((d) => {
        if (actorsAndChars.filter((a) => a.name == d.name).length == 0) {
            actorsAndChars.push({ name: d.name, type: "actor", id: d.name });
        }
        actorsAndChars.push({ name: d.character, type: "character", id: d.jenre + d.title + d.character });
    });

    const connections = validDataList.map((d) => {
        return {
            source: d.name,
            target: d.jenre + d.title + d.character
        };
    });

    svg.selectAll("line").remove();
    svg.selectAll("g").remove();

    const links = svg.selectAll("line")
        .data(connections).enter()
        .append("line")
        .attr("stroke", "lightgrey")
        .attr("stroke-width", 1);

    const nodes = svg.selectAll("circle")
        .data(actorsAndChars).enter()
        .append("g")
        .attr("class", "node_group");

    svg.selectAll(".node_group")
        .append("circle")
        .attr("stroke", "black")
        .attr("fill", "white")
        .attr("r", 15);

    svg.selectAll(".node_group")
        .append("text")
        .attr("font-size", 12)
        .attr("stroke", "black")
        .text((d) => d.name);

    simulation.nodes(actorsAndChars)
        .on("tick", ticked);

    simulation.force("link")
        .links(connections)
        .distance(50);

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
}

function sortData(a, b) {
    return b.name > a.name;
}