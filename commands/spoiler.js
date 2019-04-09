const Discord = require('discord.js');
const config = require('../config.json');
const rot = require('rot'); //simple cipher/decipher

module.exports = {
    name: `${config.commands.hideSpoiler}`,
    args: true,
    description: '"Ukrywa" wiadomość mieszając literki, po kliknięciu rekacji "odmieszana" wiadomość zostaje przesłana do klikającego na priv.\nUWAGA: Temat wiadomości jest widoczny!\nTODO: dodać funcję "szyfrującą" istniejącą wiadomość.',
    usage: `${config.prefix}${config.commands.hideSpoiler} temat wiadomości ${config.separator} treść wiadomości`,
    permissions: '',
    execute(message, args) {
        message.delete();
        let arguments = args.join(' ');
        let toMessage = arguments.split(config.separator, 2);

        let embed = new Discord.RichEmbed({
            'title': `${config.spoiler.messageTitlePrefix} ${toMessage[0].trim()}`,
            'description': `${rot(toMessage[1]).trim()}`,
            'color': 3447003
        });

        return message.channel.send({
            embed
        }).then(embed => embed.react(config.spoiler.reaction));
    }
};