# Admin Commands Manual

Lemonbot is capable of many commands. The admin commands specifically are different than standard commands however in that:

1. They feature a special cooldown system not present in other commands in vanilla lemonbot. See the bottom on this page for more info.
1. They are reserved only for server members with permissions required to run each command.

These commands are capable of destroying a server's message history if not careful, so to properly use them, make sure you have a practice environment where it won't cause major damage.

## Initial setup

To use these commands, you either need to be the server owner, or somehow have an administration rank either through individual member permissions or a "role". Be sure only to grant a role like this to individuals who are trusted in the server, as once again these commands can cause destruction. Before installing lemonbot, please make sure everything` is in place.

Non-admins will receive this message when launching an admin command:

`Sorry, it looks like there aren't any admin commands that can be run. Contact the local admin to get some perms!`

Members without permissions can see which ones they don't have by running any command they wish to run. This will work twice before executing a 1 hour cooldown for that member. Members with proper perms will override this cooldown.

# Commands

## `/adminhelp`

**Required Perms: None**

If for some reason you can't find this document or need a quick set of tips, this command is here to provide quick descriptions of every command your mod has permission to use. No special syntax is needed to use it.

## `/del`

Option name | Description | Required
-- | -- | --
quantity | From 1-100, how many messages are you aiming to delete? If you have users or quotes, this changes to "how many messages am I searching through?" | y
query | can be many things at once, from channel names (`#burger-joint`) to specific phrases (`"search for me!"`) to even selecting every channel in the server (`*`) |
show-progress-to-channel | (Default: `False`) If set to true, announce to the whole channel you are deleting messages in multiple channels | 
user[1-5] | Only delete messages from these users | 


* **Required Perms: Manage Messages**

`/del` is capable of deleting up to 100 messages at one time. These messages can be filtered out by who sent it, as well as the contents.

Here are some examples of how to use it:

```
/del quantity:10
```

Probably the simplest example, delete 10 messages starting with the most recent. Next:

```
/del quantity:5 user1:@cottonEyeJoe
```
This reads slightly differently. Instead of directly being 5 messages, it now says "delete @cottonEyeJoe's messages within a 5 message range"

In other words, the number `5` is how far you want to search for things to delete. If there are `4` messages from @cottonEyeJoe from your range of 5, only those 4 will be removed.

Here's one more main example:
```
/del quantity:20 query:"blood" "guns" "romance" user1:@cottonEyeJoe user2:@ironMouthSteve
```

This reads as "within a 20 message range, remove messages from @cottonEyeJoe or @ironMouthSteve which have the keywords 'blood', 'guns' or 'romance'". Emphasis on **or**. Not all of these words or users need to be in the message to be removed, just one of them.

## `/move`

Option name | Description | Required
-- | -- | --
quantity | From 1-100, how many messages are you aiming to move? If you have users or quotes, this changes to "how many messages am I searching through?" | y
query | can be many things at once, from channel names (`#burger-joint`) to specific phrases (`"search for me!"`) to even selecting every channel in the server (`*`) |
quiet-move | (Default: `False`) If set to false, the move of all messages will be announced to the users of the channel | 
user[1-5] | Only delete messages from these users | 

Good work, you know how to use `/del`! Ready for `/move`?! It's a hefty one. You sure? Ok here it goes:

*PSYCHE* - it's the same patterns as `/del` XD

...almost

Really the only other piece to it is the *moving* aspect of it. Specifically, where you would like to place the messages you find:

```
/move quantity:20 query:"blood" "guns" "romance" #westerns user1:@cottonEyeJoe user2:@ironMouthSteve
```

Syntax is roughly the same as `/del`, the main difference of this however is `quiet-move`, it takes place of `show-progress-to-channel`, except the default is flipped. 

### `/del *` & `/del query:#channelName`: Deleting messages from multiple channels

I'm a bit lazy to continue the dialog I created above for `/del` & `/move`... so here's a new section XP

This feature allows admins to remove messages either in a few selected channels, or *every text channel in the server*. The syntax works exactly the same as you would with one channel, except now, the number you place in will affect each channel individually! For example:

```
/del quantity:3 query:#hiddenPalace #general #memes
```

This removes 9 messages in total! 3 in each channel. Now, lets say you don't want to put in every channel, and instead delete messages from *every* channel. Well, that's where `*` comes in:

```
/del quantity:3 query:*
```

**Be careful** with this command! Depending on your server size, the eventual task is both time consuming and potentailly very damaging in the end... But then, why does this feature exist?

It was specifically designed for an attack I'm gonna nickname a "omMMEbl" (oh-mee-ble) - one man many message blast. While the word is completely made up, the very real attack is when a user goes through all channels and puts down x amount of messages per-channel. When this happens, the command is on your side, as all existing syntax and criterea work! You can set 100 as the maximum message deletion count for all channels.

If the command had the `show-progress-to-channel` option set to true, it will display the progress to everyone.

## `/mute & /unmute`

Option name | Description | Required
-- | -- | --
channel[1-5] | which voice channels do you want muted? | Just channel1
other-channels | More voice channels you want muted. Advanced syntax that requires you remember the full name of the voice channel in quotes (e.g "my voice channel") | 
duration | how long should the mute last for? (5 seconds: `:5`) (1 minute, 15: `1:15`) (1 hour, 3 seconds: `1:0:3`) |

**Required Perms: Mute Members**

These are fairly simple to use. As emphasized by the names themselves, the commands' purposes are to mute and unmute voice channels.

Voice channels are specified through `channel1: my awesome voice channel` - though, discord does not (yet) differentiate voice channels and text channels. Just note that this is a *voice* channel command only.

