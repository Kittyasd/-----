const botconfig = require("./botconfig.json");
const { Client, Intents } = require('discord.js');
const bot = new Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION", "USER", "GUILD_MEMBER"],
    intents: [
        Intents.FLAGS.DIRECT_MESSAGES,
        Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
        Intents.FLAGS.DIRECT_MESSAGE_TYPING,
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_BANS,
        Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Intents.FLAGS.GUILD_INTEGRATIONS,
        Intents.FLAGS.GUILD_INVITES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_MESSAGE_TYPING,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_WEBHOOKS,
    ]
});
const { MessageEmbed } = require('discord.js');
const dota = require("./dota.json");
const timely = require(__dirname + "/models/timely.js");
const status = require(__dirname + "/models/status.js");
const currency = require(__dirname + "/models/currency.js");
const createrole = require(__dirname + "/models/createrole.js");
const createroom = require(__dirname + "/models/createroom.js");
const viprole = require(__dirname + "/models/viprole.js");
const closedota = require(__dirname + "/models/closedota.js");
const privateroom = require(__dirname + "/models/privateroom.js");
const privatenew = require(__dirname + "/models/privatenew.js");
const mongoose = require("mongoose");
let gamestart = 0;
let pos1 = 0;
let pos2 = 0;
let pos3 = 0;
let pos4 = 0;
let pos5 = 0;
const fs = require("fs");
let pick = 0;
let pickmessage = 0;

mongoose.connect('mongodb://localhost/mute', { useNewUrlParser: true })

