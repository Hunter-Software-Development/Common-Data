const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Local Imports
const Data = require("./models/data");
const getData = require("./scraping/get_data");
const getDataFunctions = require("./helpers/get_data_functions");

// Create a new Express app
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());


/**
 * Database connection.
 * @todo Move to separate file.
 * @todo Use env for connection strings
 */ 
mongoose.Promise = global.Promise;
let dburi = "mongodb://localhost/commondata";
if (process.env.NODE_ENV === "test") {
    dburi = dburi + "TEST";
}
const connectDB = async () => {
    try {
        const connection = await mongoose.connect(dburi, {
            useNewUrlParser: true,
            useFindAndModify: false,
            useCreateIndex: true,
            useUnifiedTopology: true,
        });
        console.info(`MongoDB connected: ${connection.connection.name}`);
    } catch (error) {
        console.error(`MongoDB error when connecting: ${error}`);
    }
};
connectDB();



/**
 * Admin actions
 * @todo Flesh these out a bit more.  What does the UX look like for an admin user?  Probably should be manual triggers for a while, but what does that look like??
 * @todo Move these to a more appropriate file with more appropriate trigger.
 */
// getDataFunctions.upsertAllData(getData, Data);
// getDataFunctions.diffAllData(getData, Data);

/**
 * Create all routes
 * @todo Move to a more appropriate file
 */
for (let key in getData) {
    app.get(`/${key}`, async (req, res) => {
        const storedData = await Data.findOne({ name: key });
        res.status(200).json(storedData);
    });
}

const port = process.env.SERVER_PORT || 8080;
app.listen(port, () => console.info(`Server listening on port ${port}`));

module.exports = app;
