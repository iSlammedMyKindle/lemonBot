//Made by iSlammedMyKindle in 2020!
//Holy cow admin tools are getting huge; guess it's time for a dedicated file!

//...aaaaand this code has to be up here because it's dynamic and not static like the other doodads... ORGANIZATION SKILLZ
var usersOptions,
    channelOptions,
    multiVoiceOptions,
    channelOptionTemplate = {name:'channel', description:"A channel for use in the current query", type:"CHANNEL"};
//Setup user count and channel count for all options. Done here in the event it should be expanded.
function setCommandBulk(quantity = 1,templateObject){
    var res = [];
    for(let i = 0;i < quantity; i++){
        let resObj = {};
        for(let j in templateObject){
            if(j == 'name') resObj.name = templateObject.name+(i+1);
            else resObj[j] = templateObject[j];
        }

        res.push(resObj);
    }

    return res;
}

usersOptions = setCommandBulk(5,{name:'user', description:"A user for use in the current query", type:"USER"}),
channelOptions = setCommandBulk(5,channelOptionTemplate);
channelOptions[0].required = true;

//voisplit needs the second channel option to be required so I can't use channelOptions and now I'm annoyed -_-
multiVoiceOptions = setCommandBulk(5,channelOptionTemplate);
multiVoiceOptions[0].required = true;
multiVoiceOptions[1].required = true;

var adminTools = require('./adminTools'),
    mentionTools = require('../corePieces/mentionTools'),
    shuffle = require('../lemonModules/shuffle'),
    timeTools = require('../lemonModules/timeTools'),
    deleteMessages = require('../corePieces/deleteMessages'),
    otherChannels = {name:"other-channels", description:"Insert each channel into quotation marks (e.g \"my aweseome voice channel\" \"fred\")", type:"STRING"};
    userDesc = "User to be queried for the message search",
    channelDesc = "Channel for this command to use",
    slashCommandHelp = [
        ['adminhelp','Find out what admin commands you have permission to use','admin',[]],
        ['del','Remove messages from the channel you called this command from','admin',
            [
                {name:"quantity", description:"Amount of messages to scan through", required:true, type:"INTEGER"},
                {name:"query", description:"Criteria messages should meet in order to be removed (See admin manual for more details)", required:false, type:"STRING"},
                {name:'show-progress-to-channel', description:"Show the channel what things are being removed. By default only you can see this", required:false, type: "BOOLEAN"},
                ...usersOptions
            ]
        ],
        ['move','Takes messages out of this channel and puts them in another of your choice','admin',
            [
                {name:"quantity", description:"Amount of messages to scan through", required:true, type:"INTEGER"},
                {name:"text-channel", description:"Messages will go to this channel", required:true, type:"CHANNEL"},
                {name:"query", description:"Criteria messages should meet in order to be removed (See admin manual for more details)", required:false, type:"STRING"},
                {name:"quiet-move", description:"Only announce the amount of found messasges to you", type:"BOOLEAN"},
                ...usersOptions
            ]
        ],
        ['mute','Mutes entire voice channels (or groups of)','admin', [...channelOptions, otherChannels, {name:"duration", channelsOption: otherChannels, description:"Time to stay muted (default 5m) e.g: :ss mm:ss ss h:m:s", type:"STRING"}] ],
        ['unmute','Un-mutes entire channel(s)', 'admin', [...channelOptions, otherChannels]],
        ['voisplit','Put everyone randomly (but evenly) into different voice channels', 'admin', [...multiVoiceOptions,otherChannels]],
        ['raid','Move an entire voice channel into another channel', 'admin', [{name:"move-everyone-to", description:"Everyone goes into this voice channel channel", required:true, type:"CHANNEL"}, ...channelOptions , otherChannels]]
    ],
    overUsedVars = {
        channelErr:'Specify the channel of choice within quotation marks (e.g "Rylans png fest")',
        channelNotFound:'*Error: Couldn\'t find any channels!*',
        delMoveBigNum:'Sorry dude, Discord will only let me handle up to 100 messages :/',
        delMoveHelp:(title,command)=>`Example usage:
        ${title} the last 5 messages:
        \`${command} 5\`
        
        ${title} messages from @joeSchmoe within a 10 message radius
        \`${command} 10 @joeSchmoe\`
        
        ${title} messages from multiple people within a 50 message radius, as long as they said "pog"
        \`${command} @joe @caleb "pog" 50\``,
        voicePermissions:m=>m.reply("Sorry, In order to do voice channel commands I need the following permissions: Mute Members, Move Members"),
        commandSymbol:undefined
    };

