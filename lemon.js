//Made by iSlammedMyKindle in 2020!
//Lemon Bot is a basic discord bot we can use on our server: limewithease. He will grow over time, but he should potentially have all sorts of toys to play with :D

//His backbone will be discord.js:
const Discord = require('discord.js');
const cmdCompilation = require('./corePieces/cmdCompilation'),
    commandCore = require('./commandCore'),
    { canSendMessages } = require('./corePieces/botSendPermissionCheck');
//Partials are enabled because we want to accept DM's, which don't have guild information. Without guild info, it's considered an incomplete set of data, which lemonbot already is capable of handling.
const client = new Discord.Client({partials:['CHANNEL'], intents:['Guilds','GuildMessageReactions','DirectMessages','DirectMessageReactions',...Object.keys(commandCore.resultObject.intents)]}),
    botActivityMsg = ()=>client.user.setActivity(serverSettings.messages.botActivity.replaceAll('%s',commandSymbol)),
    personalSettings = require('./personalSettings.json'),
    serverSettings = require('./serverSettings.json'),
    cooldown = require('bot-cooldown'),
    coolInf = require('./corePieces/cooldownInterface'),
    exceptionHandling = require('./corePieces/exceptionHandling'),
    respondToBots = process.argv.indexOf('-b') > -1, //If this flag is toggled, listen to bots
    //This holds every group the bot has touched while it's been turned on. Used to cooldown commands.
    cooldownGroup = new cooldown.guildGroup(),
    responsesGroup = new cooldown.guildGroup();
var botStats = undefined;

//Very niche edge-case if you want to manually deploy special commands to specific servers. Supports authentication through discord or TOTP
if(process.env.LB_CMD_DEPLOYER || serverSettings.commandDeployer)
    require('./corePieces/oauthPage');

//Take a look at the launching arguments to see if there's a new symbol to execute commands
var commandSymbol = serverSettings.legacyCommandSystem ? process.env.LB_SYMBOL || personalSettings.commandSymbol : '/';
if(!commandSymbol){
    console.log("There wasn't an entry for $LB_SYMBOL (or commandSymbol in personalSettings.js)! Defaulting to ?");
    commandSymbol = '?';
}

if(process.env.PORT) serverSettings.webServer.port = process.env.PORT;

if(process.env.LB_STATS || serverSettings.statTracker){
    botStats = new (require('./corePieces/botStats'))(serverSettings.webServer);
    botStats.startServer();
}

for(var i of Object.values(commandCore.collectedModules)){
    if(i.setClient) i.setClient(client);
    if(i.setCommandSymbol) i.setCommandSymbol(commandSymbol);
    if(i.setCooldownGroup) i.setCooldownGroup(cooldownGroup);
}

cmdCompilation.setClient(client);

const userLevelCooldowns = cooldownGroup.createConfig('user', commandCore.resultObject.userLevelCooldowns);
/*spaceCooldowns is a special outlet that is completely separate from userLevel and the guild cooldown.
It was made so it can escape the logical tie-in between user and guild so commands can have a secondary layer.
This is *not* recommended for most use cases and is discouraged unless your commands are lethal to the bot's cpu usage.
In short, this was built for basically admin commands that would otherwise be open to abuse regardless of server.

admin commands for lemonbot also happen to have a different set of commands for denying access, so this is a workaround for that*/
cooldownGroup.createConfig('space',commandCore.resultObject.spaceCooldowns);

/*Ok... So this was previously not organized a ton so we're organizing now
There are a few things to configure before the bot can do anything; every object that we wish to implement each with will need specific variable names, for example:
{
    commands:{},
    cooldowns:{},
    disabledDMCommands:[],
    helpDescriptions:[],
    responses:{},
    responseCooldowns:{},
    userLevelCooldowns:{}
}
The target object does not need everything, but it helps bind related things together. In lemonbot's case we have standard, admin, private and stateful commands*/
//Master commands list, aggregated across all files.
const commands = {
    //Help message. this should also be updated along with new commands:
    'help':(m,args)=>{
        var cooldownCommands = cooldownGroup[m.guild?.id || "dm"].commands;
        //Filter out commands that are disabled in this configuration:
        var filteredHelp = [];
        for(var i of helpDescriptions){
            if(!cooldownCommands[i[0]] || cooldownCommands[i[0]] && !(cooldownCommands[i[0]].uses == 0 && cooldownCommands[i[0]].coolTime == -1 ))
                filteredHelp.push(i);
        }

        var pageMax = 10;
        var page = !isNaN(args[1])? args[1]: 1,
            pageCount = Math.ceil(filteredHelp.length / pageMax);
        
        if(page > pageCount) page = pageCount;
        else if(page < 1) page = 1;

        //Insert help strings
        var resultStr = (pageCount > 1?'(Page '+page+' of '+pageCount+')\n':'') + serverSettings.messages.help;
        for(var i = 0; i < pageMax; i++){
            var currDesc = filteredHelp[i + ((page-1) * 10)];
            if(currDesc) resultStr+='\n'+(serverSettings.helpEmoji[currDesc[2]] || serverSettings.helpEmoji['unknown'])+' `'+commandSymbol+currDesc[0]+'` - '+currDesc[1];
            else break;
        }

        m.channel.send(resultStr);
    }
};

