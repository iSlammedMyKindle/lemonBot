var commandCore = require('./commandCore'),
    cmdCompilation = require('./corePieces/cmdCompilation');
// var imgurApi = require('./lemonModules/memeModules/imgurApi'),
    // imgurToken = require('./personalSettings.json').external.imgur.token;


function testBuildCommandList(){
    cmdCompilation.buildCommandList();
    
    console.log(1);
}

async function testImgurApi(){
    imgurApi.token = imgurToken;
    var goodResult = await imgurApi.loadGallery('aTVv8rZ');
    // var badResult = await imgurApi.loadGallery('fakeerror');
    console.log(1);
}

async function testSyncedAlbum(){
    imgurApi.token = imgurToken;
    var testAlbum = new imgurApi.syncedAlbum(undefined,'asdf',-1);
    testAlbum.refObj.testThingy = ["amazingLinkHere"];
    await testAlbum.sync(true);

    console.log(1);
}

testBuildCommandList();