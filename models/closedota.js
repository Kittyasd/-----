const mongoose = require("mongoose");
const closedotaSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    serverID: String,
    HostID: String,
    GameID: String,
    Lobby: String,
    Pass: String,
    Win: String,
    radiant1: String,
    radiant2: String,
    radiant3: String,
    radiant4: String,
    radiant5: String,
    dire1: String,
    dire2: String,
    dire3: String,
    dire4: String,
    dire5: String,
    radiantroom: String,
    direroom: String
});
module.exports = mongoose.model("closedota", closedotaSchema);