const {disabledDMCommands, helpDescriptions, responses, pointsOfOrigin} = commandCore.resultObject;
//Since /help doesn't have a point of origin, we can assign it to a pseudo scope.
pointsOfOrigin['help'] = {commands:commands};
commandCore.resultObject.cooldowns['help'] = { coolTime:180,uses:Math.ceil(helpDescriptions.length) / 10 };
const cooldownDefaults = commandCore.resultObject.cooldowns;

//Sort the help descriptions
commandCore.resultObject.helpDescriptions.sort((e,f)=>e[0] > f[0] ? 1:-1);

//DM's have different permissions, mostly in the vein of disabling things. Very quick & dirty clone
const dmCooldownDefaults = JSON.parse(JSON.stringify(cooldownDefaults));
//Let's go through each cooldown setting and only include each if they are not in the list we created
for(var i in dmCooldownDefaults){
    if(disabledDMCommands.indexOf(i) > -1) delete dmCooldownDefaults[i];
    else if(dmCooldownDefaults[i].isGroup){
        var newCooldownList = [],
            applyList = false;
        for(var j of dmCooldownDefaults[i].commands){
            if(disabledDMCommands.indexOf(j) == -1) newCooldownList.push(j);
            else applyList = true;
        }
        
        //Replace the original list
        if(applyList) dmCooldownDefaults[i].commands = newCooldownList;
    }
}

dmCooldownDefaults.disabledGroup = {isGroup:true, commands:disabledDMCommands, uses: 0, coolTime:-1};

client.on('ready',()=>{
    console.log('Im in!',client.user.tag);
    botActivityMsg();
    setInterval(botActivityMsg,30*60*1000); //From what I remember, activity messages last for 30 minutes at least for users.

    //Load commands
    cmdCompilation.buildCommandList();
    if(personalSettings.deployCommandsOnLaunch) cmdCompilation.loadAllCommands();
});

//Grab the contents of a message and converts it into a command/argument pattern
var parseCommand = (str, symbol = commandSymbol)=>{
    if(str.indexOf(symbol) !== -0) return [];
    var args = str.split(' ');
    var command = args[0].substring(symbol.length);
    return [command,args];
}

client.on('interactionCreate',i=>{
    if(i.isCommand()){
        try{
            processCommand(i,i.commandName,i.options.data, i.guildId || 'dm', true);
        }
        catch(e){
            exceptionHandling.sendPreCommandException(e,i,i.commandName);
        }
    }
});

client.on('messageCreate', async msg=>{

    if(msg.author.bot && !respondToBots) return;

    //This is a bug - we need to wait for discord.js to fix the thing (current version: 14.3.0)
    msg = await msg.fetch();

    //Commands should be easier to run though since we're using associative arrays to determine if the command is even there
    //Check to see what command we got if at all:
    try{
        if (msg == null) return;
        var [actualCommand,args] = parseCommand(msg.content);
        var guildId = msg.channel.guild?.id || 'dm';

        //If a command wasn't typed, check if anyone triggered any pre-built responses
        if(!actualCommand && serverSettings.textResponses){
            var content = msg.content.toLowerCase();

            //Recurse through pre-determined chat responses
            for(var i in responses){
                if(content.indexOf(i) > -1){
                    //Responses finally get a cooldown after all this time
                    if(!responsesGroup[guildId])
                        responsesGroup.createConfig(guildId,commandCore.resultObject.responseCooldowns);
                    var coolResults = responsesGroup[guildId].updateUsage(i,msg.author.id, msg.createdTimestamp);
                    if(!coolResults || !coolResults.cooldownHit)
                        responses[i](msg);
                    else coolInf.cooldownStrikeErr(coolResults,msg);
                    return;
                }
            }
        }

        else if(serverSettings.legacyCommandSystem) processCommand(msg,actualCommand,args,guildId,false);
    }
    catch(e){
        exceptionHandling.sendPreCommandException(e,msg,actualCommand);
    }
});

