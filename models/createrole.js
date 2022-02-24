const mongoose = require("mongoose");
const createroleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    createroleID: String,
    time: Number
});
module.exports = mongoose.model("createrole", createroleSchema);