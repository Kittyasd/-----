const mongoose = require("mongoose");
const mmrSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    mmr: Number,
    calibration: Number,
    dota: Number
});
module.exports = mongoose.model("mmr", mmrSchema);