const { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-logs')
        .setDescription('Set the channel where closed ticket transcripts will be sent.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addChannelOption((option) => option
            .setName('channel')
            .setDescription('The channel to receive ticket transcripts')
            .setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const channel = interaction.options.getChannel('channel');
        const guildConfig = await db.getGuildConfig(interaction.guild.id);

        await db.updateGuildConfig(interaction.guild.id, {
            logChannelId: channel.id
        });

        await db.createAuditLog({
            guildId: interaction.guild.id,
            actorId: interaction.user.id,
            actorTag: interaction.user.tag,
            source: 'discord',
            action: 'Updated ticket log channel',
            changes: [{
                field: 'logChannelId',
                before: guildConfig.logChannelId,
                after: channel.id
            }]
        });

        const embed = new EmbedBuilder()
            .setTitle('Ticket Logs Configured')
            .setDescription(`Successfully set the ticket log channel to ${channel}. Closed tickets will now be archived there.`)
            .setColor('#2ECC71')
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};
