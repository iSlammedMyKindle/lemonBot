//Made by iSlammedMyKindle in 2021!
//Im on the inerstate waiting for my family to reach a destination. While this is happening, I want to test getting outside resources and make sure the code at least flows.
var dummyJson = {
    '/album/fakeerror/':{
        "status":400
    },
    '/album/':{
        "data":{
            "images":[
                {"description":"ohaithere", "id":"a1b2c3", "link":"https://i.imgur.com/a1b2c3"},
                {"description":"ohaithereagain", "id":"d4e5g6", "link":"https://i.imgur.com/d4e5g6"},
                {"description":"ohaithereAGAIN?!", "id":"h7i9j10", "link":"https://i.imgur.com/h7i9j10"}
            ]
        },
        "status":200
    }
}

module.exports = function(url){
    for(let i in dummyJson)
        if(url.indexOf(i) > -1) return new Promise(resolve=>resolve(dummyJson[i]));
}