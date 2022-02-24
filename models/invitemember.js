const mongoose = require("mongoose");
const invitememberSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    invitecode: String,
    inviteuses: Number,

});
module.exports = mongoose.model("invitemember", invitememberSchema);