bot.on("ready", () => {
    //remove role
    setInterval(async () => {
        try {
            const server = bot.guilds.cache.get("720143930628505661");
            const data = await createrole.find();
            for (const user of data) {
                if (user.time < Number(Date.now())) {
                    let removerole = server.roles.cache.get(user.createroleID);
                    if (removerole) await removerole.delete()
                    user.delete().catch(err => console.log(err));
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, 5813);
    //removevip
    setInterval(async () => {
        try {
            const server = bot.guilds.cache.get("720143930628505661");
            const data = await viprole.find();
            for (const user of data) {
                let vipmember = server.members.get(user.userID)
                if (vipmember) {
                    if (user.time < Number(Date.now())) {
                        if (vipmember.roles.has(`${user.RoleID}`)) {
                            vipmember.removeRole(`${user.RoleID}`)
                            let embed2 = new MessageEmbed()
                                .setAuthor("dark reef")
                                .setColor(`${botconfig.colorYes}`)
                                .setDescription(`Сожалею, но статус **${server.roles.cache.get(user.RoleID).name}** подошлел к концу`)
                            vipmember.send({ embeds: [embed2]})
                        }
                    }
                }
            }
        } catch (e) {
            console.log(e);
        }
    }, 6000000);
})

bot.on("messageCreate", async message => {
    if (typeof String(message) !== 'string') return;
    if (message.author.bot) return;
    let prefix = botconfig.prefix;
    let messageArray = message.content.split(" ");
    let cmd = messageArray[0];
    let args = messageArray.slice(1);

    //del
    if (message.channel.id == `792418636873728080`) {
        if (cmd !== "!newgame" && cmd !== "!deletegame" && cmd !== "!start1pos" && cmd !== "!start2pos" && cmd !== "!start3pos" && cmd !== "!start4pos" && cmd !== "!start5pos" &&
            cmd !== "!stopgame" && cmd !== "!startgame" && cmd !== "!direwin" && cmd !== "!radiantwin" && cmd !== "!cancelgame") {
            if (message.author.id !== `792329428884783128`) message.delete();
        };
    }
    if (message.channel.id == `792418636873728080`) {
        if (cmd !== "!newgame" && cmd !== "!deletegame" && cmd !== "!start1pos" && cmd !== "!start2pos" && cmd !== "!start3pos" && cmd !== "!start4pos" && cmd !== "!start5pos" &&
            cmd !== "!stopgame" && cmd !== "!startgame" && cmd !== "!direwin" && cmd !== "!radiantwin" && cmd !== "!cancelgame") return;
    }
    //plant
    if (message.channel.id == `720143930628505664`) {
        if (pick == 0) {
            let pick1 = Math.floor(Math.random() * 30);
            if (pick1 == 1) {
                pick = 1
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`В чатике появились **5** халявных <:tango:792406777844989983> , чтобы собрать их пропишите **!pick**`)
                    .setImage('https://cdn.discordapp.com/emojis/792406777844989983.png?v=1')
                message.channel.send({ embeds: [embed]}).then(msg => {
                    pickmessage = msg.id
                })
            }
        }
    }
    //pick
    if (cmd === `${prefix}pick`) {
        message.delete({ timeout: 5000 });
        if (pick == 0) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, тут нечего собирать`)
            message.channel.send({ embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 5000));
        }
        else {
            pick = 0
            message.channel.messages.fetch(pickmessage).then(msg => {
                msg.delete()
            })
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorYes}`)
                .setDescription(`**${message.author.username}**, вы собрали **5**<:tango:792406777844989983> `)
            message.channel.send({ embeds: [embed]}).then(msg => setTimeout(() => msg.delete(), 5000));
            currency.findOne({ userID: message.author.id },
                (err, bounty) => {
                    if (err) console.log(err);
                    if (!bounty) {
                        const newcurrency = new currency({
                            _id: mongoose.Types.ObjectId(),
                            serverID: "720143930628505661",
                            userID: message.author.id,
                            bounty: 5,
                            bag: 0,
                            rune1: 0,
                            rune2: 0,
                            rune3: 0,
                            new: 0
                        });
                        newcurrency.save().catch(err => console.log(err));
                    } else {
                        bounty.bounty = bounty.bounty + 5;
                        bounty.save().catch(err => console.log(err));
                    }
                })
        }
    }

    if (cmd === `${prefix}embed`) {
        const embed = new MessageEmbed()
            .setColor(0xffffff)
            .setTitle("Чтобы получить игровую/ивент роль - нажми на реакцию под сообщением:")
            .setDescription(`<:Carry:709378333619519559> - Carry \n\n <:Mider:709378279110606918> - Mider \n\n <:Offlainer:709378309875695687> - Offlainer\n\n <:Sup4pos:709378252552011859> - Sup(4pos)\n\n <:Sup5pos:709378201540886589> - Sup(5pos)\n\n <:Y_Kotiknia:599741068451250208> - Events\n\n <:Dota:709545041181540392> - Dota 2\n\n <:Lol:709545065885990932> - LOL`)
        message.channel.send({ embeds: [embed]}).then(async msg => {
            await msg.react('709378333619519559');
            await msg.react('709378279110606918');
            await msg.react('709378309875695687');
            await msg.react('709378252552011859');
            await msg.react('709378201540886589');
            await msg.react('599741068451250208');
            await msg.react('709545041181540392');
            await msg.react('709545065885990932');
        })
    } 

    if (cmd === `${prefix}give`) {
        message.delete({ timeout: 300 })
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        if (message.mentions.users.first() == message.author) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983> `)
                    return message.channel.send({ embeds: [embed]});
                }
                else if (bounty.bounty < check) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983> `)
                    return message.channel.send({ embeds: [embed]})
                }
                else {
                    bounty.bounty = bounty.bounty - check;
                    bounty.save().catch(err => console.log(err));
                }
                currency.findOne({ userID: message.mentions.users.first().id },
                    (err, bounty) => {
                        if (err) console.log(err);
                        if (!bounty) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: message.mentions.users.first().id,
                                bounty: check,
                                bag: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            bounty.bounty = bounty.bounty + check;
                            bounty.save().catch(err => console.log(err));
                        }
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorYes}`)
                            .setDescription(`**${message.author.username}** перевел на счет пользователя **${message.mentions.users.first().username}** ${check} <:tango:792406777844989983> `)
                            .setFooter(`Команда: ${cmd}`)
                        message.channel.send({ embeds: [embed]});
                    })
            })
    }
    //givebag
    if (cmd === `${prefix}givebag`) {
        message.delete({ timeout: 300 })
        check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        if (message.mentions.users.first() == message.author) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно :moneybag: `)
                    return message.channel.send({ embeds: [embed]});
                }
                else if (bounty.bag < check) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно :moneybag:`)
                    return message.channel.send({ embeds: [embed]})
                }
                else {
                    bounty.bag = bounty.bag - check;
                    bounty.save().catch(err => console.log(err));
                }
                currency.findOne({ userID: message.mentions.users.first().id },
                    (err, bounty) => {
                        if (err) console.log(err);
                        if (!bounty) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: message.mentions.users.first().id,
                                bounty: 0,
                                bag: check,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            bounty.bag = bounty.bag + check;
                            bounty.save().catch(err => console.log(err));
                        }
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorYes}`)
                            .setDescription(`**${message.author.username}** перевел на счет пользователя **${message.mentions.users.first().username}** ${check} :moneybag: `)
                            .setFooter(`Команда: ${cmd}`)
                        message.channel.send({ embeds: [embed]});
                    })
            })
    }
    //checkroom
    if (cmd === `${prefix}checkroom`) {
        privateroom.findOne({ userID: message.member.id },
            (err, RoomID) => {
                if (err) console.log(err);
                if (RoomID) {
                    let qwertyroom = Math.floor((RoomID.time - Number(Date.now())));
                    let o = Math.floor(qwertyroom / 86400000);
                    let u = Math.floor((qwertyroom - (o * 86400000)) / 3600000);
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}**, ваша комната просуществует еще **${o}** д. и **${u}** ч.`)
                        .setFooter(`Команда: ${cmd}`)
                    message.channel.send({ embeds: [embed]});
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас нет комнаты`)
                    message.channel.send({ embeds: [embed]});
                }
            })
    }
    //timely
    if (cmd === `${prefix}timely`) {
        message.delete({ timeout: 300 })
        let timelybag = 1;
        if (message.member.roles.cache.has("674958144568426537")) timelybag += 1;
        if (message.member.roles.cache.has("599153685330788353")) timelybag += 1;
        timely.findOne({ userID: message.author.id },
            (err, userID) => {
                if (err) console.log(err);
                if (!userID) {
                    const newtimely = new timely({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.member.id,
                        timely: Number(Date.now()) + 43200000
                    });
                    newtimely.save().catch(err => console.log(err));
                }
                else if (userID.timely < Number(Date.now())) {
                    userID.timely = Number(Date.now()) + 43200000
                    userID.save().catch(err => console.log(err));
                }
                else {
                    let qwerty = Math.floor(userID.timely - Number(Date.now()));
                    let y = Math.floor(qwerty / 3600000);
                    let u = Math.floor((qwerty - (y * 3600000)) / 60000);
                    let i = Math.floor((qwerty - ((u * 60000) + (y * 3600000))) / 1000);
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вы сможете получить ежедневную награду через **${y}ч. ${u}мин. ${i}сек.**`)
                        .setFooter(`Команда: ${cmd}`)
                    return message.channel.send({ embeds: [embed]});
                }
                currency.findOne({ userID: message.member.id },
                    (err, bounty) => {
                        if (err) console.log(err);
                        if (!bounty) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: message.member.id,
                                bounty: 0,
                                bag: timelybag,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        }
                        else {
                            bounty.bag = bounty.bag + timelybag
                            bounty.save().catch(err => console.log(err));
                        }
                    })
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}**, вы получили **${timelybag}** :moneybag: , приходите снова через **12** часов`)
                    .setFooter(`Команда: !timely`)
                return message.channel.send({ embeds: [embed]});
            })
    }
    //$
    if (cmd === `${prefix}$1231234`) {
        message.delete({ timeout: 300 })
        if (!message.mentions.users.first()) { var balance = message.author }
        if (message.mentions.users.first()) { var balance = message.mentions.users.first() }
        currency.findOne({ userID: balance.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`У **${balance.username}** ничего нет`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .addField("", `**${bounty.bounty}** <:tango:792406777844989983>  `)
                        .addField("", `**${bounty.bag}** :moneybag:`)
                        .addField("", `**${bounty.rune1}** <:rune3:675655805147545641>`)
                        .addField("", `**${bounty.rune2}** <:rune2:675656373672869898>`)
                        .addField("", `**${bounty.rune3}** <:rune1:675655806309498880>`)
                    if (bounty.bounty == 0 && bounty.bag == 0 && bounty.rune1 == 0 && bounty.rune2 == 0 && bounty.rune3 == 0) {
                        embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setDescription(`У **${balance.username}** ничего нет`)
                            .setColor(`${botconfig.colorNo}`)
                    }
                    message.channel.send({ embeds: [embed]});
                }
            })
    }
    //createrole 10 d
    if (cmd === `${prefix}crole10`) {
        message.delete({ timeout: 300 })
        if (messageArray[1].substr(0, 1) !== "#" || messageArray[1].length != 7) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole10 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        if (!messageArray[2]) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole10 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **1000** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                } else if (bounty.bounty < 1000) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **${1000 - bounty.bounty}** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    if (messageArray[1] === "#000000") messageArray[1] = "#030303";
                    bounty.bounty = bounty.bounty - 1000
                    bounty.save().catch(err => console.log(err));
                    message.guild.roles.create({
                            name: args.join(" ").slice(7),
                            color: messageArray[1],
                            position: message.guild.roles.size - 11
                    })
                        .then(role => {
                            createrole.findOne({ createroleID: role.id },
                                (err, time) => {
                                    if (err) console.log(err);
                                    const newcreaterole = new createrole({
                                        _id: mongoose.Types.ObjectId(),
                                        serverID: "720143930628505661",
                                        createroleID: role.id,
                                        time: Number(Date.now()) + 864000000
                                    })
                                    newcreaterole.save().catch(err => console.log(err));
                                    message.member.roles.add(`${role.id}`);
                                    let embed = new MessageEmbed()
                                        .setAuthor("dark reef", message.guild.iconURL)
                                        .setColor(`${botconfig.colorYes}`)
                                        .setDescription(`**${message.author.username}**, вы успешно создали личную роль с названием **${args.join(" ").slice(7)}** на 10 дней`)
                                        .setFooter(`Команда: ${cmd}`)
                                    message.channel.send({ embeds: [embed]});
                                })
                        })
                        .catch(console.error)
                }
            })
    }
    // role 7 d
    if (cmd === `${prefix}crole7`) {
        message.delete({ timeout: 300 })
        if (messageArray[1].substr(0, 1) !== "#" || messageArray[1].length != 7) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole7 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        if (!messageArray[2]) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole7 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **700** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                } else if (bounty.bounty < 700) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **${700 - bounty.bounty}** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    if (messageArray[1] === "#000000") messageArray[1] = "#030303";
                    bounty.bounty = bounty.bounty - 700
                    bounty.save().catch(err => console.log(err));
                    message.guild.roles.create({
                            name: args.join(" ").slice(7),
                            color: messageArray[1],
                            position: message.guild.roles.size - 11
                    })
                        .then(role => {
                            createrole.findOne({ createroleID: role.id },
                                (err, time) => {
                                    if (err) console.log(err);
                                    const newcreaterole = new createrole({
                                        _id: mongoose.Types.ObjectId(),
                                        serverID: "720143930628505661",
                                        createroleID: role.id,
                                        time: Number(Date.now()) + 604800000
                                    })
                                    newcreaterole.save().catch(err => console.log(err));
                                    message.member.roles.add(`${role.id}`);
                                    let embed = new MessageEmbed()
                                        .setAuthor("dark reef", message.guild.iconURL)
                                        .setColor(`${botconfig.colorYes}`)
                                        .setDescription(`**${message.author.username}**, вы успешно создали личную роль с названием **${args.join(" ").slice(7)}** на 7 дней`)
                                        .setFooter(`Команда: ${cmd}`)
                                    message.channel.send({ embeds: [embed]});
                                })
                        })
                        .catch(console.error)
                }
            })
    }
    //createrole 3 d
    if (cmd === `${prefix}crole3`) {
        message.delete({ timeout: 300 })
        if (messageArray[1].substr(0, 1) !== "#" || messageArray[1].length != 7) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole3 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        if (!messageArray[2]) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания роли: !crole3 #123456 название роли`)
            return message.channel.send({ embeds: [embed]});
        }
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **300** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                } else if (bounty.bounty < 300) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **${300 - bounty.bounty}** <:tango:792406777844989983> для создания роли`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    if (messageArray[1] === "#000000") messageArray[1] = "#030303";
                    bounty.bounty = bounty.bounty - 300
                    bounty.save().catch(err => console.log(err));
                    message.guild.roles.create({
                            name: args.join(" ").slice(7),
                            color: messageArray[1],
                            position: message.guild.roles.size - 11
                    })
                        .then(role => {
                            createrole.findOne({ createroleID: role.id },
                                (err, time) => {
                                    if (err) console.log(err);
                                    const newcreaterole = new createrole({
                                        _id: mongoose.Types.ObjectId(),
                                        serverID: "720143930628505661",
                                        createroleID: role.id,
                                        time: Number(Date.now()) + 259200000
                                    })
                                    newcreaterole.save().catch(err => console.log(err));
                                    message.member.roles.add(`${role.id}`);
                                    let embed = new MessageEmbed()
                                        .setAuthor("dark reef", message.guild.iconURL)
                                        .setColor(`${botconfig.colorYes}`)
                                        .setDescription(`**${message.author.username}**, вы успешно создали личную роль с названием **${args.join(" ").slice(7)}** на 3 дня`)
                                        .setFooter(`Команда: ${cmd}`)
                                    message.channel.send({ embeds: [embed]});
                                })
                        })
                        .catch(console.error)
                }
            })
    }
    //open
    if (cmd === `${prefix}open`) {
        message.delete({ timeout: 300 })
        if (!messageArray[1]) { messageArray[1] = 1 }
        let check = Math.floor(Math.abs(messageArray[1]));
        if (check !== check) return;
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно :moneybag:`)
                    return message.channel.send({ embeds: [embed]});
                }
                else if (bounty.bag < 1) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно :moneybag:`)
                    return message.channel.send({ embeds: [embed]})
                }
                else {
                    let ivip = 0;
                    let ibounty = 0;
                    let i = 0;
                    while (i < check) {
                        let a = Math.floor(Math.random() * 16) + 5;
                        ibounty = ibounty + a;
                        let b = Math.floor(Math.random() * 10);
                        if (b == 1) { ivip = ivip + 1 }
                        i++;
                    }
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}** открыл ${messageArray[1]} :moneybag: и получил **${ibounty}**<:tango:792406777844989983>`)
                        .setFooter(`Команда: ${cmd}`)
                    message.channel.send({ embeds: [embed]});
                    if (ivip > 0) {
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorYes}`)
                            .setDescription(`**${message.author.username}** неслыханно повезло, и он получает **${ivip}** <:vip:792407099949973534> `)
                        message.channel.send({ embeds: [embed]})
                    }
                    bounty.bag = bounty.bag - check;
                    bounty.new = bounty.new + ivip;
                    bounty.bounty = bounty.bounty + ibounty;
                    bounty.save().catch(err => console.log(err));

                }

            })

    }
    //openvip
    if (cmd === `${prefix}openvip`) {
        message.delete({ timeout: 300 })
        if (!messageArray[1]) { messageArray[1] = 1 }
        let check = Math.floor(Math.abs(messageArray[1]));
        if (check !== check) return;
        currency.findOne({ userID: message.author.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно <:vip:792407099949973534>`)
                    return message.channel.send({ embeds: [embed]});
                }
                else if (bounty.new < 1) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас недостаточно <:vip:792407099949973534>`)
                    return message.channel.send({ embeds: [embed]})
                }
                else {
                    let ibounty = Math.floor(Math.random() * 51) + 30;
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}** открыл <:vip:792407099949973534> и получил ${ibounty} <:tango:792406777844989983> `)
                        .setFooter(`Команда: ${cmd}`)
                    message.channel.send({ embeds: [embed]})
                    bounty.bounty = bounty.bounty + ibounty;
                    bounty.new = bounty.new - 1;
                    bounty.save().catch(err => console.log(err));

                }
            })
    }
    //award
    if (cmd === `${prefix}award`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: check,
                        bag: 0,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: 0
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.bounty = bounty.bounty + check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил пользователя **${message.mentions.users.first().username}** ${check} <:tango:792406777844989983> `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил вас ${check} <:tango:792406777844989983> `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //awardbag
    if (cmd === `${prefix}awardbag`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: 0,
                        bag: check,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: 0
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.bag = bounty.bag + check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил пользователя **${message.mentions.users.first().username}** ${check} :moneybag: `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил вас ${check} :moneybag: `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //awardvip
    if (cmd === `${prefix}awardvip`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: 0,
                        bag: 0,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: check
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.new = bounty.new + check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил пользователя **${message.mentions.users.first().username}** ${check} <:vip:792407099949973534> `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`**${message.author.username}** наградил вас ${check} <:vip:792407099949973534> `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //take
    if (cmd === `${prefix}take`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: -check,
                        bag: 0,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: 0
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.bounty = bounty.bounty - check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у пользователя **${message.mentions.users.first().username}** ${check} <:tango:792406777844989983> `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у вас ${check} <:tango:792406777844989983> `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //takebag
    if (cmd === `${prefix}takebag`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: 0,
                        bag: -check,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: 0
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.bag = bounty.bag - check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у пользователя **${message.mentions.users.first().username}** ${check} :moneybag: `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у вас ${check} :moneybag: `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //takevip
    if (cmd === `${prefix}takevip`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let check1 = args.join(" ").slice(22);
        if (!check1) { check1 = 1 }
        if (!message.mentions.users.first()) return;
        let check = Math.floor(Math.abs(check1));
        if (check !== check) return;
        currency.findOne({ userID: message.mentions.users.first().id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    const newcurrency = new currency({
                        _id: mongoose.Types.ObjectId(),
                        serverID: "720143930628505661",
                        userID: message.mentions.users.first().id,
                        bounty: 0,
                        bag: 0,
                        rune1: 0,
                        rune2: 0,
                        rune3: 0,
                        new: -check
                    });
                    newcurrency.save().catch(err => console.log(err));
                } else {
                    bounty.new = bounty.new - check;
                    bounty.save().catch(err => console.log(err));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у пользователя **${message.mentions.users.first().username}** ${check} <:vip:792407099949973534> `)
                message.channel.send({ embeds: [embed]}).then(msg => { msg.delete({ timeout: 30000 }) });
                let embed2 = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorNo}`)
                    .setDescription(`**${message.author.username}** забрал у вас ${check} <:vip:792407099949973534> `)
                message.mentions.users.first().send({ embeds: [embed2]})
            })
    }
    //shop
    if (cmd === `${prefix}shop`) {
        message.delete({ timeout: 300 })
        let embed = new MessageEmbed()
            .setAuthor("dark reef | Secret Shop", message.guild.iconURL)
            .setColor(`${botconfig.colorYes}`)
            .setDescription("**Подробнее о командах можешь узнать тут - <#724514164063731723>**")
            .setFooter(`Вызвал: ${message.author.username}`, message.author.avatarURL)
            .addField("Роль на 3д", "300 <:tango:792406777844989983>", true)
            .addField("Команда", "!crole3 #HEX название", true)
            .addField("⠀", "⠀", true)
            .addField("Роль на 7д", "700 <:tango:792406777844989983>", true)
            .addField("Команда", "!crole7 #HEX название", true)
            .addField("⠀", "⠀", true)
            .addField("Роль на 10д", "1000 <:tango:792406777844989983>", true)
            .addField("Команда", "!crole10 #HEX название", true)
            .addField("⠀", "⠀", true)
            .addField("Комната на 7д", "1000 <:tango:792406777844989983>", true)
            .addField("Команда", "!croom Название", true)
            .addField("⠀", "⠀", true)
        message.channel.send({ embeds: [embed]});
    }
    //profile
    if (cmd === `${prefix}profile` || cmd === `${prefix}$`) {
        message.delete({ timeout: 300 })
        let prof = message.author;
        if (message.mentions.members.first()) { message.member = message.mentions.members.first(), message.author = message.mentions.users.first() }
        let embed = new MessageEmbed()
            .setAuthor("dark reef", message.guild.iconURL)
            .setTitle(`Личный профиль | **${message.author.username}**`, `${message.author.displayAvatarURL}`)
            .setFooter(`Вызвал: ${prof.username}`, prof.displayAvatarURL)
            .setColor(`${botconfig.colorYes}`)
            .setThumbnail(message.author.displayAvatarURL)
        currency.findOne({ userID: message.member.id },
            (err, bounty) => {
                if (err) console.log(err);
                if (!bounty) {
                    embed.addField(" __**Инвентарь**:__", `\`0\`<:tango:792406777844989983> \`0\` :moneybag: 
                \`0\` <:vip:792407099949973534> `, true)
                }
                else {
                    embed.addField(" __**Инвентарь**:__", `\`${bounty.bounty}\`<:tango:792406777844989983>  \`${bounty.bag}\` :moneybag: 
                \`${bounty.new}\` <:vip:792407099949973534>   `, true)
                }
                embed.addField("⠀", "⠀", true)
                let m = 0; let d = 0;
                if (new Date(message.member.joinedTimestamp).getMonth() > 9) m = new Date(message.member.joinedTimestamp).getMonth() + 1
                else { m = `0${new Date(message.member.joinedTimestamp).getMonth() + 1}` }
                if (new Date(message.member.joinedTimestamp).getDate() > 9) d = new Date(message.member.joinedTimestamp).getDate()
                else { d = `0${new Date(message.member.joinedTimestamp).getDate()}` }
                embed.addField(" __**Присоединился:**__", `\`\`\`${d}.${m}.${new Date(message.member.joinedTimestamp).getFullYear()}\`\`\``, true)
                setTimeout(function () {
                    message.channel.send({ embeds: [embed]});
                }, 1000)
            })
    }
    //addinfo
    if (cmd === `${prefix}status`) {
        message.delete({ timeout: 300 })
        if (!args.join(" ")) return;
        if (args.join(" ").length > 40) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, вы привысили лимит в 40 символов`)
            return message.channel.send({ embeds: [embed]})
        }
        else {
            status.findOne({ userID: message.author.id },
                (err, stat) => {
                    if (err) console.log(err);
                    if (!stat) {
                        const newstatus = new status({
                            _id: mongoose.Types.ObjectId(),
                            serverID: "720143930628505661",
                            userID: message.author.id,
                            status: args.join(" ")
                        });
                        newstatus.save().catch(err => console.log(err));
                    }
                    else {
                        stat.status = args.join(" ")
                        stat.save().catch(err => console.log(err));
                    }
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}**, вы успешно сменили свой статус`)
                    return message.channel.send({ embeds: [embed]});
                })
        }
    }
    //lb
    if (cmd === `${prefix}lb`) {
        message.delete({ timeout: 300 })
        try {
            currency.find().sort([['bounty', 'descending']]).exec(async (err, res) => {
                if (err) console.log(err);
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setTitle("Самые богатые пользователи нашего сервера!")
                    .setColor(`${botconfig.colorYes}`)
                    .setFooter(`Команда: ${cmd}`)
                if (res.length < 10) {
                    //less than 10 results
                    for (i = 0; i < res.length; i++) {
                        try {
                            let member = await message.guild.members.fetch(res[i].userID)
                            if (member === undefined) {
                                embed.addField(`**${i + 1}**. User Left`, `**${res[i].bounty}** <:tango:792406777844989983> `);
                            } else {
                                embed.addField(`**${i + 1}**. ${member.user.username}`, `**${res[i].bounty}** <:tango:792406777844989983> `);
                            }
                        } catch (e) { console.log(e) }
                    }
                } else {
                    //more than 10 results
                    for (i = 0; i < 10; i++) {
                        try {
                            let member = await message.guild.members.fetch(res[i].userID)
                            if (member === undefined) {
                                embed.addField(`**${i + 1}**. User Left`, `**${res[i].bounty}** <:tango:792406777844989983> `);
                            } else {
                                embed.addField(`**${i + 1}**. ${member.user.username}`, `**${res[i].bounty}** <:tango:792406777844989983> `)
                            }
                        } catch (e) { console.log(e) }
                    }
                }

                message.channel.send({ embeds: [embed]});
            })
        } catch (e) { console.log(e) }
    }
    //rolesize
    if (cmd === `${prefix}size123123`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("720216846673903687")) return;
        let embed = new MessageEmbed()
            .setAuthor("dark reef", message.guild.iconURL)
            .setColor(`${botconfig.colorYes}`)
            .setDescription(`В данный момент на сервере **${message.guild.roles.size}** ролей и **${message.guild.members.filter(m => m.voiceChannel).size}** голосового онлайна`)
        message.channel.send({ embeds: [embed]});
    }
    //kick
    if (cmd === `${prefix}kick123`) {
        message.delete({ timeout: 300 })
        if (!message.member.voice.channel) return
        if (!message.mentions.members.first()) return
        if (!message.mentions.members.first().voiceChannel) return
        if (message.mentions.users.first() == message.author) return
        createroom.findOne({ RoomID: message.member.voice.channelID },
            (err, UserID) => {
                if (err) console.log(err);
                if (!UserID) return
                if (UserID.userID == message.author.id) {
                    message.member.voice.channel.overwritePermissions(message.mentions.users.first(), {
                        CONNECT: false
                    })
                        .then(updated => console.log(updated.permissionOverwrites.get(message.mentions.users.first())))
                        .catch(console.error);
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}**, вы успешно кикнули **${message.mentions.users.first().username}** из комнаты`)
                    message.channel.send({ embeds: [embed]});
                    message.mentions.members.first().setVoiceChannel("675740699160739870");
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вы можете кикать людей только из своей комнаты`)
                    message.channel.send({ embeds: [embed]});
                }
            })
    }
    //buy DONAT
    if (cmd === `${prefix}cvip123`) {
        message.delete({ timeout: 300 })
        if (message.member.roles.cache.has("674958144568426537")) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, у вас уже есть **Vip** статус`)
            return message.channel.send({ embeds: [embed]});
        }
        viprole.findOne({ userID: message.member.id },
            (err, RoleID) => {
                if (err) console.log(err);
                if (!RoleID) {
                    currency.findOne({ userID: message.member.id },
                        (err, bounty) => {
                            if (err) console.log(err);
                            if (!bounty) {
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorNo}`)
                                    .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                            else if (bounty.bounty < 5000) {
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorNo}`)
                                    .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                            else {
                                const newviprole = new viprole({
                                    _id: mongoose.Types.ObjectId(),
                                    serverID: "720143930628505661",
                                    userID: message.member.id,
                                    RoleID: "674958144568426537",
                                    time: Number(Date.now()) + 604800000
                                });
                                newviprole.save().catch(err => console.log(err));
                                bounty.bounty = bounty.bounty - 5000
                                bounty.save().catch(err => console.log(err));
                                message.member.roles.add(`${"674958144568426537"}`)
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorYes}`)
                                    .setDescription(`**${message.author.username}**, вы успешно купили роль **Shinigami** на **7** дней за **5000** <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                        })
                }
                else {
                    currency.findOne({ userID: message.member.id },
                        (err, bounty) => {
                            if (err) console.log(err);
                            if (!bounty) {
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorNo}`)
                                    .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                            else if (bounty.bounty < 5000) {
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorNo}`)
                                    .setDescription(`**${message.author.username}**, у вас недостаточно <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                            else {
                                RoleID.RoleID = "674958144568426537",
                                    RoleID.time = Number(Date.now()) + 604800000
                                RoleID.save().catch(err => console.log(err));
                                bounty.bounty = bounty.bounty - 5000
                                bounty.save().catch(err => console.log(err));
                                message.member.roles.add("674958144568426537")
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorYes}`)
                                    .setDescription(`**${message.author.username}**, вы успешно купили роль **Shinigami** на **7** дней за **5000** <:tango:792406777844989983>`)
                                return message.channel.send({ embeds: [embed]});
                            }
                        })
                }
            })
    }
    //checkvip
    if (cmd === `${prefix}checkvip123`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("674958144568426537")) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, у вас нет **Vip** статуса`)
            return message.channel.send({ embeds: [embed]});
        }
        viprole.findOne({ userID: message.member.id },
            (err, RoleID) => {
                if (err) console.log(err);
                if (!RoleID) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас нет **Vip** статуса`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    let checkvip = RoleID.time - Number(Date.now());
                    let o = Math.floor(checkvip / 86400000);
                    let u = Math.floor((checkvip - (o * 86400000)) / 3600000);
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setDescription(`**${message.author.username}**, ваш **Vip** статус будет активен еще **${o}** д. и **${u}** ч.`)
                    return message.channel.send({ embeds: [embed]});
                }
            })
    }
    //createroom
    if (cmd === `${prefix}croom`) {
        message.delete({ timeout: 300 })
        if (!message.member.roles.cache.has("785882982716014612") && !message.member.roles.cache.has("808626337103216660") &&
        !message.member.roles.cache.has("786798831962423367") && !message.member.roles.cache.has("785765137709400064")){
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, вы не можете создать комнату`)
            return message.channel.send({ embeds: [embed]});
        }
        if (!messageArray[2]) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания комнаты: !croom #123456 название комнаты`)
            return message.channel.send({ embeds: [embed]});
        }
        if (messageArray[1].substr(0, 1) !== "#" || messageArray[1].length != 7) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, корректная команда для создания комнаты: !croom #123456 название комнаты`)
            return message.channel.send({ embeds: [embed]});
        }
        if (messageArray[1] === "#000000") messageArray[1] = "#030303";
        privatenew.findOne({ userID: message.member.id },
            (err, RoomID) => {
                if (err) console.log(err);
                if (!RoomID) {
                    let RoleID1;
                    message.guild.roles.create({
                        
                            name: args.join(" ").slice(7),
                            color: messageArray[1],
                            position: message.guild.roles.size - 11
                        
                    })
                        .then(role => {
                            RoleID1 = role.id;
                            message.member.roles.add(`${role.id}`);
                            message.guild.channels.create(`${args.join(" ").slice(7)}`, {
                                type: 'GUILD_VOICE',
                                parent: '792409446118719579',
                                permissionOverwrites: [
                                    {
                                        id: message.guild.id,
                                        deny: ['CONNECT']
                                    },
                                    {
                                        id: role.id,
                                        allow: ['CONNECT','VIEW_CHANNEL']
                                    }
                                ],
                            })
                                .then(c => {
                                    const newprivatenew = new privatenew({
                                        _id: mongoose.Types.ObjectId(),
                                        serverID: "720143930628505661",
                                        userID: message.author.id,
                                        RoomID: c.id,
                                        RoleID: role.id,
                                        Exp: 0
                                    });
                                    newprivatenew.save().catch(err => console.log(err));
                                    let embed = new MessageEmbed()
                                        .setAuthor("dark reef", message.guild.iconURL)
                                        .setColor(`${botconfig.colorYes}`)
                                        .setFooter(`Команда: ${cmd}`)
                                        .setDescription(`**${message.author.username}**, вы успешно создали комнату с названием **${args.join(" ").slice(7)}**`)
                                    return message.channel.send({ embeds: [embed]});
                                }).catch(console.error);
                        })
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас уже есть личная комната`)
                    return message.channel.send({ embeds: [embed]});
                }
            })
    }
    //uproom
    if (cmd === `${prefix}uproom1237643`) {
        message.delete({ timeout: 300 })
        let nameroom = args.join(" ");
        if (!nameroom) { nameroom = message.author.username };
        currency.findOne({ userID: message.member.id },
            (err, userID) => {
                if (err) console.log(err);
                if (!userID) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **${1000}** <:tango:792406777844989983>  для продления комнаты`)
                    return message.channel.send({ embeds: [embed]});
                }
                else if (userID.bounty < 1000) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вам не хватает **${1000 - userID.bounty}** <:tango:792406777844989983>  для продления комнаты`)
                    return message.channel.send({ embeds: [embed]});
                }
                else {
                    privateroom.findOne({ userID: message.member.id },
                        (err, RoomID) => {
                            if (err) console.log(err);
                            if (!RoomID) {
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorNo}`)
                                    .setDescription(`**${message.author.username}**, вы не можете продлить несуществующую комнату`)
                                return message.channel.send({ embeds: [embed]})
                            }
                            else {
                                RoomID.time = RoomID.time + 604800000
                                RoomID.save().catch(err => console.log(err));
                                userID.bounty = userID.bounty - 1000
                                userID.save().catch(err => console.log(err));
                                let embed = new MessageEmbed()
                                    .setAuthor("dark reef", message.guild.iconURL)
                                    .setColor(`${botconfig.colorYes}`)
                                    .setFooter(`Команда: ${cmd}`)
                                    .setDescription(`**${message.author.username}**, вы успешно продлили свою комнату на 7 дней за 1000 <:tango:792406777844989983> `)
                                return message.channel.send({ embeds: [embed]});
                            }
                        }
                    )
                }
            })
    }
    //nameroom
    if (cmd === `${prefix}nameroom`) {
        message.delete({ timeout: 300 })
        if (!args.join(" ")) return;
        let nameroom = args.join(" ");
        privatenew.findOne({ userID: message.member.id },
            (err, RoomID) => {
                if (err) console.log(err);
                if (!RoomID) {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, вы не можете изменить название несуществующей комнаты`)
                    return message.channel.send({ embeds: [embed]})
                }
                else {
                    if (message.guild.roles.cache.get(`${RoomID.RoleID}`)) message.guild.roles.cache.get(`${RoomID.RoleID}`).setName(`${nameroom}`)
                    if (message.guild.channels.cache.get(`${RoomID.RoomID}`)) message.guild.channels.cache.get(`${RoomID.RoomID}`).setName(`${nameroom}`)
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorYes}`)
                        .setFooter(`Команда: ${cmd}`)
                        .setDescription(`**${message.author.username}**, вы успешно изменили название своей комнаты на **${nameroom}**`)
                    return message.channel.send({ embeds: [embed]});
                }
            }
        )
    }
    //adduser
    if (cmd === `${prefix}adduser`) {
        message.delete({ timeout: 300 })
        if (!message.mentions.users.first()) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, вы ввели некорректную команду`)
            message.channel.send({ embeds: [embed]});
            return;
        }
        privatenew.findOne({ userID: message.member.id },
            (err, RoomID) => {
                if (err) console.log(err);
                if (RoomID) {
                    if (message.guild.roles.cache.get(`${RoomID.RoleID}`)) {
                        message.mentions.members.first().roles.add(`${RoomID.RoleID}`);
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorYes}`)
                            .setFooter(`Команда: ${cmd}`)
                            .setDescription(`**${message.author.username}**, вы успешно дали **${message.mentions.users.first().username}** доступ к своей комнате`)
                        message.channel.send({ embeds: [embed]});
                    }
                    else{
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorNo}`)
                            .setFooter(`Команда: ${cmd}`)
                            .setDescription(`**${message.author.username}**, ошибка`)
                        message.channel.send({ embeds: [embed]});
                    }
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас нет комнаты`)
                    message.channel.send({ embeds: [embed]});
                }
            })
    }
    //deleteuser
    if (cmd === `${prefix}deleteuser`) {
        message.delete({ timeout: 300 })
        if (!message.mentions.users.first()) {
            let embed = new MessageEmbed()
                .setAuthor("dark reef", message.guild.iconURL)
                .setColor(`${botconfig.colorNo}`)
                .setDescription(`**${message.author.username}**, вы ввели некорректную команду`)
            message.channel.send({ embeds: [embed]});
            return;
        }
        privatenew.findOne({ userID: message.member.id },
            (err, RoomID) => {
                if (err) console.log(err);
                if (RoomID) {
                    if (message.guild.roles.cache.get(`${RoomID.RoleID}`)) {
                        message.mentions.members.first().roles.remove(`${RoomID.RoleID}`);
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorYes}`)
                            .setFooter(`Команда: ${cmd}`)
                            .setDescription(`**${message.author.username}**, вы успешно забрали у **${message.mentions.users.first().username}** доступ к своей комнате`)
                        message.channel.send({ embeds: [embed]});
                    }
                    else{
                        let embed = new MessageEmbed()
                            .setAuthor("dark reef", message.guild.iconURL)
                            .setColor(`${botconfig.colorNo}`)
                            .setFooter(`Команда: ${cmd}`)
                            .setDescription(`**${message.author.username}**, ошибка`)
                        message.channel.send({ embeds: [embed]});
                    }
                }
                else {
                    let embed = new MessageEmbed()
                        .setAuthor("dark reef", message.guild.iconURL)
                        .setColor(`${botconfig.colorNo}`)
                        .setDescription(`**${message.author.username}**, у вас нет комнаты`)
                    message.channel.send({ embeds: [embed]});
                }
            })
    }
    //newgame
    if (cmd === `${prefix}newgame`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (!message.member.roles.cache.has("724514886704431218") && !message.member.roles.cache.has("720216846673903687")) return message.channel.send(`**${message.author.username}**, начать игру может только **Host**`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (gamestart == 1) return message.channel.send(`**${message.author.username}**, подождите, пока наберутся участники в уже стартовавшую игру`).then(msg => setTimeout(() => msg.delete(), 5000));
        gamestart = 1;
        dota["gameID"] = { dota: dota["gameID"].dota + 1 };
        fs.writeFile("./dota.json", JSON.stringify(dota, null, 2), (err) => { if (err) console.log(err) })
        let lobby = Number(Math.floor(Math.random() * 9000) + 1000);
        let pass = Number(Math.floor(Math.random() * 9000) + 1000);
        newclosedota = new closedota({
            _id: mongoose.Types.ObjectId(),
            serverID: message.guild.id,
            HostID: message.member.id,
            GameID: dota["gameID"].dota,
            Lobby: lobby,
            Pass: pass,
            Win: 0,
            radiant1: 0,
            radiant2: 0,
            radiant3: 0,
            radiant4: 0,
            radiant5: 0,
            dire1: 0,
            dire2: 0,
            dire3: 0,
            dire4: 0,
            dire5: 0,
            radiantroom: 0,
            direroom: 0
        })
        newclosedota.save().catch(err => console.log(err));
        message.member.roles.add("792419201024262215");
        pos1 = 0;
        pos2 = 0;
        pos3 = 0;
        pos4 = 0;
        pos5 = 0;
        let embed = new MessageEmbed()
            .setAuthor("dark reef", message.guild.iconURL)
            .setColor(`${botconfig.colorYes}`)
            .addField("Carry", `${pos1}/2`)
            .addField("Mid", `${pos2}/2`)
            .addField("Hard", `${pos3}/2`)
            .addField("Sup 4pos", `${pos4}/2`)
            .addField("Sup 5pos", `${pos5}/2`)
        message.channel.send({ embeds: [embed]}).then(msg => {
            dota["messageID"] = { "dota": msg.id };
            fs.writeFile("./dota.json", JSON.stringify(dota, null, 2), (err) => { if (err) console.log(err) })
        })
        message.member.send(`lobby: Pussy${lobby}    pass: ${pass}`)
    }
    //deletegame
    if (cmd === `${prefix}deletegame`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (!message.member.roles.cache.has("792419201024262215")) return message.channel.send(`**${message.author.username}**, вы не можете отменить игру`).then(msg => setTimeout(() => msg.delete(), 5000));
        message.member.roles.remove("792419201024262215");
        gamestart = 0;
        pos1 = 0;
        pos2 = 0;
        pos3 = 0;
        pos4 = 0;
        pos5 = 0;
        message.channel.send(`**${message.author.username}** отменил игру`).then(msg => setTimeout(() => msg.delete(), 5000));
        message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
            msg.delete()
        })
    }
    //start1pos
    if (cmd === `${prefix}start1pos`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart !== 1) return message.channel.send(`В данный момент нет открытых игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (typeof message.member.voice.channel == `undefined` || !message.member.voice.channel)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (message.member.voice.channel.id !== `783675902126194728`)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (pos1 == 2) return message.channel.send(`Все **Carry** слоты заняты`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                let coin = Number(Math.floor(Math.random() * 2) + 1);
                if (pos1 == 0) {
                    if (coin == 1) {
                        gameID.radiant1 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (coin == 2) {
                        gameID.dire1 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                if (pos1 == 1) {
                    if (gameID.radiant1 == 0) {
                        gameID.radiant1 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (gameID.dire1 == 0) {
                        gameID.dire1 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                pos1 = pos1 + 1;
                message.channel.send(`**${message.author.username}**, вы присоединились к игре на позиции **Carry**`).then(msg => setTimeout(() => msg.delete(), 5000));
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //start2pos
    if (cmd === `${prefix}start2pos`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart !== 1) return message.channel.send(`В данный момент нет открытых игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (typeof message.member.voice.channel == `undefined` || !message.member.voice.channel)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (message.member.voice.channel.id !== `783675902126194728`)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (pos2 == 2) return message.channel.send(`Все **Mid** слоты заняты`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                let coin = Number(Math.floor(Math.random() * 2) + 1);
                if (pos2 == 0) {
                    if (coin == 1) {
                        gameID.radiant2 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (coin == 2) {
                        gameID.dire2 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                if (pos2 == 1) {
                    if (gameID.radiant2 == 0) {
                        gameID.radiant2 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (gameID.dire2 == 0) {
                        gameID.dire2 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                pos2 = pos2 + 1;
                message.channel.send(`**${message.author.username}**, вы присоединились к игре на позиции **Mid**`).then(msg => setTimeout(() => msg.delete(), 5000));
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //start3pos
    if (cmd === `${prefix}start3pos`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart !== 1) return message.channel.send(`В данный момент нет открытых игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (typeof message.member.voice.channel == `undefined` || !message.member.voice.channel)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (message.member.voice.channel.id !== `783675902126194728`)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (pos3 == 2) return message.channel.send(`Все **Hard** слоты заняты`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                let coin = Number(Math.floor(Math.random() * 2) + 1);
                if (pos3 == 0) {
                    if (coin == 1) {
                        gameID.radiant3 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (coin == 2) {
                        gameID.dire3 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                if (pos3 == 1) {
                    if (gameID.radiant3 == 0) {
                        gameID.radiant3 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (gameID.dire3 == 0) {
                        gameID.dire3 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                pos3 = pos3 + 1;
                message.channel.send(`**${message.author.username}**, вы присоединились к игре на позиции **Hard**`).then(msg => setTimeout(() => msg.delete(), 5000));
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //start4pos
    if (cmd === `${prefix}start4pos`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart !== 1) return message.channel.send(`В данный момент нет открытых игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (typeof message.member.voice.channel == `undefined` || !message.member.voice.channel)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (message.member.voice.channel.id !== `783675902126194728`)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (pos4 == 2) return message.channel.send(`Все **Sup 4pos** слоты заняты`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                let coin = Number(Math.floor(Math.random() * 2) + 1);
                if (pos4 == 0) {
                    if (coin == 1) {
                        gameID.radiant4 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (coin == 2) {
                        gameID.dire4 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                if (pos4 == 1) {
                    if (gameID.radiant4 == 0) {
                        gameID.radiant4 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (gameID.dire4 == 0) {
                        gameID.dire4 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                pos4 = pos4 + 1;
                message.channel.send(`**${message.author.username}**, вы присоединились к игре на позиции **Sup 4pos**`).then(msg => setTimeout(() => msg.delete(), 5000));
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //start5pos
    if (cmd === `${prefix}start5pos`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart !== 1) return message.channel.send(`В данный момент нет открытых игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        if (typeof message.member.voice.channel == `undefined` || !message.member.voice.channel)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (message.member.voice.channel.id !== `783675902126194728`)
            return message.channel.send(`**${message.author.username}**, вы должны находиться в голосовом канале "**5x5 lobby**", чтобы присоединиться к игре`).then(msg => setTimeout(() => msg.delete(), 8000));
        if (pos5 == 2) return message.channel.send(`Все **Sup 5pos** слоты заняты`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.radiant5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire1 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire2 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire3 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire4 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.dire5 == message.author.id) return message.channel.send(`**${message.author.username}**, вы уже присоединились к данной игре`).then(msg => setTimeout(() => msg.delete(), 5000));
                let coin = Number(Math.floor(Math.random() * 2) + 1);
                if (pos5 == 0) {
                    if (coin == 1) {
                        gameID.radiant5 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (coin == 2) {
                        gameID.dire5 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                if (pos5 == 1) {
                    if (gameID.radiant5 == 0) {
                        gameID.radiant5 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                    if (gameID.dire5 == 0) {
                        gameID.dire5 = message.author.id
                        gameID.save().catch(err => console.log(err));
                    }
                }
                pos5 = pos5 + 1;
                message.channel.send(`**${message.author.username}**, вы присоединились к игре на позиции **Sup 5pos**`).then(msg => setTimeout(() => msg.delete(), 5000));
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //startgame
    if (cmd === `${prefix}startgame`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (pos1 + pos2 + pos3 + pos4 + pos5 !== 10) return message.channel.send(`**${message.author.username}**, вы не можете начать игру, т.к. не хватает участников`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                let oxy1 = message.guild.members.cache.get(gameID.radiant1);
                let oxy2 = message.guild.members.cache.get(gameID.radiant2);
                let oxy3 = message.guild.members.cache.get(gameID.radiant3);
                let oxy4 = message.guild.members.cache.get(gameID.radiant4);
                let oxy5 = message.guild.members.cache.get(gameID.radiant5);
                let oxy6 = message.guild.members.cache.get(gameID.dire1);
                let oxy7 = message.guild.members.cache.get(gameID.dire2);
                let oxy8 = message.guild.members.cache.get(gameID.dire3);
                let oxy9 = message.guild.members.cache.get(gameID.dire4);
                let oxy10 = message.guild.members.cache.get(gameID.dire5);
                let oxy11 = message.guild.members.cache.get(gameID.HostID);
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .setDescription(`ID game: **${gameID.GameID}**`)
                    .addField(`Lobby: `, `Pussy${gameID.Lobby}`, true)
                    .addField(`Pass: `, `${gameID.Pass}`, true)
                    .addField("Host", `<@${gameID.HostID}>`, true)
                    .addField("Carry radiant(свет)", `<@${gameID.radiant1}>`)
                    .addField("Mid radiant(свет)", `<@${gameID.radiant2}>`)
                    .addField("Hard radiant(свет)", `<@${gameID.radiant3}>`)
                    .addField("Sup 4pos radiant(свет)", `<@${gameID.radiant4}>`)
                    .addField("Sup 5pos radiant(свет)", `<@${gameID.radiant5}>`)
                    .addField("Carry dire(тьма)", `<@${gameID.dire1}>`)
                    .addField("Mid dire(тьма)", `<@${gameID.dire2}>`)
                    .addField("Hard dire(тьма)", `<@${gameID.dire3}>`)
                    .addField("Sup 4pos dire(тьма)", `<@${gameID.dire4}>`)
                    .addField("Sup 5pos dire(тьма)", `<@${gameID.dire5}>`);
                if (oxy11 !== oxy1 && oxy11 !== oxy2 && oxy11 !== oxy3 && oxy11 !== oxy4 && oxy11 !== oxy5 && oxy11 !== oxy6 && oxy11 !== oxy7 && oxy11 !== oxy8 &&
                    oxy11 !== oxy9 && oxy11 !== oxy10) { oxy11.send({ embeds: [embed]}) };
                oxy1.send({ embeds: [embed]});
                oxy2.send({ embeds: [embed]});
                oxy3.send({ embeds: [embed]});
                oxy4.send({ embeds: [embed]});
                oxy5.send({ embeds: [embed]});
                oxy6.send({ embeds: [embed]});
                oxy7.send({ embeds: [embed]});
                oxy8.send({ embeds: [embed]});
                oxy9.send({ embeds: [embed]});
                oxy10.send({ embeds: [embed]});
                pos1 = 0; pos2 = 0; pos3 = 0; pos4 = 0; pos5 = 0; gamestart = 0;
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.delete()
                })
                oxy11.roles.remove("792419201024262215");
                message.guild.channels.create(`Radiant ID:${dota[`gameID`].dota}`, {
                    type: 'GUILD_VOICE',
                    parent: '783675822972076053',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['CONNECT']
                        },
                        {
                            id: oxy1.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy2.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy3.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy4.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy5.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy11.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: "721765995471044659",
                            allow: ['CONNECT']
                        },
                        {
                            id: "720216846673903687",
                            allow: ['CONNECT']
                        },
                    ],
                })
                    .then(c => {
                        gameID.radiantroom = c.id
                        gameID.save().catch(err => console.log(err))
                    })
                    .catch(console.error);
                message.guild.channels.create(`Dire ID:${dota[`gameID`].dota}`, {
                    type: 'GUILD_VOICE',
                    parent: '783675822972076053',
                    permissionOverwrites: [
                        {
                            id: message.guild.id,
                            deny: ['CONNECT']
                        },
                        {
                            id: oxy6.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy7.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy8.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy9.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy10.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: oxy11.id,
                            allow: ['CONNECT']
                        },
                        {
                            id: "721765995471044659",
                            allow: ['CONNECT']
                        },
                        {
                            id: "720216846673903687",
                            allow: ['CONNECT']
                        },
                    ],
                })
                    .then(c => {
                        gameID.direroom = c.id
                        gameID.save().catch(err => console.log(err))
                    })
                    .catch(console.error);
            })

    }
    //stopgame
    if (cmd === `${prefix}stopgame`) {
        message.delete({ timeout: 5000 })
        if (message.channel.id !== `792418636873728080`) return;
        if (gamestart == 0) return message.channel.send(`${message.author.username}, в данный момент нет активных игр`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: dota["gameID"].dota },
            (err, gameID) => {
                if (err) console.log(err);
                if (gameID.radiant1 == message.author.id) {
                    gameID.radiant1 = 0
                    gameID.save().catch(err => console.log(err));
                    pos1 = pos1 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.radiant2 == message.author.id) {
                    gameID.radiant2 = 0
                    gameID.save().catch(err => console.log(err));
                    pos2 = pos2 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.radiant3 == message.author.id) {
                    gameID.radiant3 = 0
                    gameID.save().catch(err => console.log(err));
                    pos3 = pos3 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.radiant4 == message.author.id) {
                    gameID.radiant4 = 0
                    gameID.save().catch(err => console.log(err));
                    pos4 = pos4 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.radiant5 == message.author.id) {
                    gameID.radiant5 = 0
                    gameID.save().catch(err => console.log(err));
                    pos5 = pos5 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.dire1 == message.author.id) {
                    gameID.dire1 = 0
                    gameID.save().catch(err => console.log(err));
                    pos1 = pos1 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.dire2 == message.author.id) {
                    gameID.dire2 = 0
                    gameID.save().catch(err => console.log(err));
                    pos2 = pos2 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.dire3 == message.author.id) {
                    gameID.dire3 = 0
                    gameID.save().catch(err => console.log(err));
                    pos3 = pos3 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.dire4 == message.author.id) {
                    gameID.dire4 = 0
                    gameID.save().catch(err => console.log(err));
                    pos4 = pos4 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                if (gameID.dire5 == message.author.id) {
                    gameID.dire5 = 0
                    gameID.save().catch(err => console.log(err));
                    pos5 = pos5 - 1;
                    message.channel.send(`**${message.author.username}**, вы вышли из очереди поиска игры`).then(msg => setTimeout(() => msg.delete(), 5000));
                }
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(`${botconfig.colorYes}`)
                    .addField("Carry", `${pos1}/2`)
                    .addField("Mid", `${pos2}/2`)
                    .addField("Hard", `${pos3}/2`)
                    .addField("Sup 4pos", `${pos4}/2`)
                    .addField("Sup 5pos", `${pos5}/2`)
                message.channel.messages.fetch(dota["messageID"].dota).then(msg => {
                    msg.edit({ embeds: [embed]})
                })
            })
    }
    //cancelgame
    if (cmd === `${prefix}cancelgame`) {
        message.delete({ timeout: 5000 })
        let bnm = args.join(" ");
        if (isNaN(bnm)) return message.channel.send(`${message.author.username}, корректная команда: "!cancelgame 123", где 123 - айди матча`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: bnm },
            (err, gameID) => {
                if (err) console.log(err);
                if (!gameID) return message.channel.send(`${message.author.username}, матч с таким айди еще не состоялся`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.Win == 1) return message.channel.send(`${message.author.username}, результаты этого матча уже записаны`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.HostID !== message.author.id) return message.channel.send(`${message.author.username}, только хост может записать результаты матча`).then(msg => setTimeout(() => msg.delete(), 5000));
                gameID.Win = 1;
                gameID.save().catch(err => console.log(err));
                message.channel.send(`Матч с ID **${bnm}** был отменён`).then(msg => { msg.delete({ timeout: 10000 }) });
                //удалить комнаты
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom).delete()
                }
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom).delete()
                }
            })
    }
    //radiantwin
    if (cmd === `${prefix}radiantwin`) {
        message.delete({ timeout: 5000 })
        let bnm = args.join(" ");
        if (isNaN(bnm)) return message.channel.send(`${message.author.username}, корректная команда: "!radiantwin 123", где 123 - айди матча`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: bnm },
            (err, gameID) => {
                if (err) console.log(err);
                if (!gameID) return message.channel.send(`${message.author.username}, матч с таким айди еще не состоялся`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.Win == 1) return message.channel.send(`${message.author.username}, результаты этого матча уже записаны`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.HostID !== message.author.id) return message.channel.send(`${message.author.username}, только хост может записать результаты матча`).then(msg => setTimeout(() => msg.delete(), 5000));
                gameID.Win = 1;
                gameID.save().catch(err => console.log(err));
                //удалить комнаты
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom).delete()
                }
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom).delete()
                }
                //ПОБЕДИТЕЛИ
                //НАГРАДЫ
                let pos1bag = 2
                if (gameID.radiant1 == gameID.HostID) pos1bag = 3
                let pos2bag = 2
                if (gameID.radiant2 == gameID.HostID) pos2bag = 3
                let pos3bag = 2
                if (gameID.radiant3 == gameID.HostID) pos3bag = 3
                let pos4bag = 2
                if (gameID.radiant4 == gameID.HostID) pos4bag = 3
                let pos5bag = 3
                if (gameID.radiant5 == gameID.HostID) pos5bag = 4
                currency.findOne({ userID: gameID.radiant1 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.radiant1,
                                bounty: 0,
                                bag: pos1bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0

                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos1bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.radiant2 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.radiant2,
                                bounty: 0,
                                bag: pos2bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos2bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.radiant3 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.radiant3,
                                bounty: 0,
                                bag: pos3bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos3bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.radiant4 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.radiant4,
                                bounty: 0,
                                bag: pos4bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos4bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.radiant5 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.radiant5,
                                bounty: 0,
                                bag: pos5bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos5bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                //клоз лог
                let winschannel = message.guild.channels.cache.find(c => c.name === "close-log")
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(botconfig.colorYes)
                    .addField(`**ID game: ${bnm}**`,

                        `**Победа: Radiant**

    **Host: <@${gameID.HostID}>**

    **Победители:** <@${gameID.radiant1}>, <@${gameID.radiant2}>, <@${gameID.radiant3}>, <@${gameID.radiant4}>, <@${gameID.radiant5}>

    **Проигравшие:** <@${gameID.dire1}>, <@${gameID.dire2}>, <@${gameID.dire3}>, <@${gameID.dire4}>, <@${gameID.dire5}>`)
                winschannel.send({ embeds: [embed]})
                message.channel.send(`В матче с ID **${bnm}** победу одерживают **Radiant**`).then(msg => { msg.delete({ timeout: 10000 }) });
            })
    }
    //diretwin
    if (cmd === `${prefix}direwin`) {
        message.delete({ timeout: 5000 })
        let bnm = args.join(" ");
        if (isNaN(bnm)) return message.channel.send(`${message.author.username}, корректная команда: "!direwin 123", где 123 - айди матча`).then(msg => setTimeout(() => msg.delete(), 5000));
        closedota.findOne({ GameID: bnm },
            (err, gameID) => {
                if (err) console.log(err);
                if (!gameID) return message.channel.send(`${message.author.username}, матч с таким айди еще не состоялся`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.Win == 1) return message.channel.send(`${message.author.username}, результаты этого матча уже записаны`).then(msg => setTimeout(() => msg.delete(), 5000));
                if (gameID.HostID !== message.author.id) return message.channel.send(`${message.author.username}, только хост может записать результаты матча`).then(msg => setTimeout(() => msg.delete(), 5000));
                gameID.Win = 1;
                gameID.save().catch(err => console.log(err));
                //удалить комнаты
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.radiantroom).delete()
                }
                if (bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom)) {
                    bot.guilds.cache.get("720143930628505661").channels.cache.get(gameID.direroom).delete()
                }
                //ПОБЕДИТЕЛИ
                //НАГРАДЫ
                let pos1bag = 2
                if (gameID.dire1 == gameID.HostID) pos1bag = 3
                let pos2bag = 2
                if (gameID.dire2 == gameID.HostID) pos2bag = 3
                let pos3bag = 2
                if (gameID.dire3 == gameID.HostID) pos3bag = 3
                let pos4bag = 2
                if (gameID.dire4 == gameID.HostID) pos4bag = 3
                let pos5bag = 3
                if (gameID.dire5 == gameID.HostID) pos5bag = 4
                currency.findOne({ userID: gameID.dire1 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.dire1,
                                bounty: 0,
                                bag: pos1bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos1bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.dire2 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.dire2,
                                bounty: 0,
                                bag: pos2bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos2bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.dire3 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.dire3,
                                bounty: 0,
                                bag: pos3bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos3bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.dire4 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.dire4,
                                bounty: 0,
                                bag: pos4bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos4bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                currency.findOne({ userID: gameID.dire5 },
                    (err, userID) => {
                        if (err) console.log(err);
                        if (!userID) {
                            const newcurrency = new currency({
                                _id: mongoose.Types.ObjectId(),
                                serverID: "720143930628505661",
                                userID: gameID.dire5,
                                bounty: 0,
                                bag: pos5bag,
                                present: 0,
                                rune1: 0,
                                rune2: 0,
                                rune3: 0,
                                new: 0
                            });
                            newcurrency.save().catch(err => console.log(err));
                        } else {
                            userID.bag = userID.bag + pos5bag;
                            userID.save().catch(err => console.log(err));
                        }
                    })
                //клоз лог
                let winschannel = message.guild.channels.cache.find(c => c.name === "close-log")
                let embed = new MessageEmbed()
                    .setAuthor("dark reef", message.guild.iconURL)
                    .setColor(botconfig.colorYes)
                    .addField(`**ID game: ${bnm}**`,

                        `**Победа: Dire**

    **Host: <@${gameID.HostID}>**

    **Победители:** <@${gameID.dire1}>, <@${gameID.dire2}>, <@${gameID.dire3}>, <@${gameID.dire4}>, <@${gameID.dire5}>

    **Проигравшие:** <@${gameID.radiant1}>, <@${gameID.radiant2}>, <@${gameID.radiant3}>, <@${gameID.radiant4}>, <@${gameID.radiant5}>`)
                winschannel.send({ embeds: [embed]})
                message.channel.send(`В матче с ID **${bnm}** победу одерживают **Dire**`).then(msg => { msg.delete({ timeout: 10000 }) });
            })
    }
})

bot.login(botconfig.token);
