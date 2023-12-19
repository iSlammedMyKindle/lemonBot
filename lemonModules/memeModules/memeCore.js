//Made by iSlammedMyKindle in 2021!
/*MEEEEME CORRRRRRRRRE - /rylan, /lemon, /ohno & any future category of memes will be synced to a science via imgur... or not; depends on the deployer's needs
Memes can either be local or synced. If for some reason they can't be synced, they will stay as they are locally. Changes from the imgur album will be reflected only with images
found there, and won't delete items hard-coded items inside memeConfig.json*/
const imgurApi = require('./imgurApi'),
    memeConfig = require('./memeConfig.json');

//This needs to run before anything can be retrieved randomly
function initConfig(token, externalAlbumConfig){
    imgurApi.token = token;
    //Scan for albums two ways! First through the pre-determined ones (memeConfig.json) & then through externalAlbumConfig. If there are some that inter-twine, they will be merged into one album
    for(let i in memeConfig)
        //Doesn't matter if the external album exists there or not, if it's undefined then there's nothing to sync
        module.exports.albums[i] = new imgurApi.syncedAlbum(memeConfig[i], externalAlbumConfig[i])

    for(let i in externalAlbumConfig)
        if(!module.exports.albums[i]) module.exports.albums[i] = new imgurApi.syncedAlbum(memeConfig[i], externalAlbumConfig[i]);
}

module.exports = {
    albums:{},
    initConfig:initConfig
}