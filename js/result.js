require("babel-polyfill");
let axios = require("axios");
let g_translate = require("google-translate-api-browser");
g_translate.setCORS("http://cors-anywhere.herokuapp.com/");


async function translate(from) {
    let en_string = await g_translate.translate(from, {from:"zh", to:"en"});
    return en_string.text;
}

async function query_records(string) {
    // https://clinicaltrials.gov/ct2/results/download_fields?cond=cancer&down_count=10&down_fmt=plain&down_chunk=2 
    let query = new URL("https://clinicaltrials.gov/ct2/results/download_fields");
    query.searchParams.append("cond", string);
    query.searchParams.append("down_count", 10);
    query.searchParams.append("down_fmt", "plain");
    query.searchParams.append("down_chunk", 1);
    let res = await axios("http://cors-anywhere.herokuapp.com/" + query.href);
    res = res.data;
    return res;
}

function parse_res(res) {
    let parsed = [];
    let lines = res.split("\r\n");
    let state = {};
    for (line of lines) {
        if (line.match(/^Study \d+/))
            state = {};
        if (line.match(/  Title:/))
            state.Title = line.replace(/  Title: +/, "");
        if (line.match(/  Status:/))
            state.Status = line.replace(/  Status: +/, "");
        if (line.match(/  Conditions:/))
            state.Conditions = line.replace(/  Conditions: +/, "");
        if (line.match(/  Interventions:/))
            state.Interventions = line.replace(/  Interventions: +/, "");
        if (line.match(/  Locations:/))
            state.Locations = line.replace(/  Locations: +/, "");
        if (line.match(/  URL:/)) {
            state.URL = line.replace(/  URL: +/, "");
            if (state.Status === "Recruiting")
                if (state.Locations.match(/United States/))
                    parsed.push(state);
        }
    }
    window.parsed = parsed;
    return parsed;
}

function write_dom(res) {
    let target = document.getElementById("main-results");
    let parsed_li = parse_res(res);
    console.log(parsed_li);
    target.innerHTML = "";
    for (let parsed of parsed_li) {
        let each_dom = document.createElement("ul");
        each_dom.innerHTML = `
            <li>试验名称：${parsed.Title}</li>
            <li>状况：${parsed.Status}</li>
            <li>疗法：${parsed.Interventions}</li>
            <li>地点：${parsed.Locations}</li>
            <li>链接：<a href="${parsed.URL}">${parsed.URL}</a></li>
        `;
        target.appendChild(each_dom);
        target.appendChild(document.createElement("hr"));
    }
}

async function main() {
    let zh_string = (new URL(window.location)).searchParams.get("keyWords");
    let string = await translate(zh_string);
    // res is the raw text
    let res = await query_records(string);
    window.res = res;
    write_dom(res);
}

main();
