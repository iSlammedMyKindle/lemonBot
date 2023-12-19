//Made by iSlammedMyKindle in 2021!
//A long time ago there used to be this flash hangman game called "hangman.no". It's gone now, but discord is a new canvas, so this could probably last longer.
const {quoteParser} = require('../../../corePieces/mentionTools'),
    dimIndexer = require('../../../lemonModules/multiDimIndexer'),
    {deleteMsg} = require('../slashCommandTools'),
    hangmanWords = require('./hangmanWords.json'),
    messages = {
    joined:'New game of hangman! use `help` (e.g `/hangman input:help`) to see the rules',
    quickStart:'Quick Start: use || to create a word/phrase for everyone else to guess `||my thing goes here!||` or just add `rnd` and a word will be randomly selected',
    rndWord: 'A random phrase was selected... good luck!',
    newWord: 'Placed in a new word/phrase... good luck!',
    spaceToStar:'By the way, spaces are shown as stars (*)',
    alreadyTried:'that was already used!',
    noValidCharacters:'You need at least one letter or number in your word!',
    hostGuess:'You made the word, so you can\'t guess this one!',
    correctWord:' guessed the rest of the word!',
    hostEnd:'[The host has left the game]',
    sessionExpired:'[Rats... the session expired]',
    gameOver:'Game over, this session will now end',
    wordErr:'Words or phrases must be less than 100 characters',
    maxGuesses:'The hangman was hung...',
    incorrectRnd:[
        " - which wasn't correct",
        "...really? -_-",
        " - nnnnnope!",
        " - Don't think so buddy",
        "...ow that looked like it hurt Mr. hangman",
        "...ooooooof",
        " - INCORRECT!",
        " - WRONG :(",
        " lol no",
        " - hmmmmmm, not quite",
        " - CORRE-whoop misread that; nope",
        " - no that was my guess too though",
        "...THAT one? Well... no",
        " - soooo allow me to let you in on something, no."
    ],
    howToPlay:`How to play Hangman!
    Your mission: guess the word or phrase that either your friends or the computer makes for you. If you guess correctly within 5 mistakes, you win!
    Otherwise, the hangman will be hung...

    setting up:
    \`||Place your word/phrase in these pipe things||\` and "place hints in quotes", for example: \`/hangman input:||cookie|| "food"\`

    Playing:
    Guess a letter or number: \`/hangman input:a\`
    Symbols will be filled in for you by the game

    Guess an entire word with quotes: \`/hangman input:"cookie"\`

    Other:
    * use \`help\` to see this message again
    * using \`/leave\` as the host ends the game early
    * \`/hangman input:redraw\` makes a new message with the game redrawn.
    `
},
    //Hats, heads, shirts, pants and shoes to draw a hangman.
    hangmanEmoji = [
    ['🎩','🧢','🪖','🕶️','🥽','👑'],
    ['😒','😑','🤯','🥸','😵‍💫','😵'],
    ['🧥','👔','👕','🥼'],
    ['🩳','👖'],
    ['🧦','👞','👟','🥾']
],
    noMiss = '🟩',
    renderers = {
    headerInfo:(stateData)=>'**To join: `/join host:@'+stateData.hostUsername+'`**\nGame expires `5 minutes` after last move\nPasscode: `'+stateData.rootInfo.pass+'`',
    board:function(gameObj){
        var result = '';
        //End early if we have no game data.
        if(!gameObj) return result;

        result+='Hint: **'+(gameObj.hint || 'N/A')+'**\n';

        for(var i = 0;i < 5;i++)
            result+=(gameObj.hangman[i] || noMiss) + '\n';

        result+='```';
        for(var i of gameObj.wordProgress) result+= (i || '_') + ' ';
        result+='```';

        return result;
    },
    log:function(gameLog){
        var result = '```\n';
        for(var i = 0; i < gameLog.length; i++)
            result += gameLog[i] + '\n' + (i != gameLog.length - 1 ? '---' : '') + '\n';

        return result+'```';
    }
}

//Like it says in the object's file, this will convert an object that has a multi-dimension object/array and treats everything like a single-dimension array.
var wordIndexer = new dimIndexer(hangmanWords);

