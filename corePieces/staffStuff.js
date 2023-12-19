/* Made by iSlammedMyKindle in 2021!
These are commands that only specific individuals can run. Said individuals are defined in either personalSettings.json or an environment variable.
The commands themselves are sensetive to the bot's abilities, so they should not be allowed to be used by someone outside lemonbot developers or mods of the community server*/

//Cooldown will not be added to these commands, as they are reserved for staff. If they are abused somehow, I can remove someone off the list myself.
//Import the command compilation file:
const cmdCompilation = require('./cmdCompilation'),
    personalSettings = require('../personalSettings.json');

/*Two commands rolled into one. Change the configuration for guild commands by editing the json.
Depending on which command was called, different variables will be used, and the function that runs at the end will also change.

Oh yeah and it's really big! 8D*/

//This giant thing ws converted from using slash commands, to https requests
function commandManager(searchParams){
    //I was going to replace cmdCompilation["reservedCommands"][targetId] with a variable to make things shorter, but it needs to be referenced... ;LKAJSD;FLLJOQIWJERPOIWDAOIAW
    var reload = false,
        targetId = searchParams.get('guild_id'),
        newGroups = searchParams.get('groups')?.split(' '),
        action = searchParams.get('action');
        resStr = '';

        if(!targetId) return "guild_id must be passed for all actions to work";

        if(!action) return "specify an action! (Possible options: view, grant, remove, clear)";

        if((action == "grant" || action == "remove") && !(newGroups && newGroups.length))
            return "To use grant, specify the list of commands you need in \"groups\", with each group followed by space!";

        if((action == "remove" || action == "clear") && (!cmdCompilation["reservedCommands"][targetId] || !cmdCompilation["reservedCommands"][targetId].length))
            return "Server has no reserved commands ... nothing to do!";

    switch(action){
        case 'view':
            //Check if there are any groups defined for this guild
            if(cmdCompilation["reservedCommands"][targetId] && cmdCompilation["reservedCommands"][targetId].length)
                return "The following groups were found for this server: " + cmdCompilation["reservedCommands"][targetId].join(', ');
            else return "No groups were found for this server...";
        break;

        case "grant":
            if(!cmdCompilation["reservedCommands"][targetId]) cmdCompilation["reservedCommands"][targetId] = [];

            let targetResreved = cmdCompilation["reservedCommands"][targetId],
                groupsAdded = [], groupsIgnored = [], nonExistentGroups = [];

                //Filter out groups that don't exist:
                newGroups = newGroups.filter(group=>{
                    if(cmdCompilation["reservedGroups"][group]) return true;

                    else{
                        nonExistentGroups.push(group);
                        return false;
                    }
                });

            for(let i of newGroups){
                if(targetResreved.indexOf(i) == -1){
                    targetResreved.push(i);
                    groupsAdded.push(i);
                }
                else groupsIgnored.push(i);
            }

            resStr = groupsAdded.length ? "Adding the following to "+targetId+': `'+ groupsAdded.join(', ')+"`" : "Nothing to add! " + //Add/not add
                (groupsIgnored.length? "(`"+groupsIgnored.join(', ')+"` were already added)" : "") + //ignored
                (nonExistentGroups.length?" (These don't actually exist in the bot: `"+ nonExistentGroups.join(', ') + "`)":"")
            
            reload = groupsAdded.length;
        break;

        case "remove":
            let originalLength = cmdCompilation["reservedCommands"][targetId].length;

            cmdCompilation["reservedCommands"][targetId] = cmdCompilation["reservedCommands"][targetId].filter(e=>newGroups.indexOf(e) == -1);

            let newLength = cmdCompilation["reservedCommands"][targetId].length;

            reload = originalLength != newLength;

            resStr = reload ? "Removing " + (originalLength - newLength) + " groups from `"+ targetId+"`..." : "queried groups were not present... nothing changed!";
        break;

        case "clear":
            //Deletes the entire contents of reservedCommands
            delete cmdCompilation["reservedCommands"][targetId];
            resStr = "Deleting `"+targetId+"`'s configuration! Reserved commands won't be seen here any longer.";
            reload = true;
    }

    if(reload){
        //If this is a developer environment, just republish everything, otherwise load the reserved commands:
        if(personalSettings.testLocations.indexOf(targetId) > -1) cmdCompilation.loadAllCommands([targetId]);
        else cmdCompilation.loadReservedCommands(targetId, cmdCompilation["reservedCommands"][targetId]);
    }

    return resStr;
}

module.exports = commandManager;