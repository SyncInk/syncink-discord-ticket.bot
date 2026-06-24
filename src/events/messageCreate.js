const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../utils/database');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) {
            return;
        }

        const ticket = await db.getTicket(message.channel.id);
        if (!ticket) {
            return;
        }

        const guildConfig = await db.getGuildConfig(message.guild.id);
        const staffRoles = [
            ...guildConfig.staffRoleIds,
            ...guildConfig.adminRoleIds,
            ...guildConfig.ownerRoleIds,
            ...guildConfig.developerRoleIds
        ];
        const isStaff = staffRoles.some((roleId) => message.member.roles.cache.has(roleId)) ||
            message.member.permissions.has(PermissionFlagsBits.Administrator);

        await db.updateTicket(message.channel.id, {
            lastActivityAt: Date.now(),
            activityCount: (ticket.activityCount || 0) + 1
        });

        if (!isStaff) {
            return;
        }

        const newClaimers = [message.author.id];

        message.mentions.members.forEach((member) => {
            if (member.user.bot) {
                return;
            }

            const isMentionedStaff = staffRoles.some((roleId) => member.roles.cache.has(roleId)) ||
                member.permissions.has(PermissionFlagsBits.Administrator);
            if (isMentionedStaff && !newClaimers.includes(member.id)) {
                newClaimers.push(member.id);
            }
        });

        try {
            const messages = await message.channel.messages.fetch({ limit: 10, after: '0' });
            const welcomeMsg = messages.find((entry) => entry.author.id === client.user.id && entry.embeds.length > 0 && entry.embeds[0].title === 'Claimers');

            if (!welcomeMsg) {
                return;
            }

            const claimersEmbed = EmbedBuilder.from(welcomeMsg.embeds[0]);
            let desc = claimersEmbed.data.description || '';
            let updated = false;
            const claimerIds = Array.isArray(ticket.claimerIds) ? [...ticket.claimerIds] : [];

            for (const claimerId of newClaimers) {
                if (desc.includes('No one has claimed')) {
                    desc = `• <@${claimerId}>`;
                    await message.channel.send(`<:claimers:1513345698689581087> <@${claimerId}> is a claimer now!`);
                    if (!claimerIds.includes(claimerId)) {
                        claimerIds.push(claimerId);
                    }
                    await db.updateTicket(message.channel.id, {
                        claimerId,
                        claimerIds,
                        claimedAt: ticket.claimedAt || Date.now(),
                        lastActivityAt: Date.now()
                    });
                    updated = true;

                    await db.createActivityLog({
                        guildId: message.guild.id,
                        type: 'ticket_claimed',
                        title: 'Ticket auto-claimed',
                        description: `${message.author.username} became a claimer on ${ticket.ticketId}.`,
                        actorId: message.author.id,
                        actorTag: message.author.tag,
                        ticketChannelId: message.channel.id,
                        relatedTicketId: ticket.ticketId
                    });
                } else if (!desc.includes(claimerId)) {
                    desc += `\n• <@${claimerId}>`;
                    await message.channel.send(`<:claimers:1513345698689581087> <@${claimerId}> is also a claimer now!`);
                    if (!claimerIds.includes(claimerId)) {
                        claimerIds.push(claimerId);
                    }
                    await db.updateTicket(message.channel.id, {
                        claimerIds,
                        lastActivityAt: Date.now()
                    });
                    updated = true;
                }
            }

            if (updated) {
                claimersEmbed.setDescription(desc);
                await welcomeMsg.edit({ embeds: [claimersEmbed, welcomeMsg.embeds[1]] });
            }
        } catch (error) {
            console.error('[AUTO CLAIM] Could not update welcome message on auto-claim:', error);
        }
    }
};
