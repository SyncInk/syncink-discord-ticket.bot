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

        // If ticket is already claimed, ignore
        if (ticket.claimerId) return;

        const guildConfig = await db.getGuildConfig(message.guild.id);

        // Check if user is staff
        const isStaff = [...guildConfig.staffRoleIds, ...guildConfig.adminRoleIds, ...guildConfig.ownerRoleIds, ...guildConfig.developerRoleIds].some(roleId => message.member.roles.cache.has(roleId)) || message.member.permissions.has(PermissionFlagsBits.Administrator);

        if (isStaff) {
            // Auto claim
            await db.updateTicket(message.channel.id, { claimerId: message.author.id });

            // Fetch the welcome message to update the "Claimed By" field
            // The welcome message is usually the first message sent by the bot after channel creation.
            try {
                const messages = await message.channel.messages.fetch({ limit: 50, after: '0' });
                const welcomeMsg = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0 && m.embeds[0].title?.startsWith('Ticket:'));
                
                if (welcomeMsg) {
                    const embed = welcomeMsg.embeds[0];
                    const newEmbed = EmbedBuilder.from(embed);
                    
                    if (newEmbed.data.fields && newEmbed.data.fields[0] && newEmbed.data.fields[0].name === 'Claimed By') {
                        newEmbed.data.fields[0].value = `<@${message.author.id}>`;
                    } else {
                        newEmbed.addFields({ name: 'Claimed By', value: `<@${message.author.id}>` });
                    }
                    await welcomeMsg.edit({ embeds: [newEmbed] });
                }
            } catch (err) {
                console.error('Could not update welcome message on auto-claim', err);
            }

            const claimEmbed = new EmbedBuilder()
                .setColor(config.colors.success)
                .setDescription(`Thank you for your patience <@${ticket.creatorId}>\n<@${message.author.id}> will be with you shortly.`);
            
            await message.channel.send({ embeds: [claimEmbed] });
            
            // Log the claim
            if (guildConfig.logChannelId) {
                const logChannel = message.guild.channels.cache.get(guildConfig.logChannelId);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('Ticket Auto-Claimed')
                        .setDescription(`Channel: <#${message.channel.id}>\nClaimed By: <@${message.author.id}> (via message)`)
                        .setColor(config.colors.primary)
                        .setTimestamp();
                    await logChannel.send({ embeds: [logEmbed] }).catch(() => {});
                }
            }
        }
    },
};