//Timers that are ticking when somebody runs the /muteall command. They are here to manually unmute everyone.
var voiceStates = {};

//Text channel types are now integers for some reason
const validTextChannelTypes = [
    0, //text
    2, //voice
    5, //announcement/news
    10, //announcement/news thread
    11, //public thread ( +forums)
    12, //private thread
];

//This really should be in another file somewhere :P
//Anyway, this fella takes in a message, and based on items in quotation marks "channel name" finds all channels with that content.
function findChannelMacro(m,str = ""){
    var results = [];
    if(!str.length) return results;
    //run through the parse dance
    var channelNames = mentionTools.quoteParser(str);
    if(!channelNames.length) {
        m.channel.send('<@'+m.user.id+'>, '+overUsedVars.channelErr);
        return results;
    }
    
    //next, poll through all voice channel names; the first result get's muted
    for(var i of channelNames){
        var item = adminTools.queryChannel(m,i);
        if(item) results.push(item);
    }

    if(!results.length){
        m.channel.send('<@'+m.user.id+'>, '+overUsedVars.channelNotFound);
        return results;
    }

    return results;
}

//This is being used frequently in all voice channel based commands, so it's going here.
var slashCmdVoiceChannelFind = (m,avoidNames = [])=>[...m.options.data.filter(e=>e.channel?.type && avoidNames.indexOf(e.channel?.name) == -1).map(e=>e.channel),...findChannelMacro(m, m.options.getString('other-channels') || '')];

function drawChannelProgress(progressObj){
    let currProgressStr = '';
    for(var i in progressObj){
        currProgressStr+=(currProgressStr?'\n':'') + '<#'+i+'> - '+(progressObj[i].done?'☑️':
        progressObj[i].error?'⚠️\n```'+progressObj[i].error+'```':
        '⚙️');
    }

    return currProgressStr;
}

//All permissions required by lemonbot, when this file executes, there will be a reverse map to speed searches up
/* After this quick function runs, the object should look something like this:
{
    perm1:["MUTE_MEMBERS","MANAGE_MESSAGES"],
    perm2["MOVE_MEMBERS","SOME_OTHER_RANDOM_PERMISSION"]
}

It's designed to hold multiple permissions so admin command can be as complex as we want.
Wouldn't normally build something this way, but it's only used once sooo
*/
var permissionsMap = (permsObj=>{
    var result = {};
    for(var i in permsObj){
        for(var j of permsObj[i]){
            //If the command doesn't exist, create it
            if(!result[j])
                result[j] = [];

            //Add permissions to this command if they aren't here yet
            if(!result[j].length || result[j].indexOf(i) == -1)
                result[j].push(i);
        }
    }
    return result;
})({
    "MuteMembers":['mute','unmute'],
    "MoveMembers":['raid','voisplit'],
    "ManageMessages":['del','move']
});

//list of every permission:
var allPermissions = [];
for(var i in permissionsMap)
    for(var j of permissionsMap[i])
        if(allPermissions.indexOf(j) == -1) allPermissions.push(j);

//See commands.js & cooldown.js for more information
const cooldowns = {
    //This is to discourage spamming the admin error message
    'adminGroup':{
        isGroup:true,
        glue:true,
        coolTime:60*60,
        uses:2,
        commands:['adminhelp','del','move','mute','unmute','voisplit','raid']
    },
},
    spaceCooldowns = {
        'delMove':{
            isGroup:true,
            glue:true,
            coolTime:60*10,
            uses:40,
            commands: ['del','move']
        },
        'voice':{
            isGroup:true,
            glue:true,
            coolTime:60*2,
            uses:10,
            commands: ['mute','unmute','voisplit','raid']
        },
        'adminhelp':{
            coolTime:60,
            uses:2 
        }
    }

