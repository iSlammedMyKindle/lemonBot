//Made by iSlammedMyKindle during 1 day of 2020 and the rest of 2021 probably XP
//This file is the middle man for controlling states; things like the @mention listener lives here along with the list of active states.
//Cleanups every 5 minutes also happen as well.
const stateManager = require('./stateManager'),
    fileCore = require('./fileCore'), //Statefull commands get imported here!
    exceptionHandling = require('../corePieces/exceptionHandling'),
    //Every state regardless of guild
    activeStates = {},
    guildList = {},
    disabledDMCommands = ['join','leave'],
    cooldowns = {
        'join':{
            coolTime:60,
            uses:3
        },
        'leave':{
            coolTime:60,
            uses:6
        },
        'sessions':{
            coolTime:30,
            uses:2
        },
    },
    commonVars = {
        cantJoin:'Sorry, the command blocked you from joining. Reason: ',
        cantLeave:'Sorry, the command blocked you from leaving. Reason: ',
        stateNotFound: ["Sorry, I couldn't find anything for you to join :/","\nTry again with different information or start something new!"],
        client:undefined,
        symbol:undefined, //The symbol for the target command
        cooldownGroup:undefined //Imported from lemon.js in order to prevent command abuse. Stateful commands have allot more moving parts so this is important :P
    },
    coolInf = require('../corePieces/cooldownInterface');


//I need to move this command somewhere else, but it's here because I'm panniking yay
//grabs the guildId of the message being used. If none exists, then use "dm" (direct message)
var guildIdOfMessage = msg=>msg.guild?.id || 'dm';

//Is the user doing anything in the target guild?
var isTheUserDoingAnything = (userId, guildId) => guildList[guildId]?.users[userId] && Object.keys(guildList[guildId].users[userId].passcodes).length

//Wow I literally have no comments in this function... LET'S FIX THAT
//What it says on the tin, find a state with all information provided. If a passcode is provided, it gives us more context and is more clear than just a username
function findState(m,pass,cmd,userId){
    
    if(!userId) userId = m.user?.id;

    //Search through the guild object and try to find the state based on userId
    var targetUser = findUser(m,userId);
    if(!pass && targetUser){
        if(targetUser.activeCommands[cmd]){
            //A user and command together can help bring a specific context.
            var ctx = targetUser.activeCommands[cmd].currContext;
            if(!ctx)
                return { notFoundReason: 'This user isn\'t running '+commonVars.symbol+cmd+'!' }
            else return { state:ctx, foundByPass:false };
        }
        else if(targetUser.currContext)
            return { state:targetUser.currContext, foundByPass:false };
        else return { notFoundReason: 'This user hasn\'t started an activity :/' };
    }
    else if(pass){
        //Very direct method of finding the state. If we have a target user, check that first, but otherwise go into this file's activeStates object.
        if(targetUser && cmd){
            var reason = 'User mentioned isn\'t hosting the specified passcode for '+commonVars.symbol+cmd+'!';
            if(!targetUser.activeCommands[cmd])
                return {notFoundReason:reason}
            var targetState = targetUser.activeCommands[cmd].states[pass];
            if(!targetState)
                return { notFoundReason:reason}
            else return { state:targetState, foundByPass:true }
        }
        //Not sure when this would actually hit since passcodes are checked before hitting this function. It's here anyway.
        else if(!activeStates[pass])
            return { notFoundReason: 'Invalid code!'}
        else return { state: activeStates[pass], foundByPass:true };
    }
    else return { notFoundReason: 'Session could not be found with the given context' }
}

//hot garbage function for finding users in a guild
function findUser(m,userId){
    var guild = guildList[guildIdOfMessage(m)];

    if(!guild || !guild.users[userId]) return
    //Two possible outcomes here, if no command was specified, try to join the latest activity, otherwise fail
    else return guild.users[userId];
}

