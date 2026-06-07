const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Sends the ticket creation panel to the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🛠️ Support Requests') // Trying to match screenshot visually
            .setDescription('• 🔍 Choose the appropriate `Option` from the select `Menu` below\n\n• ☑️ Any form of `Trolling/Spam` to abuse the system will result in a severe punishment')
            .setColor(config.colors.primary);

        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_select_type')
            .setPlaceholder('Select a ticket type');

        for (const opt of config.ticketOptions) {
            selectMenu.addOptions(
                new StringSelectMenuOptionBuilder()
                    .setLabel(opt.label)
                    .setDescription(opt.description)
                    .setValue(opt.value)
                    .setEmoji(opt.emoji)
            );
        }

        const row = new ActionRowBuilder().addComponents(selectMenu);

        await interaction.reply({ content: 'Ticket panel sent!', ephemeral: true });
        await interaction.channel.send({ embeds: [embed], components: [row] });
    },
};
