const fetch = require("node-fetch");
const axios = require("axios");
const cheerio = require("cheerio");

const Data = require("../models/data");


/**
 * Data scraping functions.
 * @todo Stop using both axios and fetch.
 * @todo Standardize the data outputs of these functions.  Perhaps we need some method of translating to our desired format automagically.
 * @todo Look into and attribute licenses appropriately !important
 */
let data = {};

data.continents = async () => {
    const { data } = await axios.get("https://datahub.io/core/continent-codes/r/continent-codes.json");
    return data;
};

data.countries = async () => {
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

    return countries;
};

/**
 * @todo Lookinto other options for storage.  Too big for Mongodb.  How should we/should we handle larger datasets? 
 */
// data.countries_geojson = async () => {
//     const { data } = await axios.get("https://datahub.io/core/geo-countries/r/0.geojson");
//     return data;
// };

data.states = async () => {
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
            let name;
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

    return states;
};

data.counties = async () => {
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

    return counties;
};

data.cities = async () => {
    const { data } = await axios.get("https://datahub.io/core/world-cities/r/world-cities.json");
    return data;
};

data.airports = async () => {
    const { data } = await axios.get("https://datahub.io/core/airport-codes/r/airport-codes.json");
    return data;
};

data.presidents = async () => {
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

    return presidents;
};

data.waffle_houses = async () => {
    const { data } = await axios.get("https://locations.wafflehouse.com/");

    const $ = cheerio.load(data);

    // TODO: Shouldn't have to do children[0] here, but innerHTML/innerText doesn't seem to work here even though it works in the browser
    const raw_data = $('script[type="application/ld+json"]')[0]
        .children[0].data.replace(/[\t\n]+/g, "")
        .trim();
    const encoded_data = JSON.parse(raw_data);

    return encoded_data;
};

module.exports = data;
