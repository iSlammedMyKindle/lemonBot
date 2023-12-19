//Made by iSlammedMyKindle in 2020!
//This file lists the commands we're using in the lemonModules directory. Each item parses it's own arguments and when done passes those arguments to the module.
//We also load lemon modules here.

//Load the modules!
var lemonModules = {};
const messageOverflow = require('../corePieces/messageOverflow'),
    responses = require('./responses'),
    timeTools = require('../lemonModules/timeTools'),
    deleteMessages = require('../corePieces/deleteMessages'),
    { EmbedBuilder } = require('discord.js'),
    memeCore = require('../lemonModules/memeModules/memeCore');

//These are file names you can find from lemonModules. For example: eMark.js would be eMark here.
var moduleList = [
    'creepyCase',
    'dumbotModule',
    'eMark',
    'mathTools',
    'rylansWisdom',
    'shuffle',
    'wordJumbler',
]

//Response for if a date is invalid:
var badDateResponse = dateName=>{ return {content:'Hmm... looks like '+dateName+' isn\'t in the right format, try something like this: `1/2/3` or this `10/14/2020`', ephemeral:true} };

for(var i of moduleList)
    lemonModules[i] = require('../lemonModules/'+i+'.js');

delete moduleList;

//Math string that's been super annoying since day 1... beautiful [edit - wow I was pretty salty that day 0_o]
var badMathStr = /*fancy string*/` 
Bad argument(s) :(
Usage: %s 1 + 1
I take the following symbols:
+ (plus)
- (minus)
* (multiply)
/ (divide)

But a number must always come first. You can chain symbols and numbers together like \`%s 1 + 1 * 2 / 4\`
Parenthesis works too: \`(1+1) * 2\`

I can also accept the following math functions, see developer.mozilla.org for more info on these:

\`${lemonModules.mathTools.itemsToConvert.join(', ')}\`

These can take in more than one parameter:

\`${lemonModules.mathTools.multiParamFuncs.join(', ')}\`
        
Example 1: \`round(1.5)\` *//returns 2*
Example 2: \`min(1,3,2)\`*//returns 3*

*Note: due to limitations, math functions that use multiple parameters can't use another math function as it's parameter.*`;

const textWarperDefault = [{name:'text',description:'Enter the message you want to send!',required:'true', type:'STRING'}];
const usernameDefault = [
    {name:'user1',description:'First username',required:true, type:'USER'},
    {name:'user2',description:'Second username', type:'USER'},
    {name:'user3',description:'Third username', type:'USER'},
    {name:'user4',description:'Fourth username', type:'USER'}
];

