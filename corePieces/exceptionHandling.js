// Made by iSlammedMyKindle in 2021!
// This file was made so lemonbot doesn't crash for everyone when an error occurrs. It's here in order to have a universal message for errors
const {messages} = require('../serverSettings.json');

module.exports = {
    sendGeneralException: function(ex, msg, actualCommand = "???"){
        var resContent = {content:messages.generalException.replaceAll('%s', ex.message), ephemeral:true};
        console.error(new Date(),(msg.author?.username || msg.user.username)+" tried running "+ actualCommand + ", which crashed with this exception:", ex);
        msg.reply(resContent).then(undefined,()=>{
            //Discord failed to reply to the message for some reason, let's send a discord message instead
            msg.channel.send(resContent).then(undefined,error=>console.error("Couldn't send the exception!!", error));
        });
    },
    sendPreCommandException: function(ex,msg,actualCommand = "???"){
        var resContent = {content:messages.commandProcessException.replaceAll('%s', ex.message), ephemeral:true}
        console.error(new Date(),actualCommand + " failed to process before " + (msg.author?.username || msg.user.username) + " could even use it :/", ex);
        msg.reply(resContent).then(undefined,()=>{
            //Discord failed to reply to the message for some reason, let's send a discord message instead
            msg.channel.send(resContent).then(undefined,error=>console.error("Couldn't send the exception!!", error));
        });
    }
}
