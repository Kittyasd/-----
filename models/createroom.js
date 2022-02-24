const mongoose = require("mongoose");
const createroomSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    RoomID: String
});
module.exports = mongoose.model("createroom", createroomSchema);