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

        const isStaff = [...guildConfig.staffRoleIds, ...guildConfig.adminRoleIds, ...guildConfig.ownerRoleIds, ...guildConfig.developerRoleIds].some(roleId => message.member.roles.cache.has(roleId)) || message.member.permissions.has(PermissionFlagsBits.Administrator);

        if (isStaff) {
            try {
                const messages = await message.channel.messages.fetch({ limit: 10, after: '0' });
                const welcomeMsg = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title === 'Claimers');
                
                if (welcomeMsg) {
                    const claimersEmbed = EmbedBuilder.from(welcomeMsg.embeds[0]);
                    let desc = claimersEmbed.data.description || '';
                    
                    if (desc.includes('No one has claimed')) {
                        desc = `• <:claimers:1513345698689581087> <@${message.author.id}>`;
                        claimersEmbed.setDescription(desc);
                        await welcomeMsg.edit({ embeds: [claimersEmbed, welcomeMsg.embeds[1]] });
                        await message.channel.send(`<:claimers:1513345698689581087> <@${message.author.id}> is a claimer now!`);
                        await db.updateTicket(message.channel.id, { claimerId: message.author.id });
                    } else if (!desc.includes(message.author.id)) {
                        desc += `\n• <:claimers:1513345698689581087> <@${message.author.id}>`;
                        claimersEmbed.setDescription(desc);
                        await welcomeMsg.edit({ embeds: [claimersEmbed, welcomeMsg.embeds[1]] });
                        await message.channel.send(`<:claimers:1513345698689581087> <@${message.author.id}> is also a claimer now!`);
                    }
                }
            } catch (err) {
                console.error('Could not update welcome message on auto-claim', err);
            }
        }
    },
};
