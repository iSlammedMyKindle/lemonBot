//Made by iSlammedMyKindle in 2020!
//Routine functions that could be used in more than one file.
const { PermissionsBitField } = require("discord.js");

//If the user that sent the message has the correct permissions, return true
//useOr will cause this to return true if you have at least one permission
function checkPerms(m, permsList = [], useOr = false, printErr = true){
    var endResult = true;
    var permsResults = {
        good:[],
        bad:[]
    }

    if(!permsList.length){
        console.warn('No permissions specified, returning true...');
        return endResult;
    }

    for(var i of permsList)
        permsResults[m.member.permissions.has(PermissionsBitField.Flags[i])?'good':'bad'].push(i);

    // console.log(permsList,permsResults);
    
    if(useOr && !permsResults.good.length || !useOr && permsResults.bad.length)
        endResult = false;
    
    if(!endResult && printErr)
        printPermsErr(m,permsResults);

    return [endResult,permsResults];
}

function printPermsErr(m, permsResults){
    var haveStr = permsResults.good.length? '\nYou have: `'+permsResults.good.join(', ')+'`':'';
    m.reply({content:'Sorry, but it looks like you need more permissions to run this command..'+haveStr+"\nYou need: `"+ permsResults.bad.join(', ')+'`', ephemeral:true});
}

function queryMessages(m, quantity, phraseList, users, channel,doneFunc = ()=>{}){
    var targetChannel = channel || m.channel;
    targetChannel.messages.fetch({limit:quantity}).then(e=>{
        doneFunc(e.filter(msg=> (users.length ? users.indexOf(msg.author) > -1:true) && (phraseList.length? phraseList.map(e=>msg.content.toLowerCase().indexOf(e.toLowerCase()) > -1).indexOf(true) > -1 :true) ));
    },
    err=>doneFunc([],err.message));
}

//Simple polling function to find a target channel based on the string name
//This is stripped down from what it originally was. We're not using 
function queryChannel(m, channelName, printErr = true){
    
    var targetChannel;

    for(var i of m.channel.guild.channels.cache){
        //Voice channel int is 2... yay update XP
        if(i[1].name == channelName && i[1].type == 2){
            targetChannel = i[1];
            break;
        }
    }

    if(!targetChannel){
        if(printErr)
            m.reply({content:'*Error: Couldn\'t find that voice channel :/ ('+channelName+')*', ephemeral:true});
    }
    else return targetChannel;
}

module.exports = {
    checkPerms,
    printPermsErr,
    queryMessages,
    queryChannel
}