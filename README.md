# Steemulant bot
This is a Discord/Steem bot for NodeJS.

## Installation and usage
### Pre-requisite
You first need to have your own Discord server and add a bot (app), then use the app token:
https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token

### Docker Compose / Docker
- `git clone https://github.com/quochuy/steemulant-bot.git`
- `cd steemulant-bot`
- rename bot/discord.json.example to bot/discord.json and configure with your discord bot token
- `docker-compose up -d`

### Without Docker
You need to have NodeJS & npm installed

- `git clone https://github.com/quochuy/steemulant-bot.git`
- `cd steemulant-bot/bot`
- rename discord.json.example to discord.json and configure with your discord bot token
- `npm install`
- `node bot.js`

