# __*Outdated*__

This doc is out of date now, as commands can no longer be deployed through a discord server. [See here](./commandDeployment.md) on how to deploy commands to specific servers.


# Staff Commands

Staff commands are extra special - for those maintaining and deploying lemonbot, these commands are designed to help make command deployment much easier.

## Setup!

There are two ways to configure staff commands! The first is by inserting the settings into `personalSettings.json`, or by creating two environment variables: `LB_RESERVED_CMDS` and `LB_ROLE_CMDS` (recommended option) - both of these ways take in a JSON structure.

An example configuration might look like this:

Reserved commands:

```json
//Key: Discord server (guild) ID. Value: list of group ID's (specifically "staff") to let this server use
{
    "123456789":["staff"]
}
```

Role commands:

```json
//Key: The role ID in your server that will use these commands Value: list of group ID's (specifically "staff") to let this server use
{
    "987654321":["staff"]
}
```

After placing these things in your variables, you are now ready to use the commands!

## Uh wait... what does all of this do?

GREAT QUESTION! Below the beanz will spill. Discrete details are left out so you can view the "how" in the slash command descriptions

### `/publish-all-commands`

Does what it says on the tin. If for some reason commands aren't loaded correctly, send them all again. You can either do this through the global scope + reserved/role scope, or when you're using a developer environment.

The use case for this is when commands you'd normally see (e.g commands for a specific server) won't show up for some odd reason. In a way it's a middle-man step to figure out if the problem is with the bot or discord.

Another case, and the more dominant one is for development purposes. Re-loading commands is extremely common there, and a way to do this without doing it all the time is nice. Lately Discord has created a limit for how many times you can publish slash commands (200 as of now). Before, lemonbot would always deploy, but doesn't have to all the time with this command in place.

### `/reserved-guild-commands` & `/role-commands`

These hold a few abilities at once inside of them. They are all about providing access to commands that either aren't public or shouldn't be in every server (i.e: the very commands on this markdown file XP)

`reserved` commands add commands to servers that are separate from lemonbot's public command list. This codebase by itself does not use it, but for commands me and my friends use, it's useful to have access to these controls. There is an example group you can try in the default codebase. It's ID is `test`

`role` commands do the same thing. ID's for role commands need to be in *both* reserved and role JSON to work because you need to have the commands available, but also have the appropriate role to use them. This gives you private and exclusive control over things that might be sensitive to the workings of the bot. If for some reason someone else needs access, you simply give them the appropriate role.

role commands have a an ID too - `roletest`. Be sure to place it in both `reserved` and `role` JSON for this to work.

#### Actions

* `view` - see what groupID's are assigned to a role or guild
* `grant` - add groupID's that a role or guild has access to
* `remove` - a backwards `grant` XP
* `clear` - destroy all permissions for using any reserved or role commands (per role/guild)

When adding/removing groups, multiple can be added if in the string they are separated by space.