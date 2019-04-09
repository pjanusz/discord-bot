const fs = require('fs'); //filesystem access
const Discord = require('discord.js');
const config = require('../config.json');

module.exports = {
    name: `${config.commands.roleManagement}`,
    description: 'Tworzy wiadomość i dodaje do niej reakcje, dzięki którym można łatwo sobie dodać albo odebrać rolę.\nMusi posiadać odwołanie do kanału, na którym znajduje się wiadomość oraz do samej wiadomości.',
    args: true,
    permissions: 'ADMINISTRATOR',
    usage: `${config.prefix}${config.commands.roleManagement} komenda parametry\n\nKomendy:\n${config.roleManagement.commands.addChannel} channelID\n\tdodaje ISTNIEJĄCY już kanał, na którym pojawi się wiadomość z reakcjami\n\n${config.roleManagement.commands.addMessage} kategoria tytuł | treść \n\tdodaje wiadomość z przypisaną kategorią na podany wcześniej kanał, do której będą dodawane reakcje obsługujące role\n\n${config.roleManagement.commands.addRole} kategoria emotka rola\n\tdodaje reakcję o podanej emotce i przypisuje jej podaną rolę, reakcja jest dodawana do wiadomości obsługującej podaną kategorię\n\n${config.roleManagement.commands.remove.main} ${config.roleManagement.commands.remove.channel}\n\tusuwa przypisany kanał (najpierw trzeba usunąć wiadomości)\n\n${config.roleManagement.commands.remove.main} ${config.roleManagement.commands.remove.category}\n\tusuwa wiadomość obsługującą podaną kategorię\n\n${config.roleManagement.commands.remove.main} ${config.roleManagement.commands.remove.role} emotka rola\n\tusuwa reakcję z przypisaną do niej rolą z podanej kategorii`,
    execute(message, args) {
        if (message.channel.permissionsFor(message.member).has(this.permissions)) {
            let [command, ...rest] = args;
            let commandChannelID = message.channel.id;
            fs.readFile('./config.json', 'utf-8', (error, data) => {
                if (error) console.log(error)
                else {
                    oldConfigFile = JSON.parse(data);
                    const chl = oldConfigFile.roleManagement.channel;
                    const categories = oldConfigFile.roleManagement.categories;
                    let newConfigFile;
                    let isValid = new RegExp(/\:+/);
                    let emojiValidator = new RegExp(/\<\:(.*?)\>/);
                    switch (command) {
                        case oldConfigFile.roleManagement.commands.addChannel: //add channel{
                            {
                                if (oldConfigFile.roleManagement.channelID.length > 0) return message.channel.send('Kanał przypisany, najpierw trzeba usunąć żeby dodać nowy.');
                                if (error) console.log(error)
                                else {
                                    let newChannelID = rest[0].match(/\d+/).toString(); //channel id from mention
                                    oldConfigFile.roleManagement.channelID = newChannelID; //new channel
                                    newConfigFile = JSON.stringify(oldConfigFile);
                                    message.channel.send(`Added channel: <#${newChannelID}> - ID: ${newChannelID}`);
                                    fs.writeFile('./config.json', newConfigFile, 'utf-8', error => { //save changes
                                        if (error) console.log(error)
                                        else message.channel.send('Kanał dodany!\nKonfig zapisany.')
                                    });
                                }
                                break;
                            }
                        case oldConfigFile.roleManagement.commands.addMessage: //add message
                            {
                                let [category, ...params] = rest;
                                let parameters = params.join(' ')
                                let toMessage = parameters.split(config.separator);
                                let reactionMessage = new Discord.RichEmbed({
                                    'title': `${toMessage[0].trim()}`,
                                    'description': `${toMessage[1].trim()}\n\nKategoria: ${category}`,
                                    'color': config.embedDefaultColor,
                                    'fields': []
                                });
                                for (let cat of categories) {
                                    if (category === cat.category) {
                                        return message.channel.send('Ta kategoria już istnieje.')
                                    }
                                }
                                message.guild.channels.get(chl).send(reactionMessage).then(message => {
                                    categories.push({
                                        category: category,
                                        message: message.id,
                                        roles: []
                                    });
                                    newConfigFile = JSON.stringify(oldConfigFile);
                                    fs.writeFile('./config.json', newConfigFile, 'utf-8', error => { //save changes
                                        if (error) return console.log(error);
                                        else console.log('Changes saved!');
                                    });
                                }).catch(error => console.log(error));
                                break;
                            }
                        case oldConfigFile.roleManagement.commands.addRole: //add role reaction
                            {
                                let [category, emoji, role] = rest;
                                if (rest.length !== 3 || category === ' ' || category === '' || emoji === ' ' || emoji === '' || role === ' ' || role === '') {
                                    return message.channel.send('Brak wymaganych parametrów!');
                                }
                                let emojiFormatted = emojiValidator.test(emoji) ? emoji.match(emojiValidator)[1] : emoji;
                                let roleID = role.match(/\d+/).toString();
                                let fieldsCfg = [];
                                let index;

                                for (let cat of categories) {
                                    if (cat.category === category) {
                                        for (let element of cat.roles) {
                                            if (emojiFormatted === element[0] && roleID === element[1]) {
                                                return message.channel.send('Rola z tą reakcją już jest w tej kategorii.');
                                            } else if (emojiFormatted === element[0] && roleID !== element[1]) {
                                                return message.channel.send('Emotka już użyta w tej kategorii.');
                                            } else if (emojiFormatted !== element[0] && roleID === element[1]) {
                                                return message.channel.send('Rola już przypisana do innej emotki w tej kategorii.');
                                            }
                                        }
                                        index = categories.indexOf(cat);
                                    }
                                }

                                categories[index].roles.push([emojiFormatted, roleID]);
                                newConfigFile = JSON.stringify(oldConfigFile);
                                fs.writeFile('./config.json', newConfigFile, 'utf-8', error => {
                                    if (error) return console.log(error);
                                    else {
                                        console.log(`Rola dodana do kategorii ${category}`);
                                        message.guild.channels.get(commandChannelID).send(`Rola dodana do kategorii ${category}`);
                                    }
                                });

                                categories[index].roles.forEach(roleElement => { //fields from cfg file
                                    let [emojiCfg, roleCfg] = roleElement;
                                    let emojiForMessage = isValid.test(emojiCfg) ? `<:${emojiCfg}>` : emojiCfg;
                                    fieldsCfg.push({
                                        'name': emojiForMessage,
                                        'value': `<@&${roleCfg}>`,
                                        'inline': true
                                    });
                                });

                                message.guild.channels.get(chl).fetchMessage(categories[index].message).then(message => {
                                    let embeds = message.embeds.find(embeds => embeds.message.embeds);
                                    let newEmbed = new Discord.RichEmbed({
                                        'title': `${embeds.title}`,
                                        'description': `${embeds.description}`,
                                        'color': config.embedDefaultColor,
                                        'fields': fieldsCfg
                                    });
                                    message.edit(newEmbed).then(() => console.log('Message Edited')).catch(error => console.log(error));
                                    message.react(emojiFormatted);
                                }).catch(error => console.log(error));
                                break;
                            }
                        case oldConfigFile.roleManagement.commands.remove.main: //remove role, channel, reaction
                            {
                                let [removeCommand, ...toRemove] = rest;
                                if (rest.length === 1 && removeCommand === oldConfigFile.roleManagement.commands.remove.channel) {
                                    if (categories.length > 0) {
                                        return message.channel.send('Nie można usunąć kanału, na którym są wiadomości odpowiadające za przyznawanie ról.');
                                    } else {
                                        oldConfigFile.roleManagement.channel = '';
                                        newConfigFile = JSON.stringify(oldConfigFile);
                                        fs.writeFile('./config.JSON', newConfigFile, 'utf-8', (error) => {
                                            if (error) console.log(error);
                                            else {
                                                console.log('Channel removed from config file.');
                                                return message.channel.send('Channel removed from config file');
                                            }
                                        });
                                    }
                                } else if (rest.length === 2 && removeCommand === oldConfigFile.roleManagement.commands.remove.category) {
                                    let [category] = toRemove;
                                    for (let cat of categories) {
                                        if (category === cat.category) {
                                            let toDeleteCfg = categories.indexOf(cat);
                                            let toDeleteMsg = cat.message;
                                            categories.splice(toDeleteCfg, 1);
                                            newConfigFile = JSON.stringify(oldConfigFile);
                                            fs.writeFile('./config.JSON', newConfigFile, 'utf-8', (error) => {
                                                if (error) console.log(error);
                                                else {
                                                    console.log('Kategoria i wiadomość usunięta.');
                                                    message.channel.send('Kategoria i wiadomość usunięta.');
                                                }
                                            });
                                            return message.guild.channels.get(chl).fetchMessage(toDeleteMsg).then(message => message.delete()).catch(error => console.log(error));
                                        }
                                    }
                                } else if (rest.length > 2 && removeCommand === oldConfigFile.roleManagement.commands.remove.role) {
                                    let [category, emoji, role] = toRemove;
                                    let emojiToRemove = emojiValidator.test(emoji) ? emoji.match(emojiValidator)[1] : emoji;
                                    let roleID = role.match(/\d+/).toString();
                                    let fieldsCfg = [];

                                    for (let cat of categories) {
                                        if (cat.category === category) {
                                            for (let roleElement of cat.roles) {
                                                let [emojiCfg, roleCfg] = roleElement;
                                                if (emojiToRemove === emojiCfg && roleID === roleCfg) {
                                                    let toDelete = cat.roles.indexOf(roleElement);
                                                    if (toDelete > -1) cat.roles.splice(toDelete, 1);
                                                    newConfigFile = JSON.stringify(oldConfigFile);
                                                    fs.writeFile('./config.json', newConfigFile, 'utf-8', error => {
                                                        if (error) return console.log(error);
                                                        else {
                                                            console.log('Role removed');
                                                            message.guild.channels.get(commandChannelID).send('Role removed!');
                                                        }
                                                    });
                                                    cat.roles.forEach(roleElement => { //fields from cfg file
                                                        let [emojiCfg, roleCfg] = roleElement;
                                                        let emojiForMessage = isValid.test(emojiCfg) ? `<:${emojiCfg}>` : emojiCfg;
                                                        fieldsCfg.push({
                                                            'name': emojiForMessage,
                                                            'value': `<@&${roleCfg}>`,
                                                            'inline': true
                                                        });
                                                    });
                                                    console.log(5)
                                                    message.guild.channels.get(chl).fetchMessage(cat.message).then(message => {
                                                        let embeds = message.embeds.find(embeds => embeds.message.embeds);
                                                        let reactionsEmoji = message.reactions.map(reaction => reaction.emoji);
                                                        let newEmbed = new Discord.RichEmbed({
                                                            'title': `${embeds.title}`,
                                                            'description': `${embeds.description}`,
                                                            'color': config.embedDefaultColor,
                                                            'fields': fieldsCfg
                                                        });
                                                        let emojiName = isValid.test(emoji) ? emoji.split(':')[1] : emoji;
                                                        for (let emoji of reactionsEmoji) {
                                                            if (emoji.name === emojiName) {
                                                                emoji.reaction.fetchUsers().then(users =>
                                                                    users.forEach(user => emoji.reaction.remove(user.id)));
                                                            }
                                                        }
                                                        return message.edit(newEmbed).then(() => console.log('Message Edited')).catch(error => console.log(error));
                                                    }).catch(error => console.log(error));
                                                    console.log(6)
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            }
                        default:
                            message.channel.send(this.usage);
                    }
                }
            });
        }
    }
}