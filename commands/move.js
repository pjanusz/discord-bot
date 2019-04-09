const Discord = require('discord.js');
const config = require('../config.json');
module.exports = {
    name: `${config.commands.moveMessages}`,
    description: 'Przenosi ostatnią lub kilka wiadomości na podany kanał (jako embed) usuwając wiadomości oryginalne',
    args: true,
    usage: `${config.prefix}${this.name} liczba`,
    permissions: 'ADMINISTRATOR',
    execute(message, args) {
        if (message.channel.permissionsFor(message.member).has(this.permissions)) {
            let [messagesLimit, tChannel] = args;
            let targetChannel = tChannel.match(/\d+/).toString();
            let number = parseInt(messagesLimit, 10);
            let toMove = [];
            message.channel.fetchMessages({
                limit: (number + 1)
            }).then(fetchedMessages => {
                for (let msg of fetchedMessages.array()) {
                    if (msg.author.bot || msg.content.startsWith(config.prefix)) console.log('Autorem jest bot albo treść to komenda bota, pomijam.')
                    else {
                        let embed = new Discord.RichEmbed({
                            author: {
                                name: msg.author.username + ' ' + msg.createdTimestamp,
                                icon_url: msg.author.avatarURL
                            },
                            title: `Wiadomość przeniesiona z #${message.channel.name.toUpperCase()}`,
                            description: msg.content,
                            footer: {
                                text: 'Wiadomość oryginalna z'
                            },
                            image: {
                                url: msg.attachments.size > 0 ? msg.attachments.array()[0].url : '', //if there is attachment - attach ;)
                            },
                            color: 3447003
                        });
                        toMove.unshift(embed);
                    }
                }
                //message.channel.bulkDelete(fetchedMessages);
                return toMove.forEach(x => {
                    message.guild.channels.get(targetChannel).send( /*`Wiadomość przeniesiona z <#${message.channel.id}>`, */ x);
                });
            }).catch(error => console.log(error));
        }
    }
}