const mongoose = require("mongoose");
const viproleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    RoleID: String,
    time: Number,
});
module.exports = mongoose.model("viprole", viproleSchema);