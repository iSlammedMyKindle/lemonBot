/*Made by iSlammedMyKindle in 2021!
This file is imported only if overall statistics are enabled. It launches a very tiny webserver that sends a JSON file of the most recent changes as of 10 minutes ago.
Some analytics are reset after about a week of the bot being online.*/
const { setEndpoint } = require('./webServer');

var defaultServerSettings = {
    "port":3000,
    "contentHeaders":[
        ["Access-Control-Allow-Origin","*"],
        ["Content-type","application/json"]
    ]
}

function trackedAnalytics(serverSettings = defaultServerSettings, checkEvery = 60000, resetAfter = 604800000){
    //The resetAfter represents one week: 1000 * 60 * 60 * 24 * 7
    this.serverCount = 0;
    this.commandsOfTheWeek = {};
    this.cachedJson = '';
    this.weeklyTimeStamp = new Date().valueOf();
    this.resetAfter = resetAfter;
    this.checkEvery = checkEvery;
    this.checkInterval = undefined;
    this.serverSettings = serverSettings;
}

trackedAnalytics.prototype.recordServerCount = function(){
    this.serverCount++;
    this.changed = true;
}
trackedAnalytics.prototype.recordCommandsOfTheWeek = function(cmd){
    if(!this.commandsOfTheWeek[cmd]) this.commandsOfTheWeek[cmd] = 0;
    this.commandsOfTheWeek[cmd]++;
    this.changed = true;
}

trackedAnalytics.prototype.cacheStats = function(){
    //First, sort out commands by most used, only show three:

    //...But before that let's clear out the commands of the week if applicable
    if(this.weeklyTimeStamp + this.resetAfter < new Date().valueOf()){
        this.commandsOfTheWeek = {};
        this.weeklyTimeStamp += this.resetAfter;
    }
    this.cachedJson = JSON.stringify({serverCount:this.serverCount, commandsOfTheWeek:Object.entries(this.commandsOfTheWeek).sort((e,f)=>e[1]>f[1]?-1:1).slice(0,3).map(e=>e[0])});
}

trackedAnalytics.prototype.startServer = function(){
    setEndpoint('/', (req,res)=>{
            for(var header of this.serverSettings.contentHeaders)
                res.setHeader(...header);
            res.end(this.cachedJson);
            /*console.log(req,res)*/
        });
    this.checkInterval = setInterval(()=>this.cacheStats(),this.checkEvery);
    this.cacheStats();
}

module.exports = trackedAnalytics;