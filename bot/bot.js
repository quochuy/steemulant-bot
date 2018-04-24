const discordjs = require('discord.js');
const steemjs = require('steem');
const moment = require('moment');
const conf = require('./discord.json');
const discord = new discordjs.Client();

const app = {
  commandPrefix: conf.prefix,

  init: function() {
    steemjs.api.setOptions({ url: 'https://api.steemit.com'});

    discord.on('ready', app.discordEvents.onReady);
    discord.login(conf.token);
    discord.on('message', app.discordEvents.onMessage);
  },

  discordEvents: {
    onReady: function() {
      console.log('Logged in as ' + discord.user.tag);
      console.log('commandPrefix = ' + app.commandPrefix);
    },

    onMessage: function(msg) {
      if (!msg.author.bot) {
        const args = msg.content.slice(app.commandPrefix.length).split(/ +/);
        const command = args.shift().toLowerCase();

        if (msg.content.startsWith(app.commandPrefix)) {
          switch(command) {
            case 'info':
              app.discordActions.getSteemProfile(args, msg);
              break;

            default:
              msg.channel.send('Unknown command...');
              break;
          }
        }
      }
    }
  },

  discordActions: {
    getSteemProfile: function(args, msg) {
      if(args.length){
        for(i=0;i<args.length;i++) {
          const account =args[i];

          Promise.all([
            new Promise(function(resolve, reject) {
              // Do async job
              steemjs.api.getAccounts([account],function(err, result) {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              })
            }),
            new Promise(function(resolve, reject) {
              // Do async job
              steemjs.api.getDynamicGlobalProperties(function(err, result) {
                if (err) {
                  reject(err);
                } else {
                  resolve(result);
                }
              })
            })
          ]).then(function(data) {
            app.steemEvents.onGetAccounts(account, data[0], data[1], msg);
          });
        }
      }
    }
  },

  steemEvents: {
    onGetAccounts: function(account, data, globals, msg) {
      if (data["0"] === undefined){
        msg.channel.send(account + ' invalid account :tired_face:');
      } else {
        const profile = JSON.parse(data[0].json_metadata).profile;

        try{
          var name = profile.name;
          var about = profile.about;
          var location = profile.location;
        } catch(err){
          var name = account
          var about = "undefined"
          var location = "undefined"
        }

        if (name === undefined) {
          name = account;
        }

        const reputation = steemjs.formatter.reputation(data["0"].reputation);
        const vp = data[0].voting_power;
        const today = moment(Date.now());
        const created = moment(data[0].created);
        const diff = today.diff(created, 'days');
        const lastvote = moment(data[0].last_vote_time).subtract(4,'hours');
        const totalSteem = Number(globals.total_vesting_fund_steem.split(' ')[0]);
        const totalVests = Number(globals.total_vesting_shares.split(' ')[0]);
        const userVests = Number(data[0].vesting_shares.split(' ')[0]);
        const sp = totalSteem * (userVests / totalVests);

        const witnessesVoted = data[0].witnesses_voted_for;
        var proxy = null;
        if (witnessesVoted === 0) {
          proxy = data[0].proxy;
        }

        var description = "https://steemit.com/@" + data[0].name + "\n" +
          "Reputation: " + reputation + "\n" +
          "Description: " + about + "\n" +
          "Location: " + location + "\n" +
          "Age: " + diff + " days" + "\n" +
          "Steem Power: " + sp + " STEEM\n" +
          "Voting Power: " + vp/100 + "%" + "\n" +
          "Last vote: " + lastvote.format("YYYY-MM-DD HH.MM") + "\n" +
          "Account created by: " + data[0].recovery_account + "\n" +
          "Has voted for " + witnessesVoted + " witnesses\n";

        if (proxy !== null) {
          description += "Proxy: " + (proxy ? proxy : 'none');
        }

        const embed = new discordjs.RichEmbed()
          .setAuthor(msg.author.username + ' ' + name, msg.author.displayAvatarURL)
          .setColor([77,238,22])
          .setDescription(description);

        msg.channel.send(embed);
      }
    }
  }
};

app.init();
