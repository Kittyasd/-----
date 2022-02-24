const mongoose = require("mongoose");
const banSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    time: Number
});
module.exports = mongoose.model("ban", banSchema);