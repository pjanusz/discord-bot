const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
    name: `${config.commands.playingAgame}`,
    description: 'Tworzy listę użytkowników, którzy aktualnie grają w grę, podaną jako parametr.\nGrę trzeba wpisać tak jak na discordzie...\nTODO: dodać aliasy i możliowść dodawanie aliasów dla tytułów gier (np PUBG zamiast "PLAYERUNKOWN\'S BATTLEGROUNDS").',
    args: true,
    usage: `${config.prefix}${config.commands.playingAgame} tytuł gry`,
    permission: '',
    execute(message, args) {
        let gameTitle = args.length > 1 ? args.join(' ') : args;
        let players = [];

        message.guild.members.map(member => {
            if ((member.presence.game !== null) && (member.presence.game.name.toLowerCase() === gameTitle.toLowerCase())) {
                players.push(member.user.username);
            }
        });

        let embed = new Discord.RichEmbed({
            'title': `Users playing **${game.toUpperCase()}**: **${players.length}**`,
            'description': '',
            'color': 3447003
        });

        players.forEach(player => {
            embed.description += player + `\n`;
        });

        return message.channel.send({
            embed
        });
    }
}