const disabledDMCommands = cooldowns.adminGroup.commands;

//By far admin commands have been the most demanding to maintain. They are the main reason this style of execution check was invented. As a result the checks are pretty big.
var commandChecks = {
    commandCanRun:(m,cmd,guildId)=>{
        /*Admin commands are special - They do not get recorded for cooldown unless somebody doesn't have correct permissions
        If one is found to not have correct permissions, an error will show up instead of launching the command*/
        var res = {
            runAdminCommand: false,
            adminCommand: false,
            permsResults:undefined,
            execute:false,
            spaceCooldown:false,
            dm:false,
            adminHelp:false
        }

        if(guildId!='dm'){
            //adminhelp is considered a regular command that checks permissions individually instead of from the get-go, admin checks will skip here in that scenario.
            res.adminCommand = true;
            if(cmd == 'adminhelp'){
                //Check if any commands are applicable; otherwise trigger the cooldown
                res.adminHelp = true;
                if(adminTools.checkPerms(m,allPermissions,true,false)[0]){
                    res.runAdminCommand = true;
                }
            }
            else if((res.permsResults = adminTools.checkPerms(m,permissionsMap[cmd],false,false))[0])
                res.runAdminCommand = true;
        }
        else res.dm = true;

        //Swapping to the "space" group will help bypass the non-admin cooldown config.
        res.execute = res.runAdminCommand || res.adminHelp;
        //If the user is just getting help, it can run but without the admin cooldown
        res.spaceCooldown = res.adminHelp && !res.runAdminCommand ? false : res.execute;

        return res;
    },
    showCoolStrikeError:(runCommandCheck,cooldownResults)=>(cooldownResults && (cooldownResults.blocked || cooldownResults.cooldownHit) && !cooldownResults.triedAgain),

    postCooldownUpdate:(msg,runCommandCheck,cooldownResults)=>{
        if(!runCommandCheck.dm  && !runCommandCheck.adminHelp && !runCommandCheck.runAdminCommand && !cooldownResults.cooldownHit)
            adminTools.printPermsErr(msg,runCommandCheck.permsResults[1]);
    }
}

/**Function is reserved for !del**, to allow for proper functionality to work, the function needs to be async, but the ability to
 * record cooldown is messed up because a promise is returned on async functions.
 *  For cooldown to be recorded immediately, it must be synchronous.
 * ...for the record this sortof stinks organization wise -_-
*/
let del_asyncProcesses = async (m, channelList, phraseList, currNum, users, dontDisplayProgress)=>{
    await m.reply(deleteMessages()).then(()=>m.deleteReply());

    if(channelList.length == 1) adminTools.queryMessages(m,currNum,phraseList,users,channelList[0],messages=>{
        channelList[0].bulkDelete(messages).then(undefined,function(e){
            m.reply({content:'Ow... looks like I hit an error >.< The overlords just told me this: ```\n'+e.message+'```', ephemeral: dontDisplayProgress});
            // console.error([e]);
        });
    });

    else{
        //Display a progress message if applicable:
        let channelProgress = {};
        //I don't know why, but somehow "var" leaks the variable somehow when we start quering messages. keep both of the channels as "let"!
        for(let channel of channelList)
            channelProgress[channel.id] = {done:false,error:undefined};

        let delMsg = m.user.username + ' ran the delete command:\n';
        let progressMsg = dontDisplayProgress ? undefined : await m.channel.send(delMsg+drawChannelProgress(channelProgress));
        //Display the new message
        for(let channel of channelList){
            let channelOfOrigin = dontDisplayProgress ? 0: channel == m.channel;
            //Change the deletion number if it hits 100 and we are printing the progress message
            var delTotal = currNum + (channelOfOrigin*1);
            if(delTotal > 100) delTotal = 100;

            adminTools.queryMessages(m,delTotal,phraseList,users,channel,(messages,err)=>{
                //If we hit this, there was a problem searching for messages from the channel before we can even start deleting
                if(err){
                    channelProgress[channel.id].error = err;
                    progressMsg?.edit(delMsg+drawChannelProgress(channelProgress));
                    return;
                }

                //there's a cache bug happening in discord.js right now, but we can compare messages through IDs
                if(channelOfOrigin) messages = messages.filter(e=>e.id!=progressMsg.id);
                channel.bulkDelete(messages).then(()=>{
                    //We successfully deleted things! Time to display that:
                    if(channelProgress[channel.id].error) return;
                    channelProgress[channel.id].done = true;
                    progressMsg?.edit(delMsg+drawChannelProgress(channelProgress));
                },
                e=>{
                    //In this case lemonbot hurt himself and we need to explain why
                    channelProgress[channel.id].error = e;
                    progressMsg?.edit(delMsg+drawChannelProgress(channelProgress));
                });
            });
        }
    }
}

