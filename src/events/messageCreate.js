const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');
const config = require('../../config');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot) return;
        if (!message.guild) return;

        // Check if the channel is a ticket
        const ticket = await db.getTicket(message.channel.id);
        if (!ticket) return;

        const guildConfig = await db.getGuildConfig(message.guild.id);

        const staffRoles = [...guildConfig.staffRoleIds, ...guildConfig.adminRoleIds, ...guildConfig.ownerRoleIds, ...guildConfig.developerRoleIds];
        const isStaff = staffRoles.some(roleId => message.member.roles.cache.has(roleId)) || message.member.permissions.has(PermissionFlagsBits.Administrator);

        if (isStaff) {
            const newClaimers = [message.author.id];
            
            message.mentions.members.forEach(member => {
                if (member.user.bot) return;
                const isMentionedStaff = staffRoles.some(roleId => member.roles.cache.has(roleId)) || member.permissions.has(PermissionFlagsBits.Administrator);
                if (isMentionedStaff && !newClaimers.includes(member.id)) {
                    newClaimers.push(member.id);
                }
            });

            try {
                const messages = await message.channel.messages.fetch({ limit: 10, after: '0' });
                const welcomeMsg = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title === 'Claimers');
                
                if (welcomeMsg) {
                    const claimersEmbed = EmbedBuilder.from(welcomeMsg.embeds[0]);
                    let desc = claimersEmbed.data.description || '';
                    let updated = false;

                    for (const claimerId of newClaimers) {
                        if (desc.includes('No one has claimed')) {
                            desc = `• <:claimers:1513345698689581087> <@${claimerId}>`;
                            await message.channel.send(`<:claimers:1513345698689581087> <@${claimerId}> is a claimer now!`);
                            await db.updateTicket(message.channel.id, { claimerId: claimerId });
                            updated = true;
                        } else if (!desc.includes(claimerId)) {
                            desc += `\n• <:claimers:1513345698689581087> <@${claimerId}>`;
                            await message.channel.send(`<:claimers:1513345698689581087> <@${claimerId}> is also a claimer now!`);
                            updated = true;
                        }
                    }

                    if (updated) {
                        claimersEmbed.setDescription(desc);
                        await welcomeMsg.edit({ embeds: [claimersEmbed, welcomeMsg.embeds[1]] });
                    }
                }
            } catch (err) {
                console.error('Could not update welcome message on auto-claim', err);
            }
        }
    },
};