function processCommand(srcObj, actualCommand, args, guildId, isInteraction){
    //The command MUST have a point of origin or else it cannot run
    var origin;
    if(!(origin = pointsOfOrigin[actualCommand])) return;

    let runCommand = true;
        recordUsage = true;
        isReservedCommand = commandCore.resultObject.reservedCommands && commandCore.resultObject.reservedCommands[actualCommand],
        userId = srcObj[isInteraction?'user':'author'].id;
    //Make sure the user can run this command - This is more for legacy execution if anything else, since slash commands do this autmatically
    if(!isInteraction && isReservedCommand){
        //Can this guild run the command? If no, then silently fail.
        let gulidConfig = cmdCompilation.reservedCommands[srcObj.guild.id]
        if(gulidConfig) runCommand = gulidConfig.indexOf(commandCore.resultObject.reservedCommands[actualCommand]) != -1;
        else runCommand = false;
    }

    if(isReservedCommand) recordUsage = false;
    if(!runCommand) return;
    //If we get past this if statement, we have a command to play with!

    var commandChecks = origin.commandChecks;

    //Setup command cooldown for this guild. If there's no config we have defaults
    if(!cooldownGroup[guildId]){
        cooldownGroup.createConfig(guildId, guildId == 'dm' ? dmCooldownDefaults:cooldownDefaults, userLevelCooldowns);
        if(guildId != 'dm' && botStats){
            botStats.recordServerCount();
        }
    }

    //Check if the command can run
    var runCheckResults = commandChecks?.commandCanRun ?
        commandChecks.commandCanRun(srcObj,actualCommand,guildId):
        { execute:true };

    //Change the guildId to "space", if the check says the commands need a private space
    if(runCheckResults.spaceCooldown) guildId = 'space';

    //Ignore cooldown check:
    //This function tracks the command's use. If we can't use it, don't run the command.
    var cooldownResults,
        recordCooldown = commandChecks?.recordCooldown ?
            commandChecks.recordCooldown(runCheckResults,actualCommand): true;
    //disabled commands are scanned here in case there is an overhead that normally allows it regardless of anything else.
    if((guildId == 'dm' && disabledDMCommands.indexOf(actualCommand) > -1) || recordCooldown)
        cooldownResults = cooldownGroup[guildId].updateUsage(actualCommand,userId, srcObj.createdTimestamp);

    //post cooldown update
    if(cooldownResults && commandChecks?.postCooldownUpdate)
        commandChecks.postCooldownUpdate(srcObj,runCheckResults,cooldownResults);

    //As long as we pass this check, the command will run
    //Cooldowns have an exact comparison for false because it could also be null. (disabled)
    var showCoolStrike = false;
    if((!cooldownResults || cooldownResults.cooldownHit === false ) && runCheckResults.execute){ 
        //Execute the command//
        if(guildId != 'dm' && !canSendMessages(srcObj)){
            console.log('I cannot speak here ('+srcObj.channel.id+')');
            return;
        }
        
        try{
            var commandResults = origin.commands[actualCommand](srcObj,args,isInteraction);
            //Change the cooldown time of said command for that user
            if(commandResults?.cooldownAppend)
                cooldownGroup[guildId].appendSeconds(actualCommand, userId, commandResults.cooldownAppend);
            //The amount of uses can also be changed based on what's needed.
            if(commandResults?.usageAppend)
                cooldownGroup[guildId].appendUses(actualCommand, userId, commandResults.usageAppend);
            
            if(botStats && recordUsage) botStats.recordCommandsOfTheWeek(actualCommand);
        }
        catch(e){
            //It's easy for errors to come out of nowhere, so this is here to prevent lemonbot from completely crashing in that event.
            exceptionHandling.sendGeneralException(e,srcObj,actualCommand);
        }
    }
    //Determine inside cooldownStrikeErr if we should show said error. In the specific scenario of abusing admin commands when you can't use them, this is also applied.
    else if(commandChecks?.showCoolStrikeError){
        if(commandChecks.showCoolStrikeError(runCheckResults,cooldownResults))
            showCoolStrike = true;
    }
    else if(cooldownResults) showCoolStrike = true;

    if(showCoolStrike) coolInf.cooldownStrikeErr(cooldownResults,srcObj, isInteraction);
}

client.login(process.env.LB_TOKEN || personalSettings.token);