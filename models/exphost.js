const mongoose = require("mongoose");
const exphostSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    exphostID: String,
    time: Number
});
module.exports = mongoose.model("exphost", exphostSchema);