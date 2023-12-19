//Made by iSlammedMyKindle in 2020!
/*I realized the original method for private configs was good, but only if there was only one developer on the team.
This file makes it possible to combine many configs together without being touched. In order for your config file to be read here, it must be inside the privateModules folder and start with "cfg_"*/
const fs = require('fs');
const serverSettings = require('./serverSettings.json');

var resultObject = {
    //Cooldowns:
    cooldowns:{},
    userLevelCooldowns:{},
    responseCooldowns:{},
    spaceCooldowns:{},

    //Help descriptions
    helpDescriptions:[],
    slashCommandHelp:[],

    //Command definitions
    pointsOfOrigin:{},
    reservedCommands:{},
    reservedGroups:{}, //This dictionary is the backwards cocunterpart of the above. The key links to the reserved command object

    //Misc.
    disabledDMCommands:[],
    intents:{},
    responses:{},
}

//These are the original modules sorted out by file name without the cfg_ and .js
var collectedModules = {};

for(var folder of serverSettings.commandFileDirectories){
    var privateDirectory = fs.opendirSync(folder);
    //Look for a file name that starts with cfg_ and ends with .js
    for(var currFile; currFile = privateDirectory.readSync();){
        if(currFile.name.indexOf('cfg_') == 0 && currFile.name.indexOf('.js') == currFile.name.length - '.js'.length){
            //Game on!
            var configModule = require(folder+'/'+currFile.name);
            //fill up the resultObject
            for(var i in configModule){
                if(configModule[i] && resultObject[i] && ['commandChecks','commands','intents','reserved'].indexOf(i) == -1){
                    //An array configuration
                    if(Array.isArray(configModule[i]))
                        for(let j of configModule[i]) resultObject[i].push(j);
                    
                    //Object configuration
                    else if(typeof configModule[i] == 'object')
                        for(let j in configModule[i]) resultObject[i][j] = configModule[i][j];
                }

                else switch(i){
                    case 'commands':
                        //Every command has a mapping to it's original location. This is used to run specific checks before running each command if applicable. For example (if not the benchmark) admin commands.
                        for(let j in configModule[i]) resultObject.pointsOfOrigin[j] = configModule;
                    break;
                    case 'intents':
                        for(let j of configModule[i]){
                            if(!resultObject.intents[j]) resultObject.intents[j] = true;
                        }
                    break;
                    case 'reserved':
                        try{
                            if(!configModule[i].id) throw new Error('Error: If your config has '+targetArraySet+' commands, include an id! Will not apply current set of reserved commands...');

                            /*The references to these reserved objects can be created two ways, either over here, where we're looping through stuff now, or later in cmdCompilation.js and use a map()
                            to find them all that way. Since we're over here anyway, might as well go with the former option.
                            In addition, Find both help descriptions and insert each command as reserved.*/
                            resultObject[i+'Groups'][configModule[i].id] = configModule[i];
                            for(let j of [...configModule[i].slashCommandHelp || [], ...configModule[i].helpDescriptions || []])
                                resultObject[i+'Commands'][ Array.isArray(j) ? j[0] : j.name ] = configModule[i].id; //j[0] is the name of the command
                        }
                        catch(e){
                            console.error(e);
                        }
                    break;
                }
            }
    
            //Make the file name string to call later
            var configStr = currFile.name.split('cfg_')[1].split('.js')[0];
            collectedModules[configStr] = configModule;
        }
    }
    //Close the directory - basically stops a warning from printing to the console
    privateDirectory.closeSync();
}

module.exports = {
    resultObject,
    collectedModules
}

for(let func of require('./corePieces/onCommandCoreLoad'))
    func(module.exports);