//Stripped-down template for statefull commands based on stateTest.js
function joinCheck(stateData,m){}

function leaveCheck(stateData,m){}

function onFind(stateData, member, msg, args){}

function onEnd(stateData,m,reason){}

module.exports = {
    cmd:'nameHere',
    helpText:'help description goes here',
    uses:4,
    coolTime: 30,
    disabledInDM:true,
    category:'single word like game tool or text. Blank for misc',
    joinCheck:joinCheck,
    onFind:onFind,
    onEnd:onEnd,
    leaveCheck:leaveCheck,
    expires:60*5
}