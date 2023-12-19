//Not necessarily made by iSlammedMyKindle in 2021 XP
//This module deliberately steals code from github to have a fun chatbot from the 60s (https://github.com/brandongmwong/elizabot-js); main differnece is that I'm using my personal github as a backup CDN.
//EDIT: I made changes to my fork in order to have multiple people chat with eliza

//Generic module loading script - honestly could be refactored for other stuff as well.
function load(onLoad = eliza=>{}){
    var resultBuffer = [];
    require('https').get('https://raw.githubusercontent.com/iSlammedMyKindle/elizabot-js/master/elizabot.js',result=>{
        result.on('data',e=>resultBuffer.push(e));
        result.on('end',()=>{
            //This is where the real fun happens
            var script = Buffer.concat(resultBuffer).toString();
            module.exports.eliza = Function('var module = {};'+script+'\nreturn module.exports;')();
            onLoad(module.exports.eliza);
        });
    });
}

module.exports = {load:load, eliza:undefined};