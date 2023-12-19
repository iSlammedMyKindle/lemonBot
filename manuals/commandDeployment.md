# Command Deployment

Salutations sonny boy, would you happen to need a way for sending *exclusive* commands to your friends? Well, this is the place to be!

[There used to be a way to do this]('./staffCommands.md'), but that has since stopped working because discord blocked the one workaround that allowed deploying commands to be done safely on discord. There are other ways to do it sure, but the new method now should be *much* more secure (...and for the most part actually possible). I present to you: **The command deployment server**

This uses a rest API to help you add, remove or query available commnads to put on a server. This can be useful if the bot is deployed already and you don't wanna reset the bot for *dozens* of discord servers, just so your friends can have a couple of new commands on one single discord server.

This happens to be a more advanced feature, so here's a guide on how to set it up.

## Setup

In your environment variables or `personalSettings.json`, you will need different things depending on how you want to login to lemonbot:

* If you want a 6-digit code to authenticate whenever you deploy commands (TOTP), fill in `LB_OTP` with a key (see below).
* If you want to use discord to authenticate, fill in `LB_CLIENT_ID` AND `LB_CLIENT_SECRET`. You will also need `LB_AUTHED_USERS` to be your discord user id. If there are more people you trust, place them in too by separating via space. (`personalSettings.json` is just an array)

There are benefits and tradeoffs for both authentication types

* OTP codes only last 30 seconds, but are the quickest to setup. They are good for brief changes
* Discord authentication lasts up to 10 minutes on the designated browser. You can make more changes without authenticating as much, but this method requires that you have javascript enabled on your browser, so you can't use this method if you want to make something like an automation script.

### For both

Set `LB_CMD_DEPLOYER` to `true`. This activates the server!

### TOTP

This assumes you know how to work with npm modules and have already run `npm install` for lemonbot.

1. To create a key for TOTP (used to make 6-digit codes), go into the lemonbot folder and launch `node`
1. from `node`, run: `new (require('otp'))({name:'lemonbot'}).totpURL`
1. Replace `%3D` at the end of your string with `=`
1. Fill `LB_OTP` in with this string
1. Finally, put this string in an authenticator app! (e.g authy, google authenticator, microsoft authenticator, `pass`). You are good to go!

### Discord

1. Go to [discord.dev](https://discord.dev) and select your app.
1. Copy your `client_id`, and `client_secret` (*not* the bot token! You should already have that!) into `LB_CLIENT_ID` and `LB_CLIENT_SECRET` respectively
1. Don't forget to fill in `LB_AUTHED_USERS`! (See above)
1. launch lemonbot (`node lemon`)
1. Go to `https://discord.com/api/oauth2/authorize?client_id=CLIENT_ID_GOES_HERE&redirect_uri=https%3A%2F%2FyourAmazingLinkGoesHere%2Foauth&response_type=code&scope=identify`
    * Note: lemonbot only uses http because of heroku (they provide free https). If you aren't using heroku, there isn't a configuration at this time that uses https, so it would have to be tunneled somewhow
1. Follow the prompts to authenticate with discord

If you get an almost blank page that says "successfully authenticated [your username here]!", your done! This session lasts for 10 minutes on your browser.

## Now that you're done with setup...

You can now use the rest api. Navigate to `/authtest` to confirm everything's working

For TOTP, it will look something like: `/authtest?otp=123456`

# Usage

All command deployment is done through the web-browser. The api in question is this link: `/commands`. For TOTP, its `/commands?otp=123456`

## `view`

Example url: `/commands?action=view&guild_id=0987654321`

Probably the most basic to understand. List the command groups a discord server has.

In a nutshell, a **group** is a collection of commands all bound together for a single purpose. You could have a group for the `beach`, one for the `city` and another for your `friends`. An example of how groups work can be found in `cfg_samplCfgReservedCommands.js` (old example XP)

## `grant`

Example url: `/commands?action=grant&guild_id=0987654321&groups=group1 group2 group3`

Add all groups (separated by space) to this discord server. This adds all of those collections of commands in one swoop

## `remove`

Example url: `/commands?action=remove&guild_id=0987654321&groups=group1 group2 group3`

The exact opposite of the above, removes commands instead of adding them

## `clear`

Example url: `/commands?action=clear&guild_id=0987654321`

Takes all deployed commands out of a server. Any commands that are distributed to everyone (global commands) remain in-tact. It's just the ones that are in `group`s that are removed.