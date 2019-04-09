const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
    name: `${config.commands.roleMembers}`,
    description: 'Zwraca listę użytkowników posiadających podaną rolę.',
    args: true,
    usage: `${config.prefix}${config.commands.roleMembers} rola`,
    execute(message, args) {
        let [roleName] = args;
        if (args.length > 1) throw this.usage;

        let roles = message.guild.roles.find(role => role.name === roleName);
        let members = roles.members.map(name => name.user.username);

        let embed = new Discord.RichEmbed({
            "title": `Users with the **${roles.name.toUpperCase()}** role: **${roles.members.size}**`,
            "description": '',
            "color": roles.color
        });

        members.forEach(member => {
            embed.description += member + '\n';
        });

        return message.channel.send({
            embed
        });
    }
};