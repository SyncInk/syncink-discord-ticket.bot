const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const { sendConfiguredTicketPanel } = require('../../utils/ticketUtils');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Sends the ticket creation panel to the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        await interaction.reply({ content: 'Ticket panel sent!', ephemeral: true });
        await sendConfiguredTicketPanel(interaction.channel);

        await db.updateGuildConfig(interaction.guild.id, {
            panelChannelId: interaction.channel.id
        });

        await db.createActivityLog({
            guildId: interaction.guild.id,
            type: 'panel_deployed',
            title: 'Ticket panel deployed',
            description: `${interaction.user.username} deployed the ticket panel in #${interaction.channel.name}.`,
            actorId: interaction.user.id,
            actorTag: interaction.user.tag,
            metadata: {
                channelId: interaction.channel.id
            }
        });
    }
};