const nameJumbleArgs = [
    {name:'user1',description:'First username',required:true, type:'USER'},
    {name:'user2',description:'Second username', required:true, type:'USER'},
    {name:'user3',description:'Third username', type:'USER'},
    {name:'user4',description:'Fourth username', type:'USER'}
];
//Command help descriptions are over here. Some dynamic items are here to sort help in alphabetical order
const slashCommandHelp = [
    ["age", "Find out the age of up to 4 discord accounts",'tool', usernameDefault],
    ["back", "!naidrocsid gnuoy eikooc trams a er'uoy yeh ho",'text',textWarperDefault],
    ["creepy", "tYpE lIkE a CrEePy PeRsOn",'text',textWarperDefault],
    ["dateadd","Add numbers to find out what date it lands on","tool",[
        {name:"number", description:"Use this number to add/subtract days to the designated date", type:'INTEGER', required: true},
        {name:"date", description:"The date you want to perform math on. Default is today (pattern: m/d/y)", type:'STRING',},
    ]],
    ["datediff","Use two dates to find the total of days between eachother","tool",[
        {name:"date1", description:"One of two dates to perform the comparison (pattern: m/d/y)", type:'STRING', required: true},
        {name:"date2", description:"Optional date to perform the comparison, leave blank to use today as default (pattern: m/d/y)", type:'STRING',},
    ]],
    ["datemake", "Create a date you can paste that's timezone independent", "tool", [
        {name: "current-hour", description: "What hour of day is it right now? (In military / 24 Hour time. E.g: 1PM = 13, 2PM = 14)", required: true, type:"INTEGER"},
        {name: "month", description: "The month for your date", required: true, type:"INTEGER"},
        {name: "day", description: "The day for your date", required: true, type:"INTEGER"},
        {name: "year", description: "The year for your date", required: true, type:"INTEGER"},
        {name: "hour", description: "The hour in military / 24 Hour time. E.g: 1PM = 13, 2PM = 14", required: true, type:"INTEGER"},
        {name: "minute", description: "The minute - 0-59", required: true, type:"INTEGER"},
        {name: "display-type", description:"How do you want the date to display?", choices: [
            {name: "Short Time (4:56 PM)", value: "t"},
            {name: "Long Time (4:56:00 PM)", value: "T"},
            {name: "Short Date (1/2/2023)", value: "d"},
            {name: "Long Date (January 20 2023)", value: "D"},
            {name: "Short Date/Time (January 20 2023 4:56 PM)", value: "f"},
            {name: "Long Date/Time (Monday, January 20 2023 4:56 PM)", value: "F"},
            {name: "Relative Time 6 months ago", value: "R"},
        ], type: 'STRING', required: true},
        {name: "seconds", description: "The specific time in seconds", type: 'INTEGER'}
    ]],
    ["dumbot", "Ask an intelligent question",'meme',[]],
    ["e", "b[e] r[e]sponsibl[e] with this on[e]",'text',textWarperDefault],
    ["essayshrink","lookingtoshrinkyouressaydowntothemaximumlettercount? Look no further!!", 'meme', [{name:"input", description:"Place your essay in here!", type:"STRING", required:true}]],
    ["gamerfy", "Mak3 y0ur 73x7 gam3r 57yl3.",'text',textWarperDefault],
    ["lemon", "go meta and meme using the fruity memer himself",'meme', []],
    ["math", "Do Stonks",'tool',[{name:'formula',description:'Enter the math formula here',required:true, type:'STRING'}]],
    ["mock","End all your debates instantly with the power of mocking spongebob!",'meme',[]],
    ["mystery", "The command of all commands! Run this to execute a random command (Made for RCAce95!)", 'meme', []],
    ["namejumble", "Fuse up to 4 usernames together for an abomination",'text',nameJumbleArgs],
    ["ohno","Send a random meme! You never know what comes next with this one! (Created for Darth Plagueis!)", "meme",[]],
    ["owo", "Wouwd you wike tow twy dhiz cwommand???", "text", [{name:"input", description:"The message you wish to send!", type:"STRING", required:true}]],
    ["rnd", "Ask for a random number",'tool',[{name:'number',description:'Your number will between 0 and this', required:true, type:'INTEGER'}]],
    ["rylan", "Display this man's greatness to the channel",'meme',[]],
    ["shuf", "Randomize a list of things",'tool',[{name:'list-of-items', description:'List of items separated by ",". List syntax also works: ["word, or phrase",1.5,8,"MyOtherlistItem"]', required:true, type:'STRING'}]],
    ["wisdom", "Recieve good advice from a wise man",'meme',[]],
    ["wordcount", "Discover the top 15 words in your sentence!", "tools", [{name:"input", description:"Place your sentence in here!", type:"STRING", required:true}]],
];

//Also originally in lemon.js - cooldowns that are set for each command defined here. They are limiters for how often a command can be used.
var userLevelCooldowns = {
    'textWarpersGroup':{
        isGroup:true,
        coolTime:15,
        uses:3,
        commands:['creepy','e','back','gamerfy','namejumble','essayshrink']
    },
    //Clever name am I right? :D
    'once5Secs':{
        isGroup:true,
        coolTime:5,
        uses:1,
        commands:['age','dumbot','wisdom']
    },
    'rndImage':{
        isGroup:true,
        coolTime: 45,
        glue:true,
        uses:2,
        commands:['lemon','rylan','ohno']
    },
    'math': { coolTime:25, uses:5 },
    'dateCmd': {
        isGroup:true,
        coolTime:20,
        uses:3,
        commands:['dateadd','datediff', 'datemake']
    },
    'mock': { coolTime:15, uses:1 },
    'shuf': { coolTime:90, uses:1 },
    'wordcount': { coolTime: 60, uses:1 },
    'mystery' : { coolTime: 60, uses: 3 }
}

