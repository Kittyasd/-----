const mongoose = require("mongoose");
const expmessageSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    time: Number
});
module.exports = mongoose.model("expmessage", expmessageSchema);