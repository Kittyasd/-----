const mongoose = require("mongoose");
const currencySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    bounty: Number,
    bag: Number,
    rune1: Number,
    rune2: Number,
    rune3: Number,
    new: Number
});
module.exports = mongoose.model("currency", currencySchema);