//Configure the meme commands:
memeCore.initConfig(require('../personalSettings.json').external?.imgur?.token || process.env.LB_IMGUR_TOKEN, require('../serverSettings.json').external.imgur.albums);

const rnd = num=>Math.floor(Math.random()*num);

//https://en.wikipedia.org/wiki/Hexadecimal#Division-remainder_in_source_base
function toHex(d) {
    var r = d % 16;
    if (d - r == 0) {
        return toChar(r);
    }
    return toHex((d - r) / 16) + toChar(r);
}
  
function toChar(n) {
  const alpha = "0123456789ABCDEF";
  return alpha.charAt(n);
}

//This is another thing discord.js broke - you're supposed to use either an array of rgb, PascalCase color names, or a number. Only numbers work XP
const memeColors = {
    "rylan": 0x9900ff, //Purple
    "lemon": 0xffcc00, //Gold
    get ohno(){
        //Jank method of generating a hex number from a string
        return `0x${toHex(rnd(256))}${toHex(rnd(256))}${toHex(rnd(256))}`*1;
     } //Random
}

const replaceCmdWithMessage = (objSrc,str)=>objSrc.reply(deleteMessages()).then(()=>objSrc.deleteReply()).then(()=>objSrc.channel.send('<@'+objSrc.user.id+'> '+str)),
    lastMessageParam = (msg, callback)=>msg.channel.messages.fetch({limit:1}).then(e=>callback([...e.values()][0].content, e));

//A very jank method of not needing to write a lot of lines to do the same thing. Requires a context containing this.msg. (lstMsgRoutine.call({msg}))
//doThisFirst can't be an arrow function (no this context)
const lstMsgRoutine = function (onFinished) {
    lastMessageParam(this.msg, prevMsg => onFinished({ prevMsg }));
};

var dateStr = e=>{
    var initialStr = (e+"").split(" ").slice(0,5),
        spaceReplace = [',', 0, ',', ' -'];
    
    for(var i = 0;i < initialStr.length; i++)
        if(spaceReplace[i]) initialStr[i]+=spaceReplace[i];

    return initialStr.join(' ');
}

async function fetchRandomUsers(m){
    var members = [...await m.guild.members.list({after: m.guild.memberCount > 500 ? rnd(100000000000000000 * 10) : 0, limit:4})];
    var randomResults = [];

    for(let i = 0; i < rnd(m.guild.memberCount < 4 ? m.guild.memberCount : 4)+1; i++)
        randomResults.push(members[rnd(members.length)][1].user);

    return randomResults;

}