//In the event we need to draw a new message to play the game, just create a new message.
function drawGame(board,stateData,newMessage = false){
    var resultStr = renderers.headerInfo(stateData) + '\n' + renderers.board(board) + '\n' + renderers.log(stateData.log);
    var thenFunction = e=>stateData.gameMsg = e;

    //I tried calling this as a function that's either channel.send or .edit; but they had to be split because the prototype for both messages appear to have scope issues
    if(newMessage) stateData.lMsg.channel.send(resultStr).then(thenFunction);

    else stateData.gameMsg.edit(resultStr).then(thenFunction,function(){
        stateData.lMsg.channel.send(resultStr).then(thenFunction);
    });
}

function logPush(gameLog, text = ''){
    gameLog.push(text);
    //Remove a previous entry if the log is bigger than 3 messages
    if(gameLog.length > 3)
        gameLog.shift();
}

//Used this check more than once and it's slightly complex so it's going here:
//Check if the target character is a letter or number, nothing in between:
var notASymbol = letter=>!isNaN(letter) || (letter.charCodeAt(0) > 96 && letter.charCodeAt(0) < 123 );

//The main flow of the game. Guess a letter or phrase; if correct, the game is over. Otherwise keep playing until all tries are left
function gameFlow(stateData, args, userMessage){
    var targetString = quoteParser(userMessage)[0];
    //Go through all arguments and find single letters/numbers
    if(!targetString){
        for(var i of args)
            if(i.length === 1 && notASymbol(i)) targetString = i;
    }

    //Check again if we have a target string, otherwise don't do anything
    if(targetString){
        var username = stateData.lMsg.author?.username || stateData.lMsg.user?.username;
        //Guess the word
        if(targetString.length > 50){
            logPush(stateData.log,username+': '+messages.wordErr);
            return {cooldownHit:true};
        }
        switch(stateData.game.guess(targetString.replaceAll(' ','*'))){
            case 'alreadyGuessed':
                logPush(stateData.log,username+': '+messages.alreadyTried+' ('+targetString+')');
            return {cooldownHit:true};
            case false:
                logPush(stateData.log,username + ' guessed: "'+targetString+'"'+messages.incorrectRnd[Math.floor(Math.random() * messages.incorrectRnd.length)]);
                if(stateData.game.wrongStrike()){
                    logPush(stateData.log,messages.maxGuesses);
                    onEnd(stateData,stateData.lMsg);
                    return {endAll:true};
                }
            break;
            case true:
                if(!stateData.game.winCheck()){
                    logPush(stateData.log,username+': '+'Correct! ('+targetString+')');
                    break;
                }
                //If the player wins, intentionally fallthrough to the case below to end the game
            case 'wordCorrect':
                //The player wins!
                logPush(stateData.log,username+messages.correctWord);
                onEnd(stateData,stateData.lMsg);
                return {endAll:true};
        }
    }
}

function game(word,hint, customWord = false){
    this.word = word.replaceAll(' ','*'),
    this.hint = hint,
    this.wordProgress = [], //This will store every letter that has been discovered so far.
    this.hangman = []; //Randomly selected emoji sprites. When this is filled up it's game over.
    this.guesses = [];
    this.customWord = customWord;

    //Automatically fill in symbols and spaces; that would be really hard to guess :P
    for(var i in this.word){
        var targetChar = this.word[i].toLowerCase();
        if(notASymbol(targetChar))
            this.wordProgress[i] = undefined; //Different from an empty array slot. This will help us track if the word is complete
        else this.wordProgress[i] = targetChar;
    }
}

game.prototype.guess = function(str){
    //Is the player guessing an entire phrase? compare it with the original word, and put it in guesses if incorrect:

    //First check to see if this item was already guessed
    if(this.guesses.indexOf(str) > -1)
        return 'alreadyGuessed';

    if(str.length > 1){
        if(str.toLowerCase() == this.word.toLowerCase())
            return 'wordCorrect';
        else{
            this.guesses.push(str);
            return false;
        }
    }

    //This assumes the string is a single letter/number
    if(this.word.toLowerCase().indexOf(str) == -1){
        this.guesses.push(str);
        return false;
    }
    else{
        //We found a letter, we need to fill in every related space based on this.word
        for(var i in this.word)
            if(this.word[i].toLowerCase() == str) this.wordProgress[i] = this.word[i];

        this.guesses.push(str);
        return true;
    }
}

//If we don't have any undefined's, the game was won:
game.prototype.winCheck = function(){
    return this.wordProgress.indexOf(undefined) == -1;
}

//Append a hangman piece to the game, if we hit a maximum piece size, the game is over
game.prototype.wrongStrike = function(){
    var targetEmoji = hangmanEmoji[this.hangman.length];
    this.hangman.push(targetEmoji[Math.floor(Math.random() * targetEmoji.length)]);

    //True is a game over
    if(this.hangman.length == hangmanEmoji.length)
        return true;

    //Nothing returned is considered false and the game progresses.
}

