const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-logs')
        .setDescription('Set the channel where closed ticket transcripts will be sent.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to receive ticket transcripts')
                .setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');

        await db.updateGuildConfig(interaction.guild.id, {
            logChannelId: channel.id
        });

        const embed = new EmbedBuilder()
            .setTitle('✅ Ticket Logs Configured')
            .setDescription(`Successfully set the ticket transcript channel to ${channel}. All closed tickets will now be archived there.`)
            .setColor('#2ECC71')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