var commands = {
    'age':(m, args, mysteryObj)=>{
        var users = [],
            finalStr = '';

        if(mysteryObj?.isMystery){
            if(mysteryObj.params?.users) users = mysteryObj.params.users;
            else return mysteryObj.callback({doThisFirst:onDone=>fetchRandomUsers(m).then(users=>onDone({ users }))})
        }

        else for(let i of args) users.push(i.user);

        if(users.length > 1 && users.length < 5){
            //grab the userIds and determine which one is smaller
            var count = 1;
            for(var i of users.sort((e,f)=>e.id > f.id? 1:-1)){
                finalStr += (finalStr?'\n':'')+'`#'+count+'`** - ' + i.username + "** - `" + dateStr(i.createdAt) + ' UTC`';
                count++;
            }
        }
        else if(users.length === 1)
            finalStr = "**" + users[0].username + "** started using discord on `" + dateStr(users[0].createdAt)+" UTC`";

        if(mysteryObj.isMystery) return mysteryObj.callback({ content: finalStr })

        m.reply(finalStr);
    },
    'back':(m, args, mysteryObj)=>{
        if(mysteryObj?.isMystery){
            lastMessageParam(m, (content, e)=>mysteryObj.callback(content.split('').reverse().join('')));
            return;
        }

        replaceCmdWithMessage(m, args[0].value.split('').reverse().join(''));
    },
    'creepy':(m, args, mysteryObj)=>{
        if(mysteryObj?.isMystery)
            return lastMessageParam(m, content=>mysteryObj.callback({content: lemonModules.creepyCase(content)}));
        replaceCmdWithMessage(m,lemonModules.creepyCase(args[0].value))
    },
    'dateadd':(i, args, mysteryObj)=>{
        //This is the first command I'm making post-slash command update. (besides /lemon) This one is more interesting because slash commands is on my mind now instead of parsing arguments.
        var dateStr = i.options.getString('date'),
            dateObj,
            number;

        if(mysteryObj?.isMystery) number = Math.floor(Math.random() * (365*10))
        else number = i.options.getInteger('number');

        if(dateStr){
            if(!timeTools.dateSyntaxValid(dateStr)){
                i.reply(badDateResponse('your date'));
                return;
            }
            else dateObj = new Date(dateStr);
        }
        else dateObj = new Date();

        let resultStr = '> '+dateObj.toDateString() + ' ' + (number > 0 ? '+':'') + number + ' days:\n\n';

        dateObj.setDate(dateObj.getDate() + number);

        if(mysteryObj?.isMystery) return mysteryObj.callback({content: resultStr + dateObj.toDateString() });

        i.reply(resultStr + dateObj.toDateString());
        
    },
    'datediff':(i, args, mysteryObj)=>{
        //This was going to be part of dateadd, but options started getting confusing for what was required for the specific action.
        var datesToCheck;
        var resultDates = [];

        if(mysteryObj?.isMystery){
            datesToCheck = [
                rnd(12) + "/"+rnd(31)+"/"+rnd(2100),
                rnd(12) + "/"+rnd(31)+"/"+rnd(2100),
            ];
        }
        else{
            datesToCheck = [
                i.options.getString('date1'),
                i.options.getString('date2')
            ];
        }
        
        for(let str in datesToCheck){
            if(datesToCheck[str]){
                if(!timeTools.dateSyntaxValid(datesToCheck[str])){
                    i.reply(badDateResponse('`date' + ((str*1)+1) + '`'));
                    return;
                }
                else resultDates.push(new Date(datesToCheck[str]));
            }
        }

        if(!resultDates[1]) resultDates[1] = new Date();

        resultDates.sort((i,j)=>i.valueOf() < j.valueOf() ? 1:-1);

        //Divide by milliseconds * seconds * minutes * hours (1000 * 60 * 60 * 24)
        var result = ((resultDates[0].valueOf() - resultDates[1].valueOf()) / 86400000).toFixed(2);
        var replyStr = '> `'+resultDates[0].toDateString()+'` - `'+resultDates[1].toDateString()+'`\n\n'+ result + ' days (Or '+((result/365).toFixed(2)) + ' years)';
        if(mysteryObj?.isMystery) return mysteryObj.callback({ content: replyStr})

        i.reply(replyStr);
    },
    'datemake': (m, args, mysteryObj)=>{
        var month, day, year, hour, minute, second, displayType;

        if(mysteryObj?.isMystery){
            month = rnd(12),
            day = rnd(31),
            year = rnd(new Date().getFullYear() + 100),
            hour = rnd(24),
            minute = rnd(60),
            second = rnd(60),
            displayType = 'tTdDfFR'[rnd(7)];
        }
        else{

            var timezoneOffset = m.options.getInteger('current-hour') - new Date().getHours();

            month = m.options.getInteger('month'),
            day = m.options.getInteger('day'),
            year = m.options.getInteger('year'),
            hour = m.options.getInteger('hour') - timezoneOffset,
            minute = m.options.getInteger('minute'),
            seconds = m.options.getInteger('seconds'),
            displayType = m.options.getString('display-type');
        }

        var resDate = new Date(`${month}/${day}/${year} ${hour}:${minute}${ typeof seconds == 'number' ? ':' + seconds : ''}`).getTime() / 1000;

        var formattedDate = '<t:'+resDate+':'+displayType+'>';
        if(mysteryObj.isMystery)
            mysteryObj.callback({content:formattedDate+'\n`'+formattedDate+'`'});
        else m.reply({content:formattedDate+'\n`'+formattedDate+'`', ephemeral: true});
    },
    'dumbot':(m, args, mysteryObj)=>{
        var inquiry = lemonModules.dumbotModule();
        var res = inquiry[0].join(' ') + inquiry[1][0]; //Index 0 - question, Index 1 - punct

        if(mysteryObj?.isMystery) return mysteryObj.callback({content: res});

        m.reply(res);
    },
    'e':(msg, args, mysteryObj)=>{

        if(mysteryObj?.isMystery){
            if(mysteryObj.params){
                let res = lemonModules.eMark(mysteryObj.params.prevMsg);
                if(res.length > 2000) res = res.substring(0,1995)+"[...]";

                return mysteryObj.callback({ content: res});
            }
            else return mysteryObj.callback({ needsMsg:true });
        }

        let result = lemonModules.eMark(args[0].value);
        if(!messageOverflow(msg,result, msg.user.id)) replaceCmdWithMessage(msg, result);
    },
    'essayshrink':(msg, args, mysteryObj)=>{
        var targetStr;

        if(mysteryObj?.isMystery){
            if(!mysteryObj.params) return mysteryObj.callback( { needsMsg:true } );
            else targetStr = mysteryObj.params.prevMsg;
        }

        else targetStr = msg.options.getString('input');

        var res = '';
        for(let i in targetStr){
            let charCode = targetStr[i].charCodeAt(0);
            if(charCode >= 65 && charCode <= 90 || charCode >=97 && charCode <= 122) res+=targetStr[i];
        }

        if(!res){
            msg.reply({content: "Whoops, you'll need to send something that's not exclusively punctuation and spaces!", ephemeral: true});
            return;
        }

        var msgToSend = "> "+res.substring(0,1993) + (res.length > 1993 ? "[...]":"");
        if(mysteryObj?.isMystery) return mysteryObj.callback({ content: msgToSend });

        msg.reply(msgToSend);
    },
    'gamerfy':(msg, args, mysteryObj)=>{
        let result;

        if(mysteryObj?.isMystery){
            if(mysteryObj?.params) result = mysteryObj.params.prevMsg;
            else return mysteryObj.callback({ needsMsg:true });
        }
        else result = args[0].value;

        result = result.replaceAll('e','3').replaceAll('s','5').replaceAll('b','8')
            .replaceAll('t','7').replaceAll('o','0').replaceAll('i','1')

        if(mysteryObj?.isMystery){
            if(result.length > 2000) result = result.substring(0, 1995)+"[...]";
            return mysteryObj.callback({content:result});
        }

        if(!messageOverflow(msg,result, msg.user.id)) replaceCmdWithMessage(msg,result);
    },
    'math':(m,args, mysteryObj)=>{
        //Check literally every character to make sure we don't have an abuse on the js math system.
        //Declaring multiple values at once like a boss
        var mathStr = "",
            invalid = false,
            cmdName = '/'+m.commandName;

        if(mysteryObj?.isMystery){
            //The mystery command will be kept pretty simple, random numbers randomly added, subtracted, multiplied and divided
            //This is designed for invalid to never be true. Otherwise it's a bug 
            for(let i = 0; i < Math.floor(Math.random() * 3)+2; i++)
                mathStr+= (i ? "+-*/"[rnd(4)] : '') + rnd(1000);
        }
        else mathStr = args[0].value.replaceAll(' ','')

        // ayo gotta check the thing
        if(!lemonModules.mathTools.mathStrValid(mathStr)) invalid = true;

        //Check if equation is 9 + 10
        var twentyOneStr = mathStr == "9+10" ? "~~21~~ " : "";

        //Actually test the thing before running it! :(
        // I never test anything before calling it done 
        var result = 0;
        if(!invalid){
            try{
                // Technowizardry
                result = Function('return '+lemonModules.mathTools.convertToMathExpression(mathStr)).call(lemonModules.mathTools.customFunctions);
            }
            catch(e){
                invalid = true;
                console.error(e);
            }
        }

        if(invalid){
            m.reply({
                content:badMathStr.replaceAll('%s',cmdName),
                ephemeral:true
            });
        }
        
        else{
            if(mysteryObj?.isMystery)
                return mysteryObj.callback({content: '`'+mathStr+'`\n'+twentyOneStr+result})

            m.reply('`'+mathStr+'`\n'+twentyOneStr+result);
        }
    },
    'mock':(msg, args, mysteryObj)=>{
        lastMessageParam(msg, content=>{
            var embed = new EmbedBuilder({
                color: memeColors.ohno,
                image:{url:'https://i.imgur.com/IrxXidQ.jpg'}
            })

            var resContent = {content:lemonModules.creepyCase(content), embeds:[embed]};

            if(mysteryObj?.isMystery) return mysteryObj.callback(resContent);
            msg.reply(resContent);
        });
    },
    'mystery':(msg, args)=>{
        const rndIndex = rnd(commandList.length);
        const targetFunction = commandList[rndIndex][1][commandList[rndIndex][0]]


        //Run this mysterious command, when done the results will be placed here.

        /**
         * Example object:
         * {
         *  content: "my string here",
         *  embeds:[embed1, embed2, embed3]
         * }
         */

        const finalCall = execResults => {
            //Create an embed that tells what command got executed
            var commandEmbed = new EmbedBuilder({
                description: "/mystery command!",
                title: '`/'+commandList[rndIndex][0] + '`'
            });

            msg.reply({ content: execResults.content, embeds: [...(execResults.embeds || []), commandEmbed] });
        }

        var secondaryCall = params=>targetFunction(msg, args, { isMystery: true, params, callback: finalCall});

        targetFunction(msg, args, {
            isMystery: true,
            cmdName: commandList[rndIndex][0],
            callback: execResults=>{
                //In the event we need more data before running the command, we can quickly cancel the orignal execution, and run the prep-work the command wants us to do.
                //Once finished, we can try the command again but with the data it wants.

                if(execResults.doThisFirst)
                    execResults.doThisFirst.call(execResults.ctx || this, secondaryCall);
                
                else if(execResults.needsMsg)
                    lstMsgRoutine.call({msg}, secondaryCall);

                else finalCall(execResults);
            }
        });


        //create the lottery cooldown
        if(rnd(1000) == 500)
            return { cooldownAppend: 60*60*24*30 }

    },
    'namejumble':async (m,args, mysteryObj)=>{

        if(mysteryObj?.isMystery){
            fetchRandomUsers(m).then(users=>{
                let usernames = users.map(e=>e.displayName);
                mysteryObj.callback({content: usernames.join(' + ') + "\n"+ lemonModules.wordJumbler.wordJumbler(...users.map(e=>e.displayName))});
            });
        }

        else m.reply(lemonModules.wordJumbler.wordJumbler(...args.map(e=>e.user.displayName)))
    },
    'owo':(i, args, mysteryObj)=>{
        let input;

        if(mysteryObj?.isMystery){
            if(mysteryObj.params) input = mysteryObj.params.prevMsg;
            else return mysteryObj.callback({ needsMsg:true });
        }
        else input = i.options.getString('input')

        let res = '';

        for(const char of input){
            const isUpper = char.charCodeAt() > 64 && char.charCodeAt() < 91;
            const compareLetter = char.toLowerCase();
            let targetLetter = '';

            if('kc'.indexOf(compareLetter) > -1) targetLetter = 'tkc'[rnd(3)];
            if(compareLetter == 't') targetLetter = 'td'[rnd(2)];
            else if('rl'.indexOf(compareLetter) > -1) targetLetter = 'w';
            else if(compareLetter == 'h') targetLetter = ['h', ''][rnd(2)];
            else if('sz'.indexOf(compareLetter) > -1) targetLetter = 'sz'[rnd(2)];
            else if(compareLetter == 'o') targetLetter = ['o', 'ow', 'wo'][rnd(3)];
            else targetLetter = compareLetter;

            res+=targetLetter['to'+(['Lower', 'Upper'][isUpper*1])+'Case']();
        }

        if(mysteryObj?.isMystery){
            if(res.length > 2000) res = res.substring(0, 1995)+"[...]";
            return mysteryObj.callback({ content:res });
        }
        if(!messageOverflow(i, res, i.user.id)) replaceCmdWithMessage(i, res);
    },
    //Flat-out integers won't send for some reason. We need to convert to a string beforehand...
    'rnd':(m,args, mysteryObj)=>{
        if(mysteryObj?.isMystery) return mysteryObj.callback({content: ''+(Math.floor(Math.random()* 1000) +1) });

        m.reply(''+(Math.floor(Math.random()*args[0].value)+1))
    },
    'shuf':(m,args)=>{
        //Help messages
        var mainHelp = `shuf gives everything you threw at it back at you but in a random order
        You can either give it a list of things like this: \`/shuf item 1,item 2,hiCaleb\`
        
        Or, you can put in a list of items!`;
        var listHelp = `Syntax: \`["word, or phrase",1.5,8,"MyOtherlistItem"]\`
        Your words and phrases need to be in quotation marks, but numbers don't need quotes.
        Separate everything by commas and enclose your whole list inside these: \`[]\``;

        //Accept either a javaScript array or a list of items separated by comma
        var shufStr = args[0].value;
        var itemsToShuf = [];

        //If this is an array, try to parse it:
        if(!shufStr.length){
            m.reply({content:mainHelp+'\n'+listHelp,ephemeral:true});
            return
        }
        else if(shufStr[0] == '['){
            try{
                itemsToShuf = JSON.parse(shufStr);
            }
            catch(e){
                m.channel.send('Invalid List!\n'+listHelp);
            }
        }

        else itemsToShuf = shufStr.split(',');

        if(itemsToShuf.length)
            m.reply(lemonModules.shuffle(itemsToShuf).join('\n'));
        else m.reply({content:mainHelp+'\n'+listHelp, ephemeral:true});
    },
    'wisdom':(m, args, mysteryObj)=>{
        const str = '> '+lemonModules.rylansWisdom()+' -RylanStylin';
        if(mysteryObj?.isMystery) return mysteryObj.callback({ content:str });

        m.reply(str);
    },
    'wordcount':(msg, args, mysteryObj)=>{
        var words;

        if(mysteryObj?.isMystery){

            if(!mysteryObj.params)
                return mysteryObj.callback({ needsMsg:true } );

            else words = mysteryObj.params.prevMsg.split(' ');
        }

        if(!words) words = msg.options.getString('input').split(' ');
        var wordMap = new Map();

        for(let i of words){
            let targetKey = i.toLowerCase();
            if(!wordMap.get(targetKey)) wordMap.set(targetKey,0);
            wordMap.set(targetKey, wordMap.get(targetKey)+1);
        }

        //Sort everything out to get results
        var results = [...wordMap].sort((word1, word2)=>word1[1] > word2[1] ? -1 : 1),
            resStr = '';

        //print everything out nicely for the end-user
        for(let i = 0; i < 15; i++){
            if(results[i]) resStr += (i?"\n":"") + (i + 1) + '. **['+results[i][1]+"]** `"+results[i][0]+"`";
            else break;
        }

        if(mysteryObj?.isMystery) return mysteryObj.callback({content:"[Previous message]\n" + resStr});

        msg.reply(resStr);
    }
}

