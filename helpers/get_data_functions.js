const Diff = require("diff");
require("colors");

/**
 * Functions to handle scraped data + stored data.
 * @todo Flesh out more.  Ensure our admin tools are robust.
 */
getDataFunctions = {};
getDataFunctions.upsertAllData = async (data, Data) => {
    try {
        for (let key in data) {
            const dataValue = await data[key]();
            const storedData = await Data.findOneAndUpdate({ name: key }, { data: dataValue }, { upsert: true, new: true });
            console.log(storedData);
        }
    } catch (e) {
        console.error(e);
    }
};

getDataFunctions.diffAllData = async (data, Data) => {
    try {
        let diffObject = {};
        for (let key in data) {
            diffObject[key] = { good: 0, bad: 0 };

            const dataValue = await data[key]();
            const storedData = await Data.findOne({ name: key });

            const diff = Diff.diffJson(dataValue, storedData.data);

            diff.forEach((part) => {
                // green for additions, red for deletions
                // grey for common parts
                const color = part.added ? "green" : part.removed ? "red" : "grey";
                if (part.added || part.removed) {
                    console.log(part.value[color]);
                    diffObject[key].bad += JSON.stringify(part).length;
                } else {
                    diffObject[key].good += JSON.stringify(part).length;
                }
            });
        }
        console.log(diffObject);
    } catch (e) {
        console.error(e);
    }
};

module.exports = getDataFunctions;
