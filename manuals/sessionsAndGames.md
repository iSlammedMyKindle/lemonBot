## This manual has not been updated for the slash commands update yet.

# Sessions & Games

Hello there! You're probably here because you want to join a session/game with your friend. Well I won't sludge down a t-bone steak unless you want to but here's a quick command to help you take off real quick:

`/join host:@friendsNameHere`

That's it! Just follow the instructions for whatever your using. For everyone else, here is an in-depth manual on how this whole thing works:

## As we were saying...

Lemonbot features some brand new technolgy to help you create and join games with your friends! Internally, we call these `stateful` commands (I swear though I've misspelled it everywhere across the code and these documents XP)

For discord folks, what matters is that there are many ways to jump into an activity with friends, this will help break down all the ways on doing that! If you're a nerd like me, you can check how this all works behind the scenes by checking the `./stateful` folder found in the code. It features a small readme and sample code to help you get started making these yourself.

## ways to connect to your session:

There are three types of data used to find your friends game or session:

1. passcode
2. Player's name
3. name of the command

Depending on how you search for a session, you can use any one of these values, or a combinatation of some of them. Now, below are methods to combine some of these clues:

## /join

This command is specific to connecting you with your friends; it takes two of the three options for finding the session: `/join host:@friendsName`, `/join passcode:diu156`, syntax like that.

`/join` also supports diving right into the command at play, using `input:` you could for example, join a game of hangman and guess a letter at the same time:

```
/join user:@cottonEyedJoe input:a
```

## /leave

The opposite of /join! It takes in the same clues as /join as well. Essentially takes you out of a session. Some sessions will end if you are the host. Tic-tac-toe however will stay on.

# Switching between multiple sessions at once

Lemonbot allows users to do many things at once, including more than one of the same item! Let's say you host a game of tic-tac-toe

`/tttoe`

You can also join a friend's game by `/join`-ing them:

`/join host:@cottonEyedJoe`

To swap between them, the `/switch` command can help with that:

`/switch passcode:abcdef ` -> you should now be on your friend's game!

## `/switch`

This was teased a little above, but `/switch` is a convenient method of moving between sessions you might be doing with friends. It takes 3 options: `command`, `host` and `passcode`. By using one of those 3 clues, you can swap between commands rather quickly; with `host` probably being the most common and `passcode` being the most rare (...who wants to use passcodes anyway? ;P)

# Quick start your commands!

If you want to save a few steps before igniting a command, you can place your parameters in before the session even starts! For example:

`/hangman input:rnd` immediately starts a randomized game of hangman

This should also work with joining commands:

`/join user:@friendsName input:2` should place a marker down on the second square of tic-tac-toe as soon as you join your buddy!

# Check if your command has a help page!

Some commands have help pages you can launch while in-game. They have much more information and tell you how to operate a game, and help to un-confuse new players. Usually they will mention if a help page is available when the command starts, so keep your eyes peeled!