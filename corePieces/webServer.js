/*Made by iSlammedMyKindle in 2022! 
This file is responsible for the web server logic. Since heroku is being used as a base for this project's deployment, we can only use one web server & port combo.
This location will centralize that server, and other things that need to be run from other files will be tied into this as well.*/
const http = require('http');

const httpServer = http.createServer((req, res)=>{
    const urlObj = new URL('http://example.com'+req.url);
    if(endpointList[urlObj.pathname])
        endpointList[urlObj.pathname](req, res, urlObj);
    else{
        res.statusCode = 404;
        res.write('404 - not found');
        res.end();
    }
}),
    endpointList = {};

httpServer.listen(process.env.PORT || require('../serverSettings.json').webServer.port);

module.exports = {
    setEndpoint: (url, action)=>endpointList[url] = action
}