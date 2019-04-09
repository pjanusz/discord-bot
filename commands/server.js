const config = require('../config.json');
module.exports = {
    name: `${config.commands.serverInfo}`,
    args: false,
    description: 'Podaje podstawowe informacje o serwerze.',
    usage: `${config.prefix}${config.commands.serverInfo}`,
    permissions: '',
    execute(message, args) {
        message.channel.send(
            `\`\`\`Serwer: ${message.guild.name}.\nUtworzony: ${message.guild.createdAt}.\nIlość użytkowników:${message.guild.memberCount}\nRegion serwera: ${message.guild.region}.\`\`\``
        );
    }
};