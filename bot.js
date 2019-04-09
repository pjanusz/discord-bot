const fs = require('fs'); //filesystem access
const Discord = require('discord.js');
const config = require('./config.json'); //bot config
const rot = require('rot'); //simple cipher/decipher

const bot = new Discord.Client(); //"bot client"
bot.commands = new Discord.Collection(); //commands collection

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js')); //command file adding

for (const file of commandFiles) { //loop to fill the collection
    const command = require(`./commands/${file}`);
    bot.commands.set(command.name, command);
}

bot.once('ready', () => { // message when bot is ready
    bot.user.setActivity(`${config.prefix}${config.commands.showHelp}`);
    console.log('Ready!');
});

bot.on('message', message => { //funtion that's allowing only links and pasted pics

    const isLink = message.content.startsWith(config.filter.filter1) || message.content.startsWith(config.filter.filter2);

    if (message.channel.id != config.filter.channel) return; //checking if message is on right channel
    if ((isLink) || (message.content == '')) return; //check if message is link or empty (file paste)
    console.log(message.content)
    message.delete(); //if not a link or empty message with attachment - delete

});

bot.on('message', message => { //commands handler
    if (!message.content.startsWith(config.prefix) || message.author.bot) return; //ignore messages from bots and without prefix
    if (message.content === `${config.prefix}${config.commands.showHelp}`) {
        message.delete();
        let comms = bot.commands.map(command => command);
        let msg = `**Pomoc dla bota ${bot.user.username}**\nKomendy \`\`\`fix\no kolorze żółtym\`\`\`dostępne są tylko dla administratorów, a \`\`\`yaml\n o kolorze... tym\`\`\` dla każdego użytkownika.\n\n`;

        comms.forEach(com => {
            if (com.permissions === 'ADMINISTRATOR') {
                msg += `\`\`\`fix\n${com.usage}\n\n\t${com.description}\n\`\`\``;
            } else {
                msg += `\`\`\`yaml\n${com.usage}\n\n\t${com.description}\n\`\`\``;
            }
        });
        console.log(msg.length)
        return message.channel.send(msg);
    }

    const args = message.content.slice(config.prefix.length).split(/ +/);
    const commandName = args.shift();
    if (!bot.commands.has(commandName)) return; //if there isn't command with that name - stop

    const command = bot.commands.get(commandName); //if there is - assign it as 'command'
    if (command.args && !args.length) { //checkig if there are required arguments (in command file must be args: true)
        return message.channel.send(`You didn't provide any arguments, ${message.author}!\nTry **${command.usage}**`);
    }

    try {
        command.execute(message, args);
        //execute command parsing message and arguments
    } catch (error) {
        console.error(error); //error to console
        message.reply(`there was an error trying to execute that command!\nTry **${command.usage}**`); //info for user
    }
});

bot.on('messageReactionAdd', (reaction, user) => { //bot reaction to spoiler message
    let spoilerTitle = reaction.message.embeds.map(MessageEmbed => MessageEmbed.title).toString(); //getting spoiler message title
    if (spoilerTitle.startsWith(config.spoiler.messageTitlePrefix)) { //ckeck if spoiler
        let spoilerContent = reaction.message.embeds.map(MessageEmbed => MessageEmbed.description).toString() //getting spoiler text
        let embed = new Discord.RichEmbed({
            'color': 3447003,
            'title': `${config.spoiler.messageTitlePrefix} from server ${reaction.message.guild.name} - #${reaction.message.channel.name}`,
            'description': rot(spoilerContent), //send deciphered message
            'timestamp': new Date()
        });
        user.send(embed); //send DM to whoever, who clicks the reaction
    };
});

bot.on('messageReactionAdd', (reaction, user) => {
    fs.readFile('./config.json', 'utf-8', (error, data) => {
        if (error) console.log(error);
        else {
            let configFile = JSON.parse(data);
            let category = configFile.roleManagement.categories.find(category => {
                if (reaction.message.id === category.message) {
                    return category;
                }
            });
            if (reaction.message.channel.id !== configFile.roleManagement.channel) return;
            let emojiValidator = new RegExp(/\:+/);
            for (let x of category.roles) {
                let [emoji, role] = x;
                let emojiToCompare = emojiValidator.test(emoji) ? emoji.split(':')[0] : emoji;
                //console.log();
                if (reaction.emoji.name === emojiToCompare) {
                    reaction.message.guild.fetchMember(user).then(member => {
                        return member.addRole(role);
                    });
                }
            }
        }
    });
});

bot.on('messageReactionRemove', (reaction, user) => { //role management reactions
    fs.readFile('./config.json', 'utf-8', (error, data) => {
        if (error) console.log(error);
        else {
            let configFile = JSON.parse(data);
            let category = configFile.roleManagement.categories.find(category => {
                if (reaction.message.id === category.message) {
                    return category;
                }
            });
            if (reaction.message.channel.id !== configFile.roleManagement.channel) return;
            let emojiValidator = new RegExp(/\:+/);
            for (let x of category.roles) {
                let [emoji, role] = x;
                let emojiToCompare = emojiValidator.test(emoji) ? emoji.split(':')[0] : emoji;
                //console.log();
                if (reaction.emoji.name === emojiToCompare) {
                    reaction.message.guild.fetchMember(user).then(member => {
                        return member.removeRole(role);
                    });
                }
            }
        }
    });
});

bot.on('raw', packet => {
    // We don't want this to run on unrelated packets
    if (!['MESSAGE_REACTION_ADD', 'MESSAGE_REACTION_REMOVE'].includes(packet.t)) return;
    // Grab the channel to check the message from
    const channel = bot.channels.get(packet.d.channel_id);
    // There's no need to emit if the message is cached, because the event will fire anyway for that
    //if (channel.messages.has(packet.d.message_id)) return;
    // Since we have confirmed the message is not cached, let's fetch it
    channel.fetchMessage(packet.d.message_id).then(message => {
        // Emojis can have identifiers of name:id format, so we have to account for that case as well
        //const emoji = packet.d.emoji.id ? `${packet.d.emoji.name}:${packet.d.emoji.id}` : packet.d.emoji.name;
        // This gives us the reaction we need to emit the event properly, in top of the message object
        //const reaction = message.reactions.get(emoji);
        // Check which type of event it is before emitting
        if (packet.t === 'MESSAGE_REACTION_ADD') {
            console.log('reaction+');
        }
        if (packet.t === 'MESSAGE_REACTION_REMOVE') {
            console.log('reaction-');

        }
    });
});

bot.login(config.token);