const mongoose = require("mongoose");
const statusSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    status: String
});
module.exports = mongoose.model("status", statusSchema);