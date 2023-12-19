//The reserved commands feature allows certain commands to only be used in the server-ID's requested in the lemonbot config, either thorugh an environment variable or serverSettings.json (not preferred)

//Custom imports
// var moduleList = [];

// //Your list loads here:
// var privateModules = {};

// for(var i of moduleList)
//     privateModules[i] = require('./moduleFolder/'+i+'.js');

// delete moduleList;

//Command help
var reservedDesc = [{name:'testcmd', description:'does this reserved command show up in the server?',category:'misc'}];

//Argument hanlding
var commands = {
    'testcmd':(i)=>{
        i.reply('it wooooorks!');
    },
    'legacy-reserved-test':(m)=>{
        m.reply('Reserved commands work correctly!');
    }
};

//Cooldown settings
// var cooldowns = {};

//You don't really need to touch this part
module.exports = {
    commands,
    // cooldowns:cooldowns,
    //Adding this in means this will not be visible to the general public and discord server ID's will need to be added for this command to run.
    reserved:{
        id:'test',
        slashCommandHelp:reservedDesc,
        //helpDescriptions can also go here, however the test command above is a slash command and not a legacy one.
        helpDescriptions:[["legacy-reserved-test","See if reserved commands work with legacy commands"]]
    }
}