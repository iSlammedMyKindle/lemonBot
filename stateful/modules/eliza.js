//Made by iSlammedMyKindle in 2021!
//A stateful interface to use ELIZA - a chatbot / therapist from the 1960s. Considering its going to live in discord, situations with the chatbot will probably be very entertaining XD
const eliza = require('elizabot');

var userJoin = [
    'Just asserted themselves into',
    'invaded',
    'snuck into',
    'yelled "HELLO THERE!" in',
    'appeard out of nowhere in',
    'self-summoned in',
    'managed to discover',
    'EXPOSED',
];
var conversationDescribe = [
    'the once private conversation between ELIZA and %h',
    'the 1-1 convo with ELIZA and %h',
    'the room of which ELIZA and %h are chatting in',
    'ELIZA and %h\'s 1 on 1',
    'ELIZA and %h\'s therapy room',
    'the secret hideout of ELIZA and %h',
    'McDon- OH I UH MEAN eliza\'s office, and %h is there too',
    'A black void of which ELIZA and %h have been speaking in regarding existence'
]
var afterThought = [
    'This oughta be interesting.',
    'Oh boy.',
    'Ok then!',
    'PREPARE YOURSELF',
    'well here goes nothing!',
    'PSYCHE',
    'oh snap',
    'incomiiiiiing!'
];

var customResponses = [
    ["chillidog", 0, [
		["*", [
		    "You seem to have an obsession with chillidogs.",
		    "chillidogs are the best.",
		    "those are very delicious.",
		    "Mmmmmm."
		]]
	]],
];

var initilizedKeywords = false,
    elizaTag = '*[ELIZA]* ';

function replyToMessage(m, elizaOutput){
    var userInput = m.options.getString('input') || '[Crickets]';
    if(userInput.length > 500) userInput = userInput.substring(0,500) + '...';
    m.reply("> "+ userInput + '\n' + elizaOutput);
}

function joinCheck(stateData,m){

    if(!m.channel.guild || stateData.guildId != m.channel.guild.id){
        return {joinable:false, reason:"Eliza sessions can only be used in the server of origin"};
    }

    m.channel.send(('*<@'+(m.author?.id || m.user?.id)+'> ' + userJoin[Math.floor(Math.random()*userJoin.length)] + ' ' +
    conversationDescribe[Math.floor(Math.random()*conversationDescribe.length)]+ '...' +
    afterThought[Math.floor(Math.random()*afterThought.length)]+'*').replace('%h','<@'+stateData.rootInfo.host.userId+'>') )
    return {joinable:true}
}

function leaveCheck(stateData, m){
    var targetUser = m.author?.id || m.user?.id;
    if( targetUser == stateData.rootInfo.host.userId){
        onEnd(stateData,m);
        return {leavable:true,endAll:true}
    }
    else{
        var leaveMessage = '*[<@'+targetUser+'> left <@'+stateData.rootInfo.host.userId+'>\'s ELIZA conversation]*';
        m.reply(leaveMessage);

        return {leavable:true}
    }
}

function onFind(stateData, member, msg, args){
    stateData.lastMsg = msg;
    
    if(!stateData.eliza){
        stateData.guildId = msg.guild?.id || 'dm';
        if(!initilizedKeywords) eliza.initializeWords(customResponses);
        stateData.eliza = new eliza.bot(customResponses);
        stateData.history = {};
        //This shouldn't happen anymore because this parameter is always required in new code
        // if(!args.length)
            // msg.reply(elizaTag+stateData.eliza.start());
    }
    
    var messageBody = msg.options.getString('input');
    if(stateData.eliza && messageBody.length){
        var targetUser = msg.author?.id || msg.user?.id;
        replyToMessage(msg, elizaTag+stateData.eliza.reply(messageBody));
        if(!stateData.history[targetUser])
            stateData.history[targetUser] = [];

        var sameThing = false;
        stateData.history[targetUser].push(messageBody);

        if(stateData.history[targetUser].length > 3){
            stateData.history[targetUser].shift();

            var sameThingScore = 0;
            for(var i of stateData.history[targetUser]){
                if(i == messageBody){
                    sameThingScore++;
                }
            }

            sameThing = sameThingScore == stateData.history[targetUser].length;
        }


        if(stateData.eliza.quit){
            stateData.quietEnd = true;
            return {endAll:true}
        }

        if(sameThing) return {cooldownHit:true}
    }

}

function onEnd(stateData,msg,reason){
    if(stateData.eliza && !stateData.quietEnd) (msg?msg:stateData.lastMsg).channel.send('<@'+stateData.rootInfo.host.userId+'>'+elizaTag+stateData.eliza.bye()+(reason?'('+reason+')':''));
}

module.exports = {
    cmd:'eliza',
    helpText:'A therapist from 1966 who will help with all of your problems! [Disclaimer... probably not]',
    uses:1, //The use is one to simply flick it off after manually checking for a reason to cooldown.
    coolTime: 60,
    disabledInDM:false,
    slashCommandOptions:[{name:'input', description:'What do you want to say to eliza?', required:true, type:'STRING'}],
    joinCheck,
    onFind,
    onEnd,
    leaveCheck,
    expires:60*10
}