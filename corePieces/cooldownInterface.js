//Made by iSlammedMyKindle in 2021!
//An attempt to make general functions not directly related to the command interface separate. I needed these across files so it feels like it would make sense to move them here
const timeTools = require('../lemonModules/timeTools'),
    serverSettings = require('../serverSettings.json');

//Print a message to the user that the limit for the target command was hit. This includes if the command was disabled
function cooldownStrikeErr(cooldownResults,msg,isInteraction){
    if(cooldownResults.blocked && !cooldownResults.triedAgain)
        msg.reply(isInteraction? {content:serverSettings.messages.commandDisabled, ephemeral:true} : serverSettings.messages.commandDisabled);
    //If the user hasn't tried typing the command twice, show this message if cooldown is present
    else if(!cooldownResults.triedAgain){
        let resultStr = serverSettings.messages.cooldownStrike.replaceAll('%s',timeTools.timeToEnglish(timeTools.secondsToTime(cooldownResults.secondsLeft)));
        msg.reply(isInteraction ? {content:resultStr, ephemeral:true} : resultStr);
    }
    //If the user tried again, don't respond back.
}

module.exports = {
    cooldownStrikeErr
}