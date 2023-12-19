//Made by iSlammedMyKindle in 2021!
//Miscelanious items that work well on their own for supporting slash commands
var slashCommandDelMessages = require('../../corePieces/deleteMessages');

module.exports = {
    deleteMsg:function(m, isInteraction){
        m.reply(slashCommandDelMessages()).then(()=>m.deleteReply());
    }
}