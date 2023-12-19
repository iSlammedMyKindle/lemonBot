// Made by iSlammedMyKindle in 2022!
// discord.js had an update and it broke a lot of things. One of them being strings to integers for command options... This file is designed to workaround it until it's fixed

const cmdOptionInts = {
    SUBCOMMAND: 1,
    SUBCOMMAND_GROUP: 2,
    STRING: 3,
    INTEGER: 4,
    BOOLEAN: 5,
    USER: 6,
    CHANNEL: 7,
    ROLE: 8,
    MENTIONABLE: 9,
    NUMBER: 10,
    ATTACHMENT: 11
}

module.exports = {
    //Permanently converts option strings to the associated integer
    convertOptionToInt: function(commandsList = []){
        for(var i of commandsList)
            if(typeof i.type != "number") i.type = cmdOptionInts[i.type];
    }
}