//Because lemon.js is forced to ignite any new command, we don't need to ever create a cooldown group in this file! If you are importing this file to a different bot however, please keep this in mind.
//m is a discord message.
var cooldownExists = m=>commonVars.cooldownGroup && commonVars.cooldownGroup[guildIdOfMessage(m)],
//Checks if cooldown exists, then applies cooldown to the designated command. If it passes cooldown, it returns true.
    passedCooldown = (cmd,m)=>{
        if(!cooldownExists(m)) return;
        var coolResults = commonVars.cooldownGroup[guildIdOfMessage(m)].updateUsage(cmd, m.user.id, m.createdTimestamp);
        if(!coolResults || !coolResults.cooldownHit) return true;
        else if(coolResults && coolResults.cooldownHit) coolInf.cooldownStrikeErr(coolResults,m); //undefined for false
    }

/*Do stuff before interacting with the command; AKA: preStateExecution
If for example the target state is expired, we purge it out of existence*/
function interactWithCommand(state, m, args){
    if(state.expires != -1 && m.createdTimestamp - (state.expires * 1000) > state.timestamp){
        //End the sesion and clean up:
        state.onEnd(state.stateData, m, 'sessionExpired');
        purgeState(state);
        return;
    }

    //A "checkOnly" argument was added to cooldown functionality just to see the status of the command cooldown without affecting the numbers themselves
    //As a result it will be run twice, once to view the status here, and another next time in order to update usage.
    if(cooldownExists(m)){
        var cooldownInspect = commonVars.cooldownGroup[guildIdOfMessage(m)].updateUsage(state.cmd, m['user'].id, m.createdTimestamp,true);
        if(cooldownInspect.cooldownHit || cooldownInspect.blocked){
            coolInf.cooldownStrikeErr(cooldownInspect,m);
            return; //A true boolean over here means we cannot continue running the command.
        }
    }
    else return;

    //Ignite the command!
    var targetUser = state.members[m.user?.id];
    state.timestamp = m.createdTimestamp;

    try{
        var returnObj = state.onFind(state.stateData, targetUser, m, args);
    }
    catch(e){
        exceptionHandling.sendGeneralException(e,m,state.cmd);
    }

    //Cooldown! U ain't escaping it m8 >:)
    if(cooldownExists(m) && returnObj && returnObj.cooldownHit)
        commonVars.cooldownGroup[guildIdOfMessage(m)].updateUsage(state.cmd,m['user'].id, m.createdTimestamp);

    //If the command wants to do anything else (specifically purging itself for now), do the thing
    if(returnObj && returnObj.endAll)
        purgeState(state);

}

/*This is designed for any stateful command, plus /join.
The purpose of this is to find all the information needed for findState() but all information is gathered through the message object and the items within the string.
Returns an array, the first being the state, and the second: filtered arguments without mentions*/
function findStateByContextClues(m, cmd){
    //If this is a slash command, emulate a legacy command with blank arguments
    var args = m.options.getString('input')?.split(' ') || [];

    //If we have slash commands, this is easier by a longshot:
    var potentialPass = m.options.getString('passcode'),
        firstMention = m.options.getUser('host')?.id;

    //We should at least check if the first parameter is a valid passcode. If not, make it undefined so as not to confuse findState()
    if(!activeStates[potentialPass])
        potentialPass = undefined;
    
    //Obtain state
    var resultState = findState(m, potentialPass, cmd, firstMention);

    return [resultState.state,args,resultState.notFoundReason];
}

//Joins a state. If it's not possible to join, the command from that state will tell the reason behind it.
function joinState(m,state,args){
    var targetUser = m.user;
    //Hello dear stranger! Let's see if you can come in...
    if(state.members[targetUser.id]){
        m.reply({content:commonVars.cantJoin+targetUser.username+'#'+targetUser.discriminator+' already joined.', ephemeral:true});
        return;
    }

    var joinCheck = state.joinCheck(state.stateData,m);
    if(joinCheck.joinable){
        guildList[guildIdOfMessage(m)].joinSession(targetUser.id,state);
        interactWithCommand(state,m,args);
    }
    else m.reply({content:commonVars.cantJoin+joinCheck.reason, ephemeral:true});
}