If somehow more channels need to be muted than 5, the option - `other-channels` allows this to be done; however, you need to know the full name of the voice channel. Another limitation is that because this option only looks at the name, it can't distinguish between channels with multiple names. Therefore, it's ideal to use the `channel1` through `channel5` options.

Example usage:
```
/mute channel1:saloon channel2:spagetti and meatballs duration:2
```

Voice channels "saloon" and "spagetti and meatballs" will be muted for 2 minutes. If a number isn't provided, the default is 5.

You can also add a timestamp instead of a regular number so you can have hours, minutes and seconds.

All of these turn into valid timestamps:
```
two minutes, one second
/mute channel1: saloon duration: 2:1

1 hour, 5 minutes and 3 seconds
/mute channel1: saloon duration: 1:5:3

30 seconds
/mute channel1: saloon duration: :30

90 minutes and 8 seconds
/mute channel1: saloon duration: 90:08
```

For `/unmute`, the syntax is the same but `duration:` isn't available as an option:

```
/unmute channel1: saloon
```

This will unmute "saloon" before it's time is done. If there were any people manually server muted before launching the command they will also be unmuted.

**Important** - If anyone leaves the voice channel while the command is being enforced, they will remain server muted if they don't come back after the time is up for any channels. This also means they can be server-muted in one channel, but get unmuted if they visit another channel if that channel's mute time is about to run out.

## `/voisplit`

Option name | Description | Required
-- | -- | --
channel[1-5] | The channels you want to split everyone up into | `channel1` & `channel2`
other-channels | More voice channels - Advanced syntax that requires you remember the full name of the voice channel in quotes (e.g "my voice channel") | 

**Required Perms: Move Members**

This is an interesting command, it takes everyone from a single voice channel, then splits everyone out into random groups depending on how many channels you add to the command.

Here's an example command:
```
/voisplit channel1:saloon channel2:spagetti and meatballs channel3:city slickers
```

Unlike the previous commands though, the order here matters. It reads like this: "Take everyone from 'saloon', and randomly place everybody into even groups that spread to 'saloon' spagetti and meatballs' and 'city slickers'"

Here's a visual example of the end result. Let's say you have 6 members in one channel

* `saloon`
    * @cottonEyeJoe
    * @ironMouthSteve
    * @RC Ace 95
    * @RylanStylin
    * @myBodyIsReady
    * @stitch
* `spagetti and meatballs`
* `city slickers`

Members would then be dispersed evenly, but you don't know who you will be paired with!

* `saloon`
    * @cottonEyeJoe
    * @RylanStylin
* `spagetti and meatballs`
    * @ironMouthSteve
    * @stitch
* `city slickers`
    * @RC Ace 95
    * @myBodyIsReady

The command is great for random match-making. If there's a odd-number of people there will be at least one extra member in one room. If there are fewer members than there are rooms specified, one member will go to a designated room.

## `/raid`

Option name | Description | Required
-- | -- | --
move-everyone-to | The voice channel everyone will be moved to | y
channel[1-5] | These are all the voice channels that will have their members moved to `move-everyone-to` | just `channel1`
other-channels | More voice channels - Advanced syntax that requires you remember the full name of the voice channel in quotes (e.g "my voice channel") | 

**Required Perms: Move Members**

The wording for this command was sortof inspired by twitch. On twitch, a raid is a way to move all your viewers to another channel. A boost of viewership for that matter.

On lemonbot `/raid` moves everyone from one or more channels to a specific channel. I thought it would be a cooler name than /herd... baAaAaH.

Raid syntax looks like this:

```
/raid move-everyone-to: saloon channel1: spagetti and meatballs channel2: city slickers
```

It reads: "Take everyone from 'spagetti and meatballs' and 'city slickers' and place them all in 'saloon'". Pretty straightforward.

This command is great for bringing everyone back from using `/voisplit`, or simply bringing everyone back to make an announcement or to watch an event together.

# Cooldown system

Historically, admin commands have had no cooldown whatsoever in order to make sure administrators can do their job. This type of solution is not good for the long-term though, since there's the potential of abuse to the bot itself, or even potential abuse of many servers at once. To reduce the potential of such attacks, admin commands have cooldowns, but should be broad enough so admins can still do their job. If for some reason you have hit these bars for legitimate reasons and would like them raised, please create a github issue or visit the [lemonbot community](https://discord.gg/epBxDGdErz) so we can discuss something better.

## How it works

* All cooldowns explained are special in that they are for *each user*, and not each discord server. This means that if you reach the limits of a command in one server, it affects your usage across another. The intent of this is to prevent an overload of the bot if you manage to use the limits in one location and start affecting another.
* Some commands, (right now just /del) can *increase* the usage points given based on how it's used
* As mentioned above, if you don't have access to these commands in a server, a different cooldown is issued that is *server specific*. Every command typed will count towards a single, 1 hour cooldown. If you gain perms in this org you will be moved to the cooldown system explained below
* Admin commands are grouped based on it's usage type. Right now there's three categories: messages, voice and adminhelp. These groups are consisdered one cooldown each, so /del and /move will cause eachother to gain points, while /raid and /mute will be in their own group.

## Categories

Category | Commands | Uses | Duration (Minutes) | Notes
-- | -- | -- | -- | --
Messages | `del` `move` | 20 | 10 | `/del` will increase it's point total if More than one channel is used in the command. If the channel count is more than the point total you have, the command will still run, so a `/del *` should still be possible in the target server.
Voice | `mute` `unmute` `voisplit` `raid` | 10 | 2 | This is a much less intensive task than managing messages, so the strike count is low and the duration between strikes is also low.
Adminhelp | `adminhelp` | 2 | 1 | ...Not sure why this one would need to be used frequently XP
