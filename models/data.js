const mongoose = require("mongoose");
const { Schema } = mongoose;

var DataSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true,
        required: true,
    },
    data: {
        type: Schema.Types.Mixed,
        index: true,
        required: true,
    },
});

module.exports = mongoose.model("Data", DataSchema);