//Copied-pasted joinState to make an opposite function. leaveState is also capable of dismantling a state and removing it across everyone's radar.
function leaveState(m, state){
    //Hello dear stranger! Let's see if you can come in...
    var targetUser = m.user.id;
    if(!state.members[targetUser]){
        m.reply({content:commonVars.cantLeave+"You aren't in the session!", ephemeral:true});
        return;
    }

    var leaveCheck = state.leaveCheck(state.stateData,m);
    //Delete state here doesn't mean it's remove for everyone, just for the individual who called it.
    //To end it for everyone, the leaveCheck value above must have "endAll" == true.
    if(leaveCheck.leavable && !leaveCheck.endAll)
        state.members[targetUser].deleteState(state);
    else if(leaveCheck.endAll){
        purgeState(state);
    }
    else m.reply({content:commonVars.cantLeave+leaveCheck.reason, ephemeral:true});
}

//Create a black hole and remove everything about this state object
function purgeState(targetState){
    //As far as I know these steps can be done in any order

    //Remove from active states
    delete activeStates[targetState.pass];
    //Every member needs this de-referenced and a new context in it's place
    for(var i in targetState.members)
        targetState.members[i].deleteState(targetState);
}

/* Does the following:
based on the message, find the state based on specific state details
If the member has already joined the state, switch contexts and perform the next state action
Otherwise, join the state
This is here because more than one function does the same thing.*/
function handleStateContext(m,cmd){
    //Array Destructuring: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
    var [targetState, args, notFoundReason] = findStateByContextClues(m, cmd);
    if(notFoundReason) return notFoundReason;

    var targetUser = targetState.members[m.user?.id];
    //We have a state now! It's time to understand what we wanna do with this
    if(targetUser){
        //Switch context
        //@lemonbot doesn't usually get command context, so we're using targetState.cmd instead of cmd here.
        stateManager.setStateContext(targetUser.activeCommands[targetState.cmd],targetUser,targetState);
        //onFind will allow us to record what's happening to the base of whatever command we're sending this to
        interactWithCommand(targetState, m, args);
    }
    else joinState(m, targetState, args);

    return true;
}

//Creates a fresh state. If the guild hasn't done anything since the last lemonbot execution, then reload the base guild object
/*configObj consists of various items that help create said session. They do not touch this interface, but intstead have items that
stateManager and stateCommandInterface can use to trigger things without the original item needing to do extra work.

cmd: Name of the command that will run
host (m.user.id): User ID, if this id isn't in the guild object yet, it's created within stateManager.
timestamp (m.createdTimeStamp): the time the message was sent
expires: time in seconds before this command is done
onFind: whenever the command is triggered, this is the function that is run to determine what to do next on the command side (your code)
joinCheck: function that says weather or not a member can join the state. Here to provide dynamics. The only thing that is automaticallly rejected is if a member already joined a state.*/
function createState(m, configObj, args){
    //First off; create a passcode, if somehow out of the billions of combinations this passcode is already used, make another one.
    var newPass = stateManager.passcode();
    var attempts = 0;

    //Even though it's extremely unlikely; this is here for safety so lemonbot doesn't hang
    while(activeStates[newPass]){
        newPass = stateManager.passcode();
        if(attempts > 100){
            m.reply(`Ok so get this, somehow the stars aligned and despite making a new passcode 100 times, a new session couldn't be made!
            Since the odds are about one in 1.5 billion, there's a good chance this is a bug, 
            or the stars really did align; either way please let the developer know by making an issue at https://github.com/iSlammedMyKindle/lemonBot and he will be surely left in awe.`);
            break;
        }
        else attempts++;
    }
    if(attempts > 100) return;

    //Thankfully the stars didn't align, let's continue
    /*Creating a new pass base is not being done within stateManager because I want this to be an open method of interpreting sessions.
    In my configuration the goal was to have a mix of either accessing sessions only in one guild, or making it open to transferring sessions to multiple guilds.
    Somebody else could easily make this so it's even restricted to certain users; For example, people with discord nitro and non-nitro.
    In my case I'm not using that logic on this layer, so I've left it open to a mixed scope to confirm the logic on the app layer and not the stateful layer.*/
    var currGuild = guildList[guildIdOfMessage(m)];
    if(!currGuild)
        currGuild = guildList[guildIdOfMessage(m)] = new stateManager.passBase();
    var state = currGuild.createSession(m.user.id, configObj.cmd, newPass,m.createdTimestamp, configObj.expires);

    //Listener check - go through every possible listener and add it to the state accordingly:
    for(var i of ['onFind','joinCheck','leaveCheck','onEnd'])
        if(configObj[i]) state[i] = configObj[i];

    //Assign the state to the active states object
    activeStates[newPass] = state;

    //Create is a reserved keyword, when used, the person making the command doesn't need this, so it's removed
    //args is purely for interacations, so it assumes that we have everything already and the "create" keyword wasn't just tossed into the string.
    var argsArr = args?.split(' ');

    //The host has created a state, time for them to join!
    interactWithCommand(state, m, argsArr);
}

