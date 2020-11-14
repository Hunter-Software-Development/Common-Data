const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const fetch = require("node-fetch");
const axios = require("axios");
const cheerio = require("cheerio");

// Create a new Express app
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// http://techslides.com/convert-csv-to-json-in-javascript
//var csv is the CSV file with headers
function csvJSON(csv) {
    var lines = csv.split("\r\n");

    var result = [];

    var headers = lines[0].split(",");

    for (var i = 1; i < lines.length; i++) {
        var obj = {};
        var currentline = lines[i].split(",");

        if (currentline[0]) {
            for (var j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentline[j];
            }
            result.push(obj);
        }
    }

    //return result; //JavaScript object
    return JSON.stringify(result);
    // .replace(/(?:\\[rn])+/g, "");
}

app.get("/states/", async function (req, res, next) {
    try {
        // const { data } = await axios.get("https://en.wikipedia.org/wiki/List_of_states_and_territories_of_the_United_States");

        const url =
            "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: "List of states and territories of the United States",
                format: "json",
            });

        const req = await fetch(url);
        const json = await req.json();
        const data = json.parse.text["*"];

        const $ = cheerio.load(data);
        const table = $('caption:contains("States of the United States of America")').parent();
        const states = [];
        table
            .find("tbody tr")
            .slice(2)
            .each((i, element) => {
                const $row = $(element);
                const state = {};

                if ((name = $row.find("th>a").text().trim())) {
                    state.name = name;
                } else {
                    state.name = $row.find("th>span>a").text().trim();
                }

                const labels = ["code", "capital", "largest", "ratification", "population", "area_mi", "area_km", "land_mi", "land_km", "water_mi", "water_km", "representatives"];

                $row.find("td").each((i, element) => {
                    const $col = $(element);
                    const text = $col.text().trim();
                    let label = labels[i];
                    if (state[label]) {
                        return true;
                    }
                    state[label] = text;
                    if ($col.attr("colspan") == 2) {
                        i += 1;
                        label = labels[i];
                        state[label] = text;
                    }
                });

                states.push(state);
            });

        res.json(states);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/countries/", async function (req, res, next) {
    try {
        const url =
            "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: "ISO 3166-1",
                format: "json",
            });

        const req = await fetch(url);
        const json = await req.json();
        const data = json.parse.text["*"];

        const $ = cheerio.load(data);
        const table = $('table:contains("English short name")');

        const countries = [];
        table
            .find("tbody tr")
            .slice(1)
            .each((i, element) => {
                const $row = $(element);
                const country = {};

                const labels = ["name", "alpha_2_code", "alpha_3_code", "numeric_code", "subdivision_code", "independent"];

                $row.find("td").each((i, element) => {
                    const $col = $(element);
                    const text = $col.text().trim();
                    let label = labels[i];
                    country[label] = text;
                });

                countries.push(country);
            });

        res.json(countries);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/countries_geojson/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://datahub.io/core/geo-countries/r/0.geojson");

        res.json(data);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/counties/", async function (req, res, next) {
    try {
        const url =
            "https://en.wikipedia.org/w/api.php?" +
            new URLSearchParams({
                origin: "*",
                action: "parse",
                page: "List of United States counties and county equivalents",
                format: "json",
            });

        const req = await fetch(url);
        const json = await req.json();
        const data = json.parse.text["*"];

        const $ = cheerio.load(data);
        const table = $('table:contains("County or equivalent")');

        const counties = [];
        let state = "";
        table
            .find("tbody tr")
            .slice(1)
            .each((i, element) => {
                const $row = $(element);
                const county = {};

                const labels = ["name", "state", "population"];
                $row.find("td").each((i, element) => {
                    const $col = $(element);
                    let text = $col.text().trim();
                    let label = labels[i];

                    if (label === "state") {
                        if (isNaN(parseInt(text))) {
                            state = text;
                        } else {
                            county.state = state;
                            label = labels[i + 1];
                        }
                    }
                    county[label] = text;
                });
                counties.push(county);
            });

        res.json(counties);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/presidents/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://www.loc.gov/rr/print/list/057_chron.html");

        const $ = cheerio.load(data);
        const table = $('th:contains("FIRST LADY")').parent().parent();

        const presidents = [];
        table
            .find("tbody tr")
            .slice(1)
            .each((i, element) => {
                const $row = $(element);
                const president = {};

                const labels = ["year", "president", "first_lady", "vice_president"];

                $row.find("td").each((i, element) => {
                    const $col = $(element);
                    const text = $col.text().trim();
                    let label = labels[i];
                    president[label] = text;
                });

                presidents.push(president);
            });

        res.json(presidents);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/continents/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://datahub.io/core/continent-codes/r/continent-codes.json");

        res.json(data);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/cities/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://datahub.io/core/world-cities/r/world-cities.json");

        res.json(data);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/airports/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://datahub.io/core/airport-codes/r/airport-codes.json");

        res.json(data);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

app.get("/waffle_house_locations/", async function (req, res, next) {
    try {
        const { data } = await axios.get("https://locations.wafflehouse.com/");

        const $ = cheerio.load(data);

        // TODO: Shouldn't have to do children[0] here, but innerHTML/innerText doesn't seem to work here even though it works in the browser
        const raw_data = $('script[type="application/ld+json"]')[0]
            .children[0].data.replace(/[\t\n]+/g, " ")
            .trim();
        const encoded_data = JSON.parse(raw_data);

        res.json(encoded_data);
    } catch (e) {
        console.error(e);
        res.json(e);
    }
});

const port = process.env.SERVER_PORT || 8080;
app.listen(port, () => console.info(`Server listening on port ${port}`));

module.exports = app;