//Stateful functions
////////////////////
function joinCheck(stateData,msg){
    //It doesn't really matter who comes in, just as long as it's announced the player arrives:
    if( (msg.guild && stateData.lMsg.guild) && msg.guild.id != stateData.lMsg.guild.id)
        return {joinable:false, reason: "This command doesn't support playing in-between discord servers"}
    logPush(stateData.log,(msg.author?.username || msg.user?.username)+' joined the game!');
    return {joinable:true}
}

function leaveCheck(stateData,m){
    if(m.user?.id == stateData.rootInfo.host.userId){
        logPush(stateData.log, messages.hostEnd);
        onEnd(stateData, m, 'hostEnd');
        return {leavable: true, endAll: true}
    }
    else{
        logPush(stateData.log, msg.user?.username+' left the game.');
        return {leavable: true}
    }
}

function onFind(stateData, member, msg, args,){
    stateData.lMsg = msg;
    var targetUser = msg.author || msg.user,
        userMessage = msg.options.getString('input') || '';

    //See if the user needs to do some general options:
    if(args.length == 1){
        switch(args[0]){
            case 'help':
                msg.channel.send(messages.howToPlay);
                return {cooldownHit:true, endAll:!stateData.log};
            case 'redraw':
                drawGame(stateData.game,stateData,true);
                return {cooldownHit:true};
        }
    }

    if(!stateData.gameStarted){
        if(!stateData.log){
            stateData.log = [
                targetUser.username+' joined the game!',
                messages.joined,
                messages.quickStart
            ];

            stateData.hostUsername = targetUser.username;
        }
        //Initialize game data.
        //Scan arguments
        if(targetUser.id == stateData.rootInfo.host.userId){
            var phrase = quoteParser(userMessage,'\\|\\|','||')[0],
                hint = quoteParser(userMessage)[0];
            if(phrase){
                if(!/[A-Za-z0-9]/.test(phrase)) logPush(stateData.log,targetUser.username+': '+messages.noValidCharacters);
                else if(phrase.length < 100){
                    stateData.game = new game(phrase,hint,true);
                    stateData.gameStarted = true;
                    logPush(stateData.log,targetUser.username+': '+messages.newWord + " " + messages.spaceToStar);
                }
                else logPush(stateData.log,targetUser.username+': ' + messages.wordErr);
            }
            else if(args.indexOf('rnd') > -1){
                //Grab a random word
                var wordAndHint = wordIndexer.get(Math.floor(Math.random()*wordIndexer.length));
                stateData.game = new game(wordAndHint[0],wordAndHint[1]);
                stateData.gameStarted = true;
                logPush(stateData.log,messages.rndWord + " " + messages.spaceToStar);
            }
        }
        //stateData.gameMsg is an object, so if it doesn't exist, we will create a new message.
        drawGame(stateData.game,stateData,!stateData.gameMsg);
        deleteMsg(stateData.lMsg);
    }
    else{
        var stateMsg;
        //Go through the game routine
        if(targetUser.id == stateData.rootInfo.host.userId && stateData.game.customWord){
            logPush(stateData.log,targetUser.username+': '+messages.hostGuess);
            stateMsg = {cooldownHit:true};
        }
            //Going to move the main game logic to another function. From what I did with tic-tac-toe, it was a nightmare to search around :P
        else stateMsg = gameFlow(stateData, args, userMessage);
        
        drawGame(stateData.game,stateData);
        deleteMsg(stateData.lMsg);
        return stateMsg;
    }
}

function onEnd(stateData,m,reason){
    if(stateData.gameMsg){
        if(reason == 'sessionExpired') logPush(stateData.log,messages.sessionExpired);
        logPush(stateData.log,messages.gameOver);
        //convert the array to a correct answer:
        if(stateData.game)
            stateData.game.wordProgress = stateData.game.word.replaceAll('*',' ').split('');
        //Reveal the answer then draw the game
        drawGame(stateData.game,stateData);
    }
    else console.log("If you're reading this wow you're smart!");
}

module.exports = {
    cmd:'hangman',
    helpText:'Guess the word! ...or the emoji man **dies**',
    uses:4,
    coolTime: 45,
    disabledInDM:true,
    category:'game',
    legacyInputOption:true,
    joinCheck,
    onFind,
    onEnd,
    leaveCheck,
    expires:60*5
}