//This will be filled up based on a separate file in order to keep things clean. The only two vital are /join and /leave which will be defined here
var commands = {
    /*Primary purpose is to attempt a join regardless if the member joined already.
    It's a design choice to give assesrtion to the user they have joined a state.
    "/join" is filtered out in findStateByContextClues*/
    'join':(m,argArr)=>{
        var [targetState, args, notFoundReason] = findStateByContextClues(m,undefined);
        if(typeof notFoundReason == 'string' && passedCooldown('join',m)) m.reply({content:commonVars.stateNotFound[0]+(notFoundReason.length?'\nReason: ' + notFoundReason:'' )+commonVars.stateNotFound[1], ephemeral:true});
        else joinState(m, targetState, args);
    },
    //Like the respective function, it's copy paste of the join command :P
    'leave':(m,argsArr)=>{
        var [targetState, args, notFoundReason] = findStateByContextClues(m,undefined);
        if(typeof notFoundReason == 'string' && passedCooldown('leave',m)) m.reply({content:"Hmm... I couldn't find a session for you;\nReason: "+notFoundReason+"\nTry to describe one that you are already in!", ephemeral:true});
        else leaveState(m,targetState);
    },
    'sessions':m=>{
        var targetUser = m.options.getUser('user')?.value || m.user.id;
        if(isTheUserDoingAnything(targetUser, m.guild.id)){
            var resultStr = '<@'+targetUser+'> is currently doing the following things:\n';
            var passcodes = guildList[m.guild.id].users[targetUser].passcodes
            for(var i in passcodes)
                resultStr+='\n **'+commonVars.symbol+passcodes[i].cmd+'** `'+i+'`';

            resultStr+='\n*tip: make more than one of the same session by adding `create` (e.g `'+commonVars.symbol+passcodes[Object.keys(passcodes)[0]].cmd+' create`)*';
            m.reply({content:resultStr, ephemeral:true});
        }
        else m.reply({content:'<@'+targetUser+'> isn\'t doing anything at the moment :/', ephemeral:true});
    },
    'switch':m=>{
        if(!m.options.data.length){
            m.reply({content:"Didn't get any hints! To use this command, give me one or some of these options: `host`, `command`, `passcode`", ephemeral:true});
            return;
        }

        else if(!isTheUserDoingAnything(m.user.id, m.guild.id)){
            m.reply({content:'Huh, looks like you aren\'t doing anything at the moment... 🤔\nTry launching two or more of these at once to use this command: `'+
            Object.keys(fileCore).join('`, `') +'`', ephemeral:true});
            return;
        }

        //Since we made it past those checks, let's proceed:
        var resultState;

        //The fastest (and probably least used) method for finding the context is passcode
        var pass = m.options.getString('passcode');
        if(pass){
            resultState = guildList[m.guild.id].users[m.user.id]?.passcodes[pass];
            if(!resultState){
                m.reply({content:"You're not in a session with this passcode! (`"+pass+"`) Try to launch or join to that item first before using this command.", ephemeral:true});
                return;
            }
        }

        /*Assuming we don't have a passcode, let's move on:
        Followed by passcode is command name. If we have username here too, that will be also be accounted for.*/
        var targetUser = guildList[m.guild.id].users[m.user.id],
            commandName = m.options.getString('command'),
            host = m.options.getUser('host');
        
        if(commandName){
            if(!targetUser.activeCommands[commandName]){
                m.reply({content:"Sorry, I couldn't find a session you were in with `"+commandName+"` as the command name... try with a different name or just by starting something up!", ephemeral:true});
                return;
            }
            
            //Now we assume there is something there; weather or not the host matches our query is another question
            if(host){
                let result = Object.values(targetUser.activeCommands[commandName].states).filter(e=>e.host.userId == host);
                if(result.length) resultState = result[result.length-1]; //Most recent item that host is doing
                else{
                    m.reply({content:"<@"+host+"> Doesn't seem to be in a `"+commandName+"` session right now... try refining your search!", ephemeral:true});
                    return;
                }
            }

            //If we don't have a host though we're basically good to get the most recent context of this command.
            resultState = targetUser.activeCommands[commandName].currContext;
        }

        //And the slowest will be user search (probably the most used), as we're basically for-looping through the user's sessions
        if(!resultState && host){
            //roughly the same query as last time, but for general user states instead of a specific command
            let result = Object.values(targetUser.passcodes).filter(e=>e.host.userId == host);
            if(result.length) resultState = result[result.length - 1];
            else{
                m.reply({content:"You aren't doing anything with <@"+host+"> right now... try starting something to use this command!", ephemeral:true});
                return;
            }
        }
        //It should be impossible to get to this point without *not* having the state. If somehow this isn't true, I probably broke something :(
        stateManager.setStateContext(targetUser.activeCommands[resultState.cmd], targetUser, resultState);
        m.reply({content:"Switched your main focus over to `"+resultState.cmd+"` - `"+resultState.pass+"` - Host: <@"+resultState.host.userId+">", ephemeral:true});
    }
},
genericParameters = [
    {name:'input', description:'What would you like to do?', type:'STRING'},
    {name:'create-new-session', description:'Got another session of this you\'d like to run in parallel? Use this!', type:'BOOLEAN'}
],
//These will display based on help descriptions of commands from fileCore. Descriptions from /join and /leave will be present too.
helpDescriptions = [
    ['join','hop into an existing activity with your friends!','tool', [{name: 'host', description:'The user you are trying to join', type:'USER'}, {name:'passcode', description:'The session passcode; good for if you are doing multiple things at once.', type:'STRING'}, {name:'input', description:'Use this option if you also want to interact with the command upon joining', type:'STRING'}]],
    ['leave','exit an activity you\'re in the middle of','tool', [{name: 'host', description:'The user running this session', type:'USER'}, {name:'passcode', description:'If the host is not there, try using this to exit the session.', type:'STRING'}]],
    ['sessions','Find out what you or others are doing','tool', [{name:'user', description:'what user are you checking? (leave blank to select yourself)', type:'USER'}]],
    ['switch','(advanced) Use this to change your focus (see /sessions for things you can switch to)','tool',[
        {name:'host', description:'The user running the session you\'re switching to', type:'USER'},
        {name:'command', description:'(not needed unless you need to be specific) which command do want to use?', choices:Object.keys(fileCore).map(e=>{ return {name:e, value:e} }), type:'STRING'},
        {name:'passcode', description:'The most specific way to context switch, useful if host & command combo doesn\'t work', type:'STRING'}
    ]]
]

