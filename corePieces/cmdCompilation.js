/*Made by iSlammedMyKindle in 2021!
The functions for compiling and publishing commands are being moved here because it will be possible
to access these abilities for staff commands.*/

const personalSettings = require('../personalSettings.json'),
    serverSettings = require('../serverSettings.json'),
    { convertOptionToInt } = require('./slashCommandInts');
    //These two refer to specific classes of commands. The first is "reserved", so commands that run on a specific guild. And then "user", so specific users that have permission to run certain commands. Syntax for the JSON of both should be identical.
const reservedCommands = (process.env.LB_RESERVED_CMDS ? JSON.parse(process.env.LB_RESERVED_CMDS) : undefined) || personalSettings.reservedCommands,
    //For commands not yet using slash commands (legacy), inputs will be a string converted as if it was a normal message
    defaultSlashCommandOptions = [{name:'input', description:'Parameters for this command', type:'STRING'}];
var slashCommandList,
    client,
    coreRes;

//Ok dang, this was a circular dependency XP - I'm lucky node.js runs the way it does... I need to find a way to prevent this from not being defined. (results aren't loaded yet because we're in commandCore as we're asking for it...)
require('./onCommandCoreLoad').push(function(cmdCore){
    coreRes = cmdCore.resultObject;
    module.exports.reservedGroups = coreRes.reservedGroups;
});

//Compiling command lists
/////////////////////////

/*For a command to be considered usable for slash, it needs a 4th array index
* If this index == true, it will go in with defaultSlashCommandOptions being the options
* If the index is an array, those arguments will be used instead
* If it's empty, the command won't go into the slash commands list.*/
//Converts a list of helpDescriptions from either legacy or slash commands, and turns them into a format the discord api can read
function compileSlashCommands(commandsList){
    var resItems = [];
    for(let i of commandsList){
        if(i[3]){
            convertOptionToInt(i[3]);
            resItems.push({name:i[0],description:(serverSettings.helpEmoji[i[2]] || serverSettings.helpEmoji.unknown) + ' ' + i[1], options: typeof i[3] == 'boolean'? defaultSlashCommandOptions: i[3]});
        }
        
        //This bot's legacy format is not scaling well X{ - might be good to use the slash commands format for future commands that need advanced properties
        //New method of making commands
        else if(!Array.isArray(i)){
            //We're gonna grab the values just as they are and simply delete the extra fluff I placed in
            if(i.options) convertOptionToInt(i.options);

            if(i.category){
                i.description = serverSettings.helpEmoji[i.category] || serverSettings.helpEmoji.unknown + " " + i.description;
                delete i.category;
            }

            resItems.push(i);
        }
    }

    return resItems;
}

//Only run this function once!!!
function buildCommandList(){
    //Configure new objects based on the help-description format.
    slashCommandList = compileSlashCommands([...coreRes.helpDescriptions, ...coreRes.slashCommandHelp]);
    
    //Also setup the reserved commands. Wanted to keep these items in the key/value relationship without creating a new object.
    for(let i in coreRes.reservedGroups){
        coreRes.reservedGroups[i]._compiledHelp = compileSlashCommands([
            ...coreRes.reservedGroups[i].helpDescriptions || [],
            ...coreRes.reservedGroups[i].slashCommandHelp || [],
        ]);
    }
}

//Loading commands to Discord
/////////////////////////////

//Loads everything. If we're on a dev environment, load there instead of global.
function loadAllCommands(devDeploy = personalSettings.testLocations){
    /*Loading slash commands
    I went down the brand new pathway at first from discord.js' documentation, but I wrote this code for lemonbot prior to the version that's there today.
    Personally, I find this to make much more sense: https://github.com/discordjs/guide/blob/6c6925a0af4a35ffea1be4d846ab6f909a5bc8e7/guide/interactions/registering-slash-commands.md#bulk-update-commands
    Weather or not they keep it this way is another question, but I'm not sure why the new route is only mentioned when there's more than one way to skin the cat. Idk, perhaps it's mentioned somewhere else
    in the docs.
    
    I'm praying that it does stay in; I went all in with the new docs and the changes I needed for it to work were not elegent -_-
    Probably the only advantage the new docs have over this method is that you load slash commands sooner and don't need to wait for the bot to fully start up.
    EDIT: It seems like the docs were referencing an external module, so it's likely this functionality won't be going away. They also mention this syntax in the "slash commands permissions" section, so while not gone still a little obscure.*/
    if(devDeploy?.length){
        let doneMsg = 'Done, should now be visible everywhere!';
        console.warn('Setting slash commands for test environments instead of global!');
        let count = 0;
    
        for(let i of devDeploy){
            let resCommandList = slashCommandList;
            if(reservedCommands && reservedCommands[i])
                resCommandList = [...slashCommandList, ...loadReservedCommands(i, reservedCommands[i], true)];

            setCommandsToGuild(i,resCommandList, function(){
                console.warn('[Test environment]','['+i+']','finished');

                if(count < devDeploy.length) count++;
                else console.warn(doneMsg);
            });
        }
    }

    else client.application.commands.set(slashCommandList).then(()=>{
        console.warn('Global commands deployed!');
    },e=>console.error('...snap, something came up -_-',e));

    if(!devDeploy?.length && reservedCommands){
        console.warn('Configuring reserved commands (commands that are listed for individual discord servers)...');
        for(var i in reservedCommands)
            loadReservedCommands(i, reservedCommands[i]);
    }

}

//Setting returnCommands to true will not publish commands but instead return them for use elsewhere
function loadReservedCommands(guildId, reservedCommandForGuild = [], returnCommands = false){
    //Loop through each discord server and find what commands are needed 
    let resHelpDescriptions = [];
    for(let group of reservedCommandForGuild)
        resHelpDescriptions.push(...coreRes.reservedGroups[group]._compiledHelp);

    for(const item of resHelpDescriptions) convertOptionToInt(item.options);

    if(returnCommands) return resHelpDescriptions;
    //Push these commands to the guild!
    setCommandsToGuild(guildId, resHelpDescriptions, ()=>{
        console.warn('[Reserved commands]','['+guildId+']','finished');
    });
}

function setCommandsToGuild(guildId, commandsList, doneFunc){
    client.guilds.fetch().then(async res=>{
        //This will probably crash if somehow we didn't find the guild
        //Discord.js 14.3 broke this, there is now BaseGuild and Guild. To get Guild, you need to run fetch() from BaseGuild
        try{
            await (await res.get(guildId).fetch()).commands.set(commandsList);
            doneFunc();
        }
        catch(e){
            console.error('...snap, something came up -_-',e)
        }
    });
}

module.exports = {
    //Functions:
    loadAllCommands,
    loadReservedCommands,
    setCommandsToGuild,
    buildCommandList,
    setClient: cli=>client = cli,
    //Properties

    //Reserved
    reservedCommands,
    reservedGroups:undefined, //Wait until commandCore is loaded to insert this value
}