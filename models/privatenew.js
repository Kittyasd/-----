const mongoose = require("mongoose");
const privatenewSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    RoomID: String,
    RoleID: String,
    Exp: Number
});
module.exports = mongoose.model("privatenew", privatenewSchema);