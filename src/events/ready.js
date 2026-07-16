const { EmbedBuilder, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
const db = require('../utils/database');
const { resolveRoleIdsForCategory } = require('../utils/panelBuilder');

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
                if (!fs.statSync(folderPath).isDirectory()) {
                    continue;
                }

                const commandFiles = fs.readdirSync(folderPath).filter((file) => file.endsWith('.js'));
                for (const file of commandFiles) {
                    const command = require(`../commands/${folder}/${file}`);
                    if ('data' in command) {
                        commands.push(command.data.toJSON());
                    }
                }
            }
        }

        if (!process.env.DISCORD_TOKEN) {
            return;
        }

        const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
        try {
            console.log(`[SLASH] Started refreshing ${commands.length} application (/) commands.`);

            const guilds = client.guilds.cache.map((guild) => guild.id);
            for (const guildId of guilds) {
                await rest.put(
                    Routes.applicationGuildCommands(client.user.id, guildId),
                    { body: commands }
                ).catch(() => console.log(`[SLASH] Missing access to register in guild ${guildId}`));
            }
            console.log(`[SLASH] Instantly synced commands to ${guilds.length} servers.`);

            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commands }
            );
            console.log('[SLASH] Successfully reloaded global commands.');
        } catch (error) {
            console.error('[SLASH ERROR]', error);
        }

        setInterval(async () => {
            try {
                const tickets = await db.getAllOpenTickets();

                for (const ticket of tickets) {
                    const channel = client.channels.cache.get(ticket.channelId);
                    if (!channel) {
                        continue;
                    }

                    const guildConfig = await db.getGuildConfig(channel.guild.id);
                    const thresholdMs = Math.max(0.5, Number(guildConfig.inactivityReminderMinutes || 120)) * 60 * 1000;
                    const lastMessageId = channel.lastMessageId;
                    if (!lastMessageId) {
                        continue;
                    }

                    try {
                        const lastMsg = await channel.messages.fetch(lastMessageId);
                        const timeDiff = Date.now() - lastMsg.createdTimestamp;
                        const reminderText = guildConfig.defaultTicketMessages.inactivityReminderText;

                        if (timeDiff >= thresholdMs) {
                            if (
                                lastMsg.author.id === client.user.id &&
                                lastMsg.embeds.length > 0 &&
                                lastMsg.embeds[0].description === reminderText
                            ) {
                                continue;
                            }

                            const embed = new EmbedBuilder()
                                .setDescription(reminderText)
                                .setColor('#F1C40F');

                            const roleIds = resolveRoleIdsForCategory(guildConfig, ticket.type || 'support');
                            const pings = [`<@${ticket.creatorId}>`];
                            if (roleIds && roleIds.length > 0) {
                                pings.push(...roleIds.map(id => `<@&${id}>`));
                            }
                            const pingMsg = await channel.send({ content: pings.join(' ') });
                            await pingMsg.delete().catch(() => {});

                            await channel.send({ embeds: [embed] });

                            await db.updateTicket(ticket.channelId, {
                                lastActivityAt: Date.now(),
                                activityCount: (ticket.activityCount || 0) + 1
                            });

                            await db.createActivityLog({
                                guildId: channel.guild.id,
                                type: 'ticket_inactive',
                                title: 'Inactivity reminder',
                                description: `An inactivity reminder was sent for ${ticket.ticketId}.`,
                                ticketChannelId: channel.id,
                                relatedTicketId: ticket.ticketId,
                                metadata: {
                                    thresholdMinutes: guildConfig.inactivityReminderMinutes
                                }
                            });
                        }
                    } catch (error) {
                        console.error('[INACTIVITY CHECK] Message inspection failed:', error);
                    }
                }
            } catch (error) {
                console.error('[INACTIVITY CHECK ERROR]', error);
            }
        }, 30 * 1000); // Check every 30 seconds
    }
};
