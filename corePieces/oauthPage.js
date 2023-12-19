/* Made by iSlammedMyKindle in 2022!
Load the oauth page! This is responsible for loading specific discord server commands if applicable
(only a handful will apply to this)

We will have this page here regardless of who adds lemonbot*/
const commandManager = require('./staffStuff.js');
const webServer = require('./webServer');
const personalSettings = require('../personalSettings.json');
const otp = require('otp').parse(process.env.LB_OTP || personalSettings.otp); //If undefined, it will be a random otp, which still denies access
const crypto = require('crypto');

const sessionUuids = {};

//Confirm this is a valid session or oath code; this is the gateway to the rest api being used in this project
const authTest = (req, urlObj)=>sessionUuids[new URLSearchParams(req.headers.cookie?.replaceAll('; ', "&")).get('session')] || urlObj.searchParams.get('otp') == otp.totp();

// https://fusebit.io/blog/discord-rest-api/
// This stackoverflow is using UrlSearchParams instead of FormData... and seems to be working: https://stackoverflow.com/questions/70514979/discord-oauth-error-unsupported-grant-type
webServer.setEndpoint('/oauth', async (req, res, urlObj)=>{
    //Confirm who this user is by looking at the discord ID. If they are a valid user, create a session lasting 10 mintues
    let resFormData = new URLSearchParams({
        client_id: process.env.LB_CLIENT_ID || personalSettings.clientId,
        client_secret: process.env.CLIENT_SECRET || personalSettings.clientSecret,
        code: urlObj.searchParams.get('code'),
        grant_type: 'authorization_code',
        redirect_uri: "http://localhost:3000/oauth",
    });

    var token = await (await fetch("https://discord.com/api/oauth2/token", { method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded', Accept: "application/json"}, body:resFormData})).json();

    fetch('https://discord.com/api/users/@me', {headers:{Authorization: "Bearer "+token.access_token }}).then(async data=>{
        const authJson = await data.json();
        const authedUsers = process.env.LB_AUTHED_USERS?.split(' ') || personalSettings.authedUsers;
        if(authedUsers.indexOf(authJson.id) > -1){
            //I need to write down params because I haven't seen this code in a week -_-
            let uuid = crypto.randomUUID();
            sessionUuids[uuid] = {authJson, timestamp: (new Date()).getTime()};

            res.responseCode = "200";
            res.setHeader('Content-type', 'text/html');
            //Bind the uuid to a cookie so that the session is linked
            res.setHeader("Set-Cookie", "session="+uuid+";");
            res.end("<h1>Successfully Authenticated "+authJson.username+"!</h1>");
        }
        else{
            res.responseCode = "403";
            res.setHeader('Content-type', 'text/html');
            res.end("<h1>"+authJson.username+" isn't allowed to use the bot's rest api</h1>");
        }
    })
});

webServer.setEndpoint('/authtest', async (req, res, urlObj)=>{
    res.setHeader('Content-Type', 'text/html');

    if(!authTest(req, urlObj)){
        res.responseCode = 403;
        res.end('<h1>Invalid authentication</h1>');
        return;
    }

    res.responseCode = 200;
    res.end('<h1>Authentication successful</h1>');
});

//interface to change the commands for other servers.
webServer.setEndpoint('/commands', (req, res, urlObj)=>{
    res.setHeader('Content-Type', 'text/html');
    
    if(!authTest(req, urlObj)){
        res.responseCode = 403;
        res.end('<h1>Invalid authentication</h1>');
        return;
    }

    res.responseCode = 200;
    try{
        res.end(commandManager(urlObj.searchParams));
    }
    catch(e){
        res.end(e);
    }

});

//A routine to sweep out old sessions so that it's not taking up any space.
setInterval(()=>{
    //Delete anything that's been lasting longer than 10 minutes
    for(let i in sessionUuids)
        if((new Date()).getTime() - sessionUuids[i].timestamp > (1000 * 60 * 1)) delete sessionUuids[i];
}, 1000 * 60 * 1)