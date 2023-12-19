//Begrudgingly made by iSlammedMyKindle in 2021 -_-
//This is my workaround for a circular dependency that's happening in commandCore.js and it's kindof dumb.
//cmdCompilation and lemon.js both need this dependency because compiling commands needs a list of items, but they don't exist until commandCore is done loading, which in-turn happens to load cfg_staffStuff -> cmdCompilation. [insert head explosion here]

//List functions that will take the module.exports of commandCore as it's parameter. Be careful not to overwrite functions for other modules.
module.exports = [];