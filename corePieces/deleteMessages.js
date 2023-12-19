//Made by iSlammedMyKindle in 2021!
//Send a random message whenever an interaction is made on discord and we're using stateful commands
var messages = require('../serverSettings.json').deleteMessages;

module.exports = ()=>messages[Math.floor(Math.random() * messages.length)] + '...';