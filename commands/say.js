const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: `${config.commands.botSay}`,
    args: true,
    description: 'Wysyła wiadomość "jako bot", może wysłać zwykłą albo embed zależnie od podanych parametrów.',
    usage: `${config.prefix}${config.commands.botSay} <text>\n${config.prefix}${config.commands.botSay} embed title ${config.separator} text`,
    permissions: "ADMINISTRATOR",
    execute(message, args) {
        if (message.channel.permissionsFor(message.member).has(this.permissions)) {
            let [command, ...rest] = args;
            message.delete();
            if (command === config.botSay.embedCommand) {
                let toSplit = rest.join(' ');
                let toMessage = toSplit.split(config.separator, 2);
                let embed = new Discord.RichEmbed({
                    'title': `${toMessage[0].trim()}`,
                    'description': `${toMessage[1].trim()}`,
                    'color': 3447003
                });
                message.channel.send({
                    embed
                });
            } else {
                let text = args.join(' ');
                message.channel.send(text);
            }
        }
    }
};