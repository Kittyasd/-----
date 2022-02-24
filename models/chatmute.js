const mongoose = require("mongoose");
const chatmuteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    chatmuteID: String,
    time: Number
});
module.exports = mongoose.model("chatmute", chatmuteSchema);