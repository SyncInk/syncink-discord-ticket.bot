const { EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const config = require('../../config');

module.exports = {
    name: 'messageUpdate',
    async execute(oldMessage, newMessage) {
        if (oldMessage.author?.bot) return;
        if (oldMessage.content === newMessage.content) return;

        const guildConfig = await db.getGuildConfig(newMessage.guild.id);
        if (!guildConfig.messageLogChannelId) return;

        const logChannel = newMessage.guild.channels.cache.get(guildConfig.messageLogChannelId);
        if (!logChannel) return;

        const embed = new EmbedBuilder()
            .setTitle('Message Edited')
            .setAuthor({ name: newMessage.author.tag, iconURL: newMessage.author.displayAvatarURL() })
            .setColor(config.colors.primary)
            .addFields(
                { name: 'Channel', value: `<#${newMessage.channel.id}>`, inline: true },
                { name: 'Before', value: oldMessage.content || '*No text content*' },
                { name: 'After', value: newMessage.content || '*No text content*' }
            )
            .setTimestamp();

        await logChannel.send({ embeds: [embed] }).catch(() => {});
    }
};
