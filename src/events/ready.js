const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`[READY] Logged in as ${client.user.tag} (Ticket System)`);
        
        const commands = [];
        const commandsPath = path.join(__dirname, '../commands');
        if (fs.existsSync(commandsPath)) {
            const commandFolders = fs.readdirSync(commandsPath);
            for (const folder of commandFolders) {
                const folderPath = path.join(commandsPath, folder);
                if (fs.statSync(folderPath).isDirectory()) {
                    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
                    for (const file of commandFiles) {
                        const command = require(`../commands/${folder}/${file}`);
                        if ('data' in command) {
                            commands.push(command.data.toJSON());
                        }
                    }
                }
            }
        }

        if (!process.env.DISCORD_TOKEN) return;

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            console.log(`[SLASH] Started refreshing ${commands.length} application (/) commands.`);
            
            // Register to all current guilds for INSTANT update
            const guilds = client.guilds.cache.map(g => g.id);
            for (const guildId of guilds) {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, guildId),
                    { body: commands }
                ).catch(() => console.log(`[SLASH] Missing access to register in guild ${guildId}`));
            }
            console.log(`[SLASH] Instantly synced commands to ${guilds.length} servers.`);

            // Also register globally (takes up to 1 hour to cache)
            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands },
            );
            console.log(`[SLASH] Successfully reloaded global commands.`);
            
        } catch (error) {
            console.error('[SLASH ERROR]', error);
        }

        // --- INACTIVITY REMINDER SYSTEM ---
        setInterval(async () => {
            try {
                const db = require('../utils/database');
                const { EmbedBuilder } = require('discord.js');
                const tickets = await db.getAllOpenTickets();
                
                for (const ticket of tickets) {
                    const channel = client.channels.cache.get(ticket.channelId);
                    if (!channel) continue;

                    const lastMessageId = channel.lastMessageId;
                    if (!lastMessageId) continue;

                    try {
                        const lastMsg = await channel.messages.fetch(lastMessageId);
                        const timeDiff = Date.now() - lastMsg.createdTimestamp;
                        
                        // 2 hours = 7200000 ms
                        if (timeDiff >= 7200000) {
                            // Don't spam if the last message is already our reminder
                            if (lastMsg.author.id === client.user.id && lastMsg.embeds.length > 0 && lastMsg.embeds[0].description === '<a:sync_alert:1513822294831534220> **Inactivity Reminder**') {
                                continue;
                            }

                            const embed = new EmbedBuilder()
                                .setDescription('<a:sync_alert:1513822294831534220> **Inactivity Reminder**')
                                .setColor('#F1C40F');

                            await channel.send({ embeds: [embed] });
                        }
                    } catch (err) {
                        // Ignore errors fetching message
                    }
                }
            } catch (e) {
                console.error('[INACTIVITY CHECK ERROR]', e);
            }
        }, 60 * 1000 * 5); // Check every 5 minutes
    },
};
