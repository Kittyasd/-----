const mongoose = require("mongoose");
const progressSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    Message: Number,
    Exp: Number,
    ExpLove: Number,
    Exp12: Number,
    ExpWeek: Number,
    New: Number
});
module.exports = mongoose.model("progress", progressSchema);