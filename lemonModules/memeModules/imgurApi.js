//made by iSlammedMyKindle in 2021!
//The imgur api allows bots with this framework to grab the ID's and descriptions of galleries found on imgur, the heart of all meme commands.

const isMocking = false; //I'm offline in the middle of the interstate... I think I need this to move forward -_-
var https = isMocking ? undefined : require('https'),
    multiDimIndexer = require('../multiDimIndexer');

const getJson = isMocking ? require('./imgurMock.js') : async function(url){
    var resBuffer = [];
    return new Promise((resolve)=>{
        https.get(url, res=>{
            res.on('data', chunk=>resBuffer.push(chunk));
            res.on('end',()=>{
                var resultJSONStr = decodeURI(Buffer.concat(resBuffer).toString());
                try{
                    resolve(JSON.parse(resultJSONStr)); //Apparently imgur places in \ in-between literally everything
                }
                catch(e){
                    console.error('For some reason, this couldn\'t be parsed into json:', resultJSONStr);
                }
            });
        });
    });
};


//Returns a promise that contains the resulting gallery JSON
function loadGallery(galleryId){
    try{
        if(!module.exports.token) console.error('I need an imgur api token so I can look at galleries! Add one by putting in the module\'s "token" variable');
        if(!galleryId) console.error('I need a gallery ID to bring back a list! Please supply one');

        return getJson('https://api.imgur.com/3/album/'+galleryId+'?client_id='+module.exports.token);
    }
    catch(e){
        console.error(e);
        return;
    }
}

function syncedAlbum(refObj = {}, id, syncAlbumEvery=(60 * 1000 * 60)){
    //Make the json a copy instead of the original so we keep the original point of reference
    this.compiledIndexer;
    this.refObj = refObj;
    this.imgurCache = { data:{ images:[] } }; //If just a manual sync is desired (e.g changing the reference object instead of syncing from remote), the cache exists to insert the previous results.
    this.id = id;
    this.syncRoutine;

    if(this.id){
        if(syncAlbumEvery > -1) this.syncRoutine = setInterval(()=>{this.sync()}, syncAlbumEvery);
    }
    this.sync();
}

syncedAlbum.prototype.sync = async function(localSyncOnly = false){
    var newJson;

    if(!localSyncOnly && this.id){
        newJson = await loadGallery(this.id);
        if(newJson && newJson.status != 200){
            console.error("I could not sync anthing for "+this.id+"...", newJson.status,newJson.data?.error);
            newJson = undefined;
        }
        else console.log("("+new Date()+") Successfully synced album with id: ",this.id);
    }

    if(!newJson) newJson = this.imgurCache;
    else this.imgurCache = newJson;

    //Now for the actual syncing process - I'd like to make sure it's synced a couple of ways, first if an image was removed from the url, and second if it was hard-coded into the bot.
    //Check the loaded JSON between the original and our synced.   
    
    //Create a copy of the reference JSON if it exists. Reference JSON is good for if there are links to images that should not be removed from the code.
    let finalObj = JSON.parse(JSON.stringify(this.refObj));
    for(let i of newJson.data.images){

        let descriptionJson;
        try{
            //If the description contains JSON, the body should look something like this: {"author":"authorNameHere", "created":true}
            //If "created" is false, commands using this meme will specify this as "submitted by" instead to differentiate artwork made by the individual who submitted it.
            descriptionJson = JSON.parse(i.description);
        }
        catch(e){
            //There's no json to gather more details about the image
            descriptionJson = {author:i.description};
        }

        let newObj = false;
        if(!finalObj[descriptionJson.author]){
            finalObj[descriptionJson.author] = [];
            newObj = true;
        }

        if(newObj || finalObj[descriptionJson.author].indexOf(i.link) == -1) finalObj[descriptionJson.author].push([i.link, descriptionJson.created]);
    }

    this.compiledIndexer = new multiDimIndexer(finalObj);
}

module.exports = {
    token:'',
    loadGallery,
    syncedAlbum
}