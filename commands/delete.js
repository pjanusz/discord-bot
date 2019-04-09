const config = require('../config.json');
module.exports = {
    name: `${config.commands.deleteMessages}`,
    description: 'Usuwa podaną liczbę "ostatnich wiadomości z kanału, na którym została uzyta (nie starszych niż 2 tygodnie).',
    args: true,
    usage: `${config.prefix}${config.commands.deleteMessages} liczba`,
    permissions: 'ADMINISTRATOR',
    execute(message, args) {
        if (message.channel.permissionsFor(message.member).has(this.permissions)) {
            let number = parseInt(args[0], 10);
            message.channel.fetchMessages({
                limit: (number + 1)
            }).then(messages => message.channel.bulkDelete(messages));
        }
    }
};