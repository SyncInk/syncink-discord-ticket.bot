const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-logs')
        .setDescription('Set the channels for various server logs')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('tickets')
            .setDescription('Set the channel for ticket transcripts')
            .addChannelOption(opt => opt.setName('channel').setDescription('Log channel').setRequired(true).addChannelTypes(ChannelType.GuildText))
        )
        .addSubcommand(sub => sub
            .setName('messages')
            .setDescription('Set the channel for edited/deleted message logs')
            .addChannelOption(opt => opt.setName('channel').setDescription('Log channel').setRequired(true).addChannelTypes(ChannelType.GuildText))
        )
        .addSubcommand(sub => sub
            .setName('voice')
            .setDescription('Set the channel for voice join/leave logs')
            .addChannelOption(opt => opt.setName('channel').setDescription('Log channel').setRequired(true).addChannelTypes(ChannelType.GuildText))
        ),
    
    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        const channel = interaction.options.getChannel('channel');

        if (subcommand === 'tickets') {
            await db.updateGuildConfig(interaction.guild.id, { logChannelId: channel.id });
            await interaction.reply({ content: `✅ Ticket logs will now be sent to <#${channel.id}>`, ephemeral: true });
        } else if (subcommand === 'messages') {
            await db.updateGuildConfig(interaction.guild.id, { messageLogChannelId: channel.id });
            await interaction.reply({ content: `✅ Message edit logs will now be sent to <#${channel.id}>`, ephemeral: true });
        } else if (subcommand === 'voice') {
            await db.updateGuildConfig(interaction.guild.id, { voiceLogChannelId: channel.id });
            await interaction.reply({ content: `✅ Voice join/leave logs will now be sent to <#${channel.id}>`, ephemeral: true });
        }
    },
};
