const { EmbedBuilder } = require('discord.js');
const db = require('../utils/database');
const config = require('../../config');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState) {
        const guildConfig = await db.getGuildConfig(newState.guild.id);
        if (!guildConfig.voiceLogChannelId) return;

        const logChannel = newState.guild.channels.cache.get(guildConfig.voiceLogChannelId);
        if (!logChannel) return;

        const member = newState.member;

        // Joined VC
        if (!oldState.channelId && newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('Joined Voice Channel')
                .setDescription(`<@${member.id}> joined <#${newState.channelId}>`)
                .setColor(config.colors.success)
                .setTimestamp();
            await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
        // Left VC
        else if (oldState.channelId && !newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('Left Voice Channel')
                .setDescription(`<@${member.id}> left <#${oldState.channelId}>`)
                .setColor(config.colors.error)
                .setTimestamp();
            await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
        // Switched VC
        else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
            const embed = new EmbedBuilder()
                .setTitle('Switched Voice Channel')
                .setDescription(`<@${member.id}> switched from <#${oldState.channelId}> to <#${newState.channelId}>`)
                .setColor(config.colors.primary)
                .setTimestamp();
            await logChannel.send({ embeds: [embed] }).catch(() => {});
        }
    }
};
