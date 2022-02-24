const mongoose = require("mongoose");
const movemuteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    movemuteID: String,
    time: Number
});
module.exports = mongoose.model("movemute", movemuteSchema);