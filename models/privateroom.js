const mongoose = require("mongoose");
const privateroomSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    RoomID: String,
    time: Number
});
module.exports = mongoose.model("private", privateroomSchema);