// Create a list of commands with their execution points in-tact so we can launch them later.
const commandList = [
    ...slashCommandHelp.map(e=>[e[0], commands]).filter(command=>['mystery', 'shuf'].indexOf(command[0]) == -1),
    ...Object.keys(responses.responses).map(e=>[e, responses.responses]).filter(command=>command[0].indexOf('lemonbot') > -1)
];

// const commandList = [['rylan', commands],['lemon', commands],['ohno', commands]];

//Initialize meme commands
function memeCommand(i, args, mysteryObj){
    var indexer = memeCore.albums[mysteryObj?.cmdName || i.commandName].compiledIndexer;
    var res = indexer.get(Math.floor(Math.random() * indexer.length));

    var embed = new EmbedBuilder({
        color:memeColors[i.commandName] || memeColors.random,
        //First index of res[0] is the link to the image, while the second index is if it was either created by the user (true), or submitted, which means they copied it (false)
        image:{url:res[0][0]},
        footer:{text:(res[0][1] ? "Created" : "Submitted") + " by: " + res[1]}
    });

    if(mysteryObj?.isMystery) return mysteryObj.callback({embeds:[embed]});
    i.reply( {embeds:[embed]} );
}

for(let i in memeCore.albums)
    commands[i] = memeCommand;

module.exports = {
    commands,
    userLevelCooldowns,
    slashCommandHelp,
    responses:responses.responses,
    responseCooldowns:responses.cooldowns,
    intents:['GuildMessages', 'GuildMembers']
};