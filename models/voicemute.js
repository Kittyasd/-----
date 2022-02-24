const mongoose = require("mongoose");
const voicemuteSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    userID: String,
    moderatorID: String,
    reason: String,
    valid: Number,
    mutevalid: Number,  
    time: Number,
    timemute: Number,
    muteID: Number
});
module.exports = mongoose.model("voicemute", voicemuteSchema);