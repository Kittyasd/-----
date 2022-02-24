const mongoose = require("mongoose");
const timelySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    timely: Number,   
});
module.exports = mongoose.model("timely", timelySchema);