var commands = {
    'adminhelp':m=>{
        //This command is special as it checks for every permission in order to compile a help list relavent to whoever ran it.
        var resultStr = 'These commands have a bigger cooldown limit that affects *you*, not the server... **Use responsibly!** (Check the admin manual for more details)\n';
        var noPermissions = true;
        for(var i of slashCommandHelp){
            if(adminTools.checkPerms(m,permissionsMap[i[0]],false,false)[0]){
                resultStr+='\n`'+overUsedVars.commandSymbol+i[0]+'` - '+i[1];
                if(noPermissions) noPermissions = false;
            }
        }
        if(noPermissions)
            m.reply({content:'Sorry, it looks like there aren\'t any admin commands that can be run. Contact the local admin to get some perms!', ephemeral:true});
        else m.reply({content:resultStr, ephemeral:true});
    },
    'del':m=>{
        //Go through the messasge to see if there was a specified phrase to look for
        //Channels that won't work for any reason (doesn't exist in the server or being a non-text channel) will be inserted here. (can either be object or ID)
        var query = m.options.getString('query');
        var dontDisplayProgress = !m.options.getBoolean('show-progress-to-channel'),
            selectAllChannels = query?.split(' ').indexOf('*') > -1,
            currNum = m.options.getInteger('quantity'),
            //For users, the data.type here is 6 - the filter though is just going to check if a "user" variable exists, which is simpler, but confusing since the map is also doing that.
            users = m.options.data.filter(e=>e.user).map(e=>e.user);

        var phraseList = query ? (!selectAllChannels && query.indexOf('"') == -1 ? [query] : mentionTools.quoteParser(query) ): [];

        //We also want to see if the task should be performed in a specific set of channels. If there are none, we can just assume it should be done here
        var channelList = (selectAllChannels? 
            [...m.channel.guild.channels.cache.keys()]:
            mentionTools.channelParser(query || '')).map(e=>{
            var target = m.channel.guild.channels.cache.get(e);
            if(target && validTextChannelTypes.indexOf(target.type) > -1){
                return target;
            }
        }).filter(e=>e); //The function expects a conditional, so undefined is removed from this list.
        
        if(!channelList.length) channelList = [m.channel];
        
        if(currNum > 100){
            m.reply({content: overUsedVars.delMoveBigNum, ephemeral:true});
            return
        }
        
        //The gloriously disorganized async function
        del_asyncProcesses(m, channelList, phraseList, currNum, users, dontDisplayProgress);

        //The cooldown use incrases based on how many channels are being managed
        return { usageAppend:0 - (channelList.length -1) };
    },
    'move':(m)=>{
        var currNum = m.options.getInteger('quantity');

        if(currNum > 100){
            m.reply({content:overUsedVars.delMoveBigNum, ephemeral:true});
            return;
        }

        //Go through the messasge to see if there was a specified phrase to look for
        var query = m.options.getString('query') || '';
        var phraseList = query.indexOf('"') == -1 ? [query] : mentionTools.quoteParser(query),
            channelObj = m.options.getChannel('text-channel'),
            users = m.options.data.filter(e=>e.user).map(e=>e.user);

        if(validTextChannelTypes.indexOf(channelObj.type) == -1){
            m.reply({content:'**Error: <#'+channelObj.id+'> not a valid channel!**', ephemeral:true});
            return;
        }

        adminTools.queryMessages(m,currNum,phraseList,users,null,messages=>{
            m.reply({content:"Roger! "+messages.size+" found messages will move to <#"+channelObj.id+'>...', ephemeral:m.options.getBoolean('quiet-move')});
            //Copy all messages
            let finalText = messages.map(e=>{
                var attachments = [];
                for(var i of e.attachments){
                    attachments.push(i[1].attachment);
                }

                return '<@'+e.author.id+'> '+(attachments.length?attachments.join('\n')+'\n':'')+e.content;
            }).reverse();
            for(let i of finalText){
                var messagePieces = [''];
                if(i.length > 2000){
                    for(var j = 0; j < i.length;j++){
                        messagePieces[messagePieces.length-1] += i[j];
                        if(messagePieces[messagePieces.length-1].length == 2000)
                            messagePieces.push('');
                    }
                }
                else messagePieces[0] = i;
                for(let j of messagePieces)
                    channelObj.send(j).then(function(){
                        //Delete everything if this is the very last item to be moved around [edit - holy cow this is jank XP]
                        //This is because when an attachment only used once, it is deleted if nothing else needs it. In this way it's a swap of hand from the old message to the new.
                        if(i == finalText[finalText.length-1] && j == messagePieces[messagePieces.length-1])
                            m.channel.bulkDelete(messages);
                    });
            }
        });
    },
    'mute':m=>{
        //First find the voice channel in the args, it should be in quotes
        let muteLimit = 5000*60, //5 minutes
            channels = slashCmdVoiceChannelFind(m);
    
        if(!channels.length){
            m.reply({content:'No *voice* channels found... (other channel types do not work)', ephemeral:true});
            return;
        }
        
        /*It's possible to mute multiple channels at once, un-muting however has been a huge pain when trying to async different instances.
        Literally the only way I can think of being able to unmute everybody at once is through the same timeout. If we cancel one through code we cancel
        the others however... WAIT A MINUTE
        
        Ok, new plan: only cut off the timeout if only 1 channel has the same timeout! That way, 1 timeout for multiple channels is still possible! (edit: IT FREAKEN WORKS)*/

        //Grab the time option and figure out if it's a timestamp:
        var timeArg = m.options.getString('duration');
        if(timeArg){
            if(!isNaN(timeArg)) muteLimit = timeArg*1000*60;
    
            else {
                //If we find a timestamp, replace the number with the last mentioned timestamp
                var timeStampArr = timeTools.strToTimeObjs(timeArg);
                if(timeStampArr.length)
                    muteLimit = timeTools.timeToSeconds(timeStampArr[0]) * 1000;
            }
        }
        
        //The total is in an object to use js' reference abilities
        var channelTotalObj = {total:channels.length};
        var universalTimeout = setTimeout(()=>commands.unmute(channels),muteLimit);
        //Mute Everyone and set a time limit:
        //set an address based on channel id
        for(var targetChannel of channels){
            voiceStates[targetChannel.id] = [0,targetChannel,channelTotalObj];
            for(var i of targetChannel.members){
                i[1].voice.setMute(true).then(undefined,()=>overUsedVars.voicePermissions(m));
            }
            //Theoretically we could group all of these into one timeout, that would be cool
            voiceStates[targetChannel.id][0] = universalTimeout;
        }

        //Grab timeStampArr from the if statement
        m.reply({content:"Successfully queued "+(channels.length > 1 ? channels.length + " channels" : '<#'+channels[0].id+'>')+" to be muted for " + timeTools.timeToEnglish(timeTools.secondsToTime(muteLimit / 1000)), ephemeral:true});
    },
    'unmute':m=>{
        /*This command is special, it can either take a message object or an array of channel objects
        It wouldn't make sense to check for admin upon accepting channel objects so this is avoided*/
        //m can be two things, a message or a channel depending on how it was invoked.
        let channels;
        if(!m.options) channels = m;
        else channels = slashCmdVoiceChannelFind(m);
        
        if(!channels.length){
            //This is obviously not intended for if this was called from /mute... if somehow it does, let me know so we can go crazy together 0_o
            m.reply({content:'No *voice* channels found... (other channel types do not work)', ephemeral:true});
            return;
        }

        for(let targetChannel of channels){
            //Unmute everybody
            for(var i of targetChannel.members){
                i[1].voice.setMute(false).then(undefined,()=>overUsedVars.voicePermissions(m));
            }
            
            if(voiceStates[targetChannel.id]){
                //Only clear the timeout if there are no other channels tied
                //Main concern isn't if everything in a group is subtracted, rather it's if an admin manually invokes an unmute for individual channels
                voiceStates[targetChannel.id][2].total--;

                if(!voiceStates[targetChannel.id][2].total)
                    clearTimeout(voiceStates[targetChannel.id][0]);
                delete voiceStates[targetChannel.id];
            }
        }

        if(m.options) m.reply({content:"Successfully queued "+(channels.length > 1 ? channels.length + " channels" : '<#'+channels[0].id+'>')+" to be unmuted", ephemeral:true});
    },
    'voisplit':m=>{
        //Grab all requested channels
        var channels = slashCmdVoiceChannelFind(m);

        if(channels.length < 2){
            m.reply({content:'You need at least 2 **voice** channels to use this command!', ephemeral:true});
            return;
        }

        //All members will be from the first channel
        var members = shuffle([...channels[0].members].map(e=>e[1]));
        channels = shuffle(channels);

        m.reply({content:'Splitting everyone up into '+ channels.length + ' voice channels now!', ephemeral:true});
        var reasonStr = 'Lemonbot moved you!';
        //Evenly disperse everyone in the first channel to groups
        if(members.length > channels.length){
            var split = Math.floor(members.length / channels.length);

            for(var i = 0; i < channels.length;i++){
                for(var j = 0; j < split; j++ ){
                    //member joins
                    members[members.length-1].voice.setChannel(channels[i],reasonStr).then(undefined,()=>overUsedVars.voicePermissions(m));
                    members.pop();
                }
            }
        }
        else{
            //Just put members in random rooms
            for(var i = 0; members.length; i++){
                members[members.length-1].voice.setChannel(channels[i],reasonStr).then(undefined,()=>overUsedVars.voicePermissions(m));
                members.pop();
            }
        }
    },

    'raid':m=>{
        //Grab all requested channels
        var destChannel = m.options.getChannel('move-everyone-to');
        var channels = slashCmdVoiceChannelFind(m, destChannel.name);

        if(!channels.length){
            m.reply({content:'All of your channels must be **voice** channels!', ephemeral:true});
            return;
        }

        //Everyone will be headed to one channel, a.k.a the final one specified
        var members = [];
        //Go through each channel to find respective member
        for(var i of channels)
            members.push(...[...i.members].map(e=>e[1]));

        m.reply({content:'Moving everyone into <#'+destChannel.id+'>!', ephemeral:true});
        // console.log(members);
        var insertedMembers = [];
        for(var i of members){
            if(insertedMembers.indexOf(i) == -1){
                i.voice.setChannel(destChannel,'Lemonbot raid!').then(undefined,()=>overUsedVars.voicePermissions(m));
                insertedMembers.push(i);
            }
        }
    }
}

module.exports = {
    commands,
    commandChecks,
    cooldowns,
    spaceCooldowns,
    slashCommandHelp,
    disabledDMCommands,
    intents:['GuildMessages','GuildVoiceStates'],
    setCommandSymbol:(e)=>overUsedVars.commandSymbol = e
};