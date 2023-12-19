//Made by iSlammedMyKindle in 2021!
//lemon.js is in the process of being cleaned up. One of these things being sorted out is the responses lemonbot makes when somebody remarks with a special set of wors
const rndAction = require('../lemonModules/rndAction'),
    { canSendMessages } = require('../corePieces/botSendPermissionCheck'),

    //I haven't put an emoji inside a text file until today, it feels weird.
    emoji = {
        'brain': '🧠',
        'bigCry': '😭',
        'cool': '😎',
        'confounded': '😖',
        'cry': '😢',
        'exploding': '🤯',
        'expressionless': '😑',
        'eyeroll': '🙄',
        'flushed': '😳',
        'frown': '☹️',
        'gradcap': '🎓',
        'lying': '🤥',
        'mecharm': '🦾',
        'moneyface': '🤑',
        'nerd': '🤓',
        'scrunched': '😣',
        'smirk': '😏',
        'starstruck': '🤩',
        'woozy': '🥴',
        'zombieF': '🧟‍♀️',
        'zombieM': '🧟‍♂️'
    };

//Reactions are the way lemonbot responds back whether that be an emoji or a message to users.
var reactions = {
    bigDumb: [
        'brain',
        'woozy',
        'zombieF',
        'zombieM'
    ],
    bigBrain: [
        'brain',
        'exploding',
        'nerd',
        'gradcap'
    ],
    hi: [
        'Howdy!',
        'hiIneedattention',
        'sup n00b',
        'Hi!',
        'Hello!',
        'salutations and the most epic of greetings to you as well.'
    ],
    bye: [
        'Oh... ok bye ' + emoji.cry,
        'Toodaloo!',
        'Seeyalater!',
        'good ridd-OH I MEAN UH... farewell fine friend!',
        'Noooo... don\'t goooo ' + emoji.bigCry,
        'Take care!',
        'Bye!',
        '`$ sudo shutown now` ' + emoji.brain
    ],
    fly: [
        "https://i.imgur.com/gfBkQrP.png\nWheeeeee!",
        "Did you know that airplanes are safer rides than trains?!",
        "Where to? I can fling myself to 42 pefect locations!",
        "I'm the best flight simulator pilot on this fine earth! (unlike my dad)",
        "In the year 3000, my bretheren will know how to fly those mini drones instead of falling off those plants and hitting our head " + emoji.woozy + (" (I got a serious head start though)")
    ],
    die: [
        'No ' + emoji.frown,
        '...that wasn\'t very nice ' + emoji.cry,
        'But I like being alive! ' + emoji.starstruck,
        '*PSYCHE* - Robots last forever ' + emoji.mecharm,
        'Nahhh, don\'t really feel like it ' + emoji.smirk
    ],
    why: [
        'Because! ' + emoji.starstruck,
        'A question of which can be answered by transgressing into the 4th dimension',
        'idk lkasdflkpoi12u34',
        'I DUNOOOOOOOO ' + emoji.bigCry,
        'Great question! I\'ll be sure to inform you by next Tuesday',
        '~~Rylan did it idk~~',
        'I have come to the conclusion, that I have no idea ' + emoji.cool
    ],
    spy: [
        'psst... hey; you wanna buy an 8?',
        'I\'ve searched through my databases... it appears *you* have woken up today',
        'According to my resources - it is apparent that you have blinked',
        'You\'re not gonna believe this, but it\'s been exposed that someone around your neighborhood had the hiccups',
        'My insider scoop is that 1+1 is not 3... unfortunately',
        'My research has concluded... and there appear to be consistent inconsistencies, along with inconsistent consistencies...',
        'https://i.imgur.com/y6VTYwZ.png\nThe name\'s Bot... Lemonbot. How may I be of service?'
    ],
    jojoReference: [
        'expressionless',
        'eyeroll',
        'lying',
        'flushed'
    ],
    pie: [
        '' + Math.PI,
        '🥧',
        'https://www.youtube.com/watch?v=cUiwqZDUn-M',
        'https://www.foodnetwork.com/recipes/food-network-kitchen/classic-lemon-meringue-pie-5608977',
    ],
    pizza: [
        "Don't forget anchovies!",
        "with pineapples",
        "I like cold pizza for breakfast",
        "with bacon; contrary to mom it's not a waste of money",
        "+ flatbread",
        "add stuffed crust plz",
        "remember the garlic dipping sauce!",
        "the perfect food",
        "make it an extra-large pizza plz",
        "🍕"
    ],
    pog: [
        'cool',
        'mecharm',
        'moneyface',
        'starstruck'
    ],
    sadness: [
        'bigCry',
        'confounded',
        'cry',
        'frown',
        'scrunched'
    ],
    ratsCheese: [
        '🧀',
        '🐀',
    ],
    canes: [
        '🐔',
        '🐣',
        '🍗',
        '🐓',
        '🐤',
        '🐥'
    ]
};

function genericResponse(m, reactionList, mysteryObj){
    if(mysteryObj?.isMystery) return rndAction(0, e=>mysteryObj.callback({content: e}), reactionList);

    if (!canSendMessages(m)) return;
    rndAction(0, e => m.reply(e), reactionList);
}

//Lemonbot scans these and checks if the message includes the exact phrase (lower case). If this happens, he executes the respective phrase.
var responses = {
    'hi lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.hi, mysteryObj),
    'bye lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.bye, mysteryObj),
    'die lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.die, mysteryObj),
    'fly lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.fly, mysteryObj),
    'pie lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.pie, mysteryObj),
    'why lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.why, mysteryObj),
    'spy lemonbot': (m, args, mysteryObj) => genericResponse(m, reactions.spy, mysteryObj),
    'cheese': m => {
        rndAction(10, e => m.react(e), reactions.ratsCheese);
    },
    'pizza': m => {
        if (!canSendMessages(m)) return;
        rndAction(10, e => {
            if (e == '🍕') m.react(e);
            else m.reply(e);
        }, reactions.pizza);
    },
    "canes": m=>rndAction(5, e => m.react(e), reactions.canes),
    'pog': m => rndAction(5, e => m.react(emoji[e]), reactions.pog),
    'jojo reference': m => {
        var chance = Math.floor(Math.random() * 5);
        if (chance === 0) {
            var selectedReaction = Math.floor(Math.random() * reactions.jojoReference.length);
            m.react(emoji[reactions.jojoReference[selectedReaction]]);
        }
        else if (chance === 4 && canSendMessages(m)) m.reply('Yare, yaredaze...');
    },
    'big dumb': m => rndAction(5, e => m.react(emoji[e]), reactions.bigDumb),
    'big brain': m => rndAction(5, e => m.react(emoji[e]), reactions.bigBrain),
    'sadness': m => rndAction(5, e => m.react(emoji[e]), reactions.sadness),
    '.': m => {
        if (m.content == '.') rndAction(5, () => setTimeout(() => m.channel.send('.'), 2000))
    }
}

responses['pi lemonbot'] = responses['pie lemonbot'];
responses.rats = responses.cheese;
responses["cane's"] = responses.canes;

module.exports = {
    responses: responses,
    cooldowns: {
        'xiLemonbot': {
            isGroup: true,
            coolTime: 30,
            uses: 2,
            glue: true,
            commands: ['fly lemonbot', 'pie lemonbot', 'pi lemonbot', 'why lemonbot', 'spy lemonbot']
        },
        'hibye lemonbot': {
            isGroup: true,
            coolTime: 30,
            uses: 3,
            commands: ['hi lemonbot', 'bye lemonbot']
        },
        'die lemonbot': {
            //14 days
            coolTime: 1209600,
            uses: 5
        },
    }
};