/*Initial setup for the commands object. The dependency for this part is fileCore.js in order to create a consistent foundation.
For backwards compatibility with commands.js, everything will be addressed as if each item were their own command. The main difference 
is that said commands will all be the same function simply going in and setting up a session

Like /join, the command is filtered out so it's not an argument*/
function commandIgnite(m, args){
    var actualCommand = m.commandName;
    //This will assume since it was launched from the commands object that actualCommand is a thing.
    var filteredArgs = m.options.getString('input'); //removes the beginning the command

    //Create a new state if: 1.the word create is present at the beginning, or 2. we fail to find a state based on other context in the message.
    var createInvoked = m.options.getBoolean('create-new-session'),
        createNewState = false;
    
    if(createInvoked){
        //figure out how many instances can be made. If the variable for this isn't defined, the default instance count is 1. Users that maxed out instances can't make anymore, and thus will receive a reply from the bot.
        //Discover user & guild combo
        let userCommandStates = findUser(m, m.user?.id)?.activeCommands[actualCommand]?.states,
            maxInstances = fileCore[actualCommand].instances || 1;

        if(userCommandStates && Object.values(userCommandStates).length < maxInstances)
            createNewState = true;
        else m.reply({content:'Sorry, it looks like this command only permits ' + maxInstances + ' instance' + (maxInstances > 1 ? 's':'') + '...', ephemeral:true});
    }
    else if(typeof handleStateContext(m,actualCommand) == 'string')
        createNewState = true;
    
    if(createNewState)
        createState(m, fileCore[actualCommand], filteredArgs);
}

