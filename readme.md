# Lemonbot

![Lemonbot avatar](./readmeAssets/lemonBot.png)

Lemonbot is a friendly all-around Discord bot that hosts a variety of tools and memes! He is based on [Discord.js](https://discord.js.org/#/) and also happens to be the older brother and base of [Printerbot](https://github.com/iSlammedMyKindle/printerBot). General code is shared between the two bots.

## Features

* `/age` - Find out the age of two discord accounts
* `/back` - !naidrocsid gnuoy eikooc trams a er'uoy yeh ho
* `/creepy` - tYpE lIkE a CrEePy PeRsOn
* `/dateadd` - Add numbers to find out what date it lands on
* `/datediff` - Use two dates to find the total of days between eachother
* `/dumbot` - Ask an intelligent question
* `/e` - b[e] r[e]sponsibl[e] with this on[e]
* `/eliza` - Your local therapist from 1966, she will help with all of your problems!
* `/essayshrink` - lookingtoshrinkyouressaydowntothemaximumlettercount? Look no further!!
* `/gamerfy` - Mak3 y0ur 73x7 gam3r 57yl3.
* `/lemon` - go meta and meme using the fruity memer himself
* `/math` - Do Stonks
* `/mock` - End all your debates instantly with the power of mocking spongebob!
* `/namejumble` - Fuse up to 4 usernames together for an abomination
* `/ohno` - Send a random meme! You never know what comes next with this one! (Created for Darth Plagueis!)
* `/owo` - Wouwd you wike tow twy dhiz cwommand???
* `/rnd` - Ask for a random number
* `/shuf` - Randomize a list of things
* `/wisdom` - Recieve good advice from a wise man
* `/wordcount` - Discover the top 15 words in your sentence!

And most importantly, a guy named Rylan

![RylanStylin](./readmeAssets/rylan.png)

## [Games](./manuals/sessionsAndGames.md)!

Lemonbot is loaded with home-grown techniques designed to help you play games! He can play...

* `/hangman` - Guess the word! ...or the emoji man dies
* `/mmind` - Mastermind: A game of logic to crack the code of your opponent!
* `/tttoe` - A casual game of tic-tac-toe, but with discord friends!

And to jump in and out of said games:
* `/join`
* `/leave`
* `/sessions`
* `/switch`

## Administrative & development features
* Command cooldowns - every default command in lemonbot's arsenal has a way of knowing how often each discord member uses a command. If somebody uses that command too much, lemonbot will get tired and a cooldown is set for that user. For example, `/math` can be used 3 times every 25 seconds.
    * Command groups - Commands can share the same settings and can even depend on eachother in that usage of one command can affect all the others cooldown wise.
* Custom commands - Make lemonbot yours by adding custom commands and other functionality! To get started, visit [cfg_sampleConfig.js](./cmdPriv/cfg_sampleConfig.js)
    * Custom configuration can go well beyond this file, anything with the pattern `cfg_nameHere.js` will be read as well, allowing for private configuration to be super modular.
* A base for other bots - Lemonbot provides (and already is!) a fast base for new command-based projects! If you want to go much further than using private commands, allot of technologies are ready to go and just about everything is module based. Lemonbot can't take the full credit though as so much of the versatility originates from the power of node.js and [Discord.js](https://discord.js.org/#/) So please check them out for more granularity and documentation!
* An arsenal of commands - lemonbot comes with a powerful set of administration commands that allow filtering of text channels and moving everyone around do different voice channels! Straight from `/adminhelp`:

* `/del` - *Remove messages from the channel you called this command from* - provides a powerful querying syntax that can allow you to grab very specific messages while leaving some out
* `/move` - *Takes messages out of this channel and puts them in another of your choice* - uses the querying syntax of ?del to allow granularity.
* `/mute` - *Mutes entire voice channels (or groups of), if you add a number it will stay muted for that number in minutes*
* `/umute` - *Un-mutes an entire channel or groups of channels.*
* `/voisplit` - *Put everyone randomly (but evenly) into different voice channels* - if you have 6 users in one voice chat room and have two other chat rooms, this command will spread everyone out into groups of 2 amongst selected rooms.
* `/raid` - *Move entire voice channels into another channel* - you can select multiple channels and group everyone into the last mentioned channel in the command.

# Instruction manuals

The non-admin commands are pretty straightforward to use. The admin commands however can go very in-depth. Because of this, and manual was written to demonstrate Lemonbot's abilities.

[Check this link](./manuals/adminCommands.md) to open the manual

There's also brief documentation on [how to use session/game commands](./manuals/sessionsAndGames.md)

If you are deploying lemonbot, these commands can help you segregate new commands you're building: [Staff Commands](./manuals/staffCommands.md)

# Deploying Lemonbot

Every lemonbot deployment requires the minimum steps:

* install node.js
* `npm install`
* Creating a bot and bot token

Lemonbot is OS independant because of node.js. To install it, visit [node.js' website](https://nodejs.org) to put it on your machine, or if you have debian/ubuntu linux:

`sudo apt install node`

Next, clone this repository. Navigate to this folder via command line / terminal and type `npm install`. This will install discord.js in the folder that holds this project.

Lemonbot cannot run without a bot account, so navigate to discord's [Developer portal](https://discord.com/developers/applications) and make an app. Inside you'll find the ability to also make a bot. From here, you can grab the token, which you will need to place inside the [personalSettings.json](./personalSettings.json). **Note: If you want to deploy on heroku or another cloud service, place this and other items in Environment variables as mentioned below** Also look for *your client id* as well for lemonbot, you will need to put it in the url we're making below.

When all of that is said and done, navigate to this link to put lemonbot on your server:

https://discord.com/oauth2/authorize?client_id=yourClientIdHere&scope=bot&permissions=20981760

It should ask which discord server to add this to; go through the recaptcha and your done!

All that's left is to launch lemonbot from the terminal:

`node lemon`

If you see him come online, congratulations, He can now accept commands! Hitting `/` in the chat box is a good place to start.

## Environment variables

* `PORT` - If the bot statistics are on, specify the port at which the web server will run.
* `LB_TOKEN` - Place your token here instead of personalSettings.json if you are deploying this on a cloud service like heroku
* `LB_STATS` - Allow people to view basic analytics of the bot in JSON format by visiting the port as mentioned above.
* `LB_SYMBOL` - The symbol lemonbot will use for commands (e.g instead of ?rylan, `%` could be set so commands are called through `%rylan`)
    * **Note**: Vanilla lemonbot no longer uses this symbol. For the sake of the engine for use in other bots, it's still possible to use this if manually enabled through serverSettings.json, but lemonbot specifically does not have many commands that support the legacy symbol. (Every command has moved to slash commands)
* `LB_IMGUR_TOKEN` - In order to view the latest memes from `/lemon`, `/ohno`, and `/rylan`, imgur requires a `client_id` for an application. Once you have it, place it here and new memes will be synced to the deployment. If this is not used, there should be existing memes to fill in the gaps, however, there will be errors in the console once every hour due to the fact there is no token in place.
    * The `personalSettings.json` alternative to this is `external.imgur.token`
* `LB_RESERVED_CMDS` - (optional) JSON that determines what private commands go to which server. More info on the structure can be found in the manual: [Staff Commands](./manuals/commandDeployment.md)

### Optional vars for command deployment

Discord only permits users with admin permissions to change the visibility of commands now. Because of this, there is now a method of deploying commands that doesn't rely on discord to do. It can be done via discord authentication, or otp. See [here](./manuals/commandDeployment.md) for more info.

* `LB_CLIENT_CMD_DEPLOYER` - Enables a dedicated web server for deploying commands. If this is disabled, the other variables below are not required to launch the bot.
* `LB_CLIENT_OTP` - This is a 64-bit key that turns into a TOTP number. You can use this on something like Google Authenticator or `pass` so you can deploy commands without authenticating on discord. If this is present, the other two below can be left blank
* `LB_CLIENT_ID` - The client ID associated with your discord bot. Used for discord authentication
* `LB_CLIENT_SECRET` - Secret key (*not* bot token!) associated with the discord bot. Used for discord authentication as well.

## Heroku

Heroku is how I'm deploying lemonbot for personal use. I would recommend visiting [Heroku's website](https://heroku.com) for learning to deploy over there. When finished, come back here.

In my configuration, I have a dedicated branch for hosting personal changes separate from the master branch. This allows `master` to stay clean of api keys and personal changes master wouldn't need.

Create a branch based on master:

```
git branch herokuBranch
git checkout herokuBranch
```

Add your bot's token to `personalSettings.json`, commit the changes and deploy to heroku:

```git push heroku herokuBranch:master```

Note the special syntax: `herokuBranch:master`. This means our new branch is pretending to be master. With this, if you decide to contribute to master or you get the latest changes, they won't conflict with your personal work. When you want to get lemonbot updates, either pull from master while on `herokuBranch`, or visit the master branch, pull, then merge `herokuBranch` with master.


## Procfile

In the procfile ther are two entries:

`web` - This resource is required if you want to use the bot stats web server.
`discord` - if you *don't* want bot stats, enable this item and disable `web`

Only use one or the other if you are deploying to heroku Depending on what you want to do, you will have to use `heroku ps:scale` to make one of these resources set to 0

# Special Thanks & Credits

* To the folks in our local friend group (limewithease) - I have no words but thank you. It's been a pleasure to Build lemonbot thus far. While I wasn't expecting to really accelerate him to where he is, it's by far all of you having fun with him that keeps my motivation burning to keep him fun! The path for lemonbot is not over as I write this, and I sincerely hope we can continue to pave a fruity future!

* Additional thanks for Renegace32, RylanStylan and Platinummink for contributing new features to lemonbot. All three of you have learned allot just by coding a few lines, and it brings to lemonbot some unique spice as a result of that as well.

* Yet another special thanks to lemonbot's second home: "King George II's Royal Court" where he was humourously knighted a "royal bot". This server was an important step to test his performance learned from limewithease, and in the end I made allot of friends jumping in to the server as well. All of you are awesome and thank you for also using lemonbot!

* One last thanks to @PT_P (Royal court) for founding the community server. I most likely would have started it much later, but now it's here and will probably grow fast. Right now it's just 5 curious members, but here's to wild ride in the future!

# License

![Creative Commons Attribution License](https://i.creativecommons.org/l/by/4.0/88x31.png)

This work is licensed under a [Creative Commons Attribution 4.0 International License.](http://creativecommons.org/licenses/by/4.0/)
