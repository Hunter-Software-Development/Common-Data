const compression = require("compression");
const helmet = require("helmet");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const bodyParser = require("body-parser");

// Local Imports
const Data = require("./models/data");
const getData = require("./get_data");

// Create a new Express app
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

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


getData.test();


const port = process.env.SERVER_PORT || 8080;
app.listen(port, () => console.info(`Server listening on port ${port}`));

module.exports = app;