//Time to fill up the commands object! It will be commandIgnite for everything, because the command is distinguished via the actualCommand argument
for(var i in fileCore){
    commands[i] = commandIgnite;
    if(fileCore[i].helpText){
        //Create an object with options inside. If nothing goes inside though, just default to genericParameters
        
        //Find out if there are any options up-front that take priority
        let options = fileCore[i].slashCommandOptions || [];

        if(fileCore[i].legacyInputOption)
            options.push(genericParameters[0]);

        if(fileCore[i].instances || fileCore[i].instances === 1)
            options.push(genericParameters[1]);
        
        helpDescriptions.push([i,fileCore[i].helpText, fileCore[i].category, options]);
        //Determine if this should only be used via legacy commands:
        // if() helpDescriptions[helpDescriptions.length-1].push(fileCore[i].category);
    }
    if(fileCore[i].uses != undefined || fileCore[i].coolTime != undefined)
        cooldowns[i] = { coolTime:fileCore[i].coolTime, uses:fileCore[i].uses };
    if(fileCore[i].disabledInDM) disabledDMCommands.push(i);
}

//This interval will do a constant sweep and check if items are expiring or not.
//Not sure if it's the best idea, but it's mostly to prevent holding thousands of timeouts and resetting them.
setInterval(()=>{
    var sweepTimestamp = new Date().valueOf();
    for( var i in activeStates ){
        if(sweepTimestamp - (activeStates[i].expires*1000) > activeStates[i].timestamp ){
            activeStates[i].onEnd(activeStates[i].stateData,undefined,'sessionExpired');
            purgeState(activeStates[i]);
        }
    }
}, 5*60*1000);

module.exports = {
    setCommandSymbol:e=>commonVars.symbol = e,
    //The state command interface needs this to make sure we can restrict commands regardless of how they are called.
    setCooldownGroup:e=>commonVars.cooldownGroup = e,
    setClient:e=>commonVars.client = e,
    //We disable recording cooldown during the initial command parse in order to manage cooldown in unique ways in this file.
    commandChecks:{ recordCooldown:(runCommandCheck,cmd)=>cmd == 'sessions' },
    commands,
    cooldowns,
    helpDescriptions,
    disabledDMCommands
}