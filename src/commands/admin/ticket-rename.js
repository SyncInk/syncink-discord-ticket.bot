const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-rename')
        .setDescription('Rename the current ticket channel')
        .addStringOption(option => option.setName('name').setDescription('The new name for the ticket').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const ticket = await db.getTicket(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });

        const newName = interaction.options.getString('name');

        try {
            await interaction.channel.setName(newName);
            await interaction.reply({ content: `Successfully renamed ticket to \`${newName}\`.` });
        } catch (e) {
            console.error(e);
            await interaction.reply({ content: 'Failed to rename ticket. Check permissions or rate limits.', ephemeral: true });
        }
    },
};
