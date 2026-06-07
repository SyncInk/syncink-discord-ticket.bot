const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-add')
        .setDescription('Add a user to the current ticket')
        .addUserOption(option => option.setName('user').setDescription('The user to add').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const ticket = await db.getTicket(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });

        const user = interaction.options.getUser('user');

        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: true,
            SendMessages: true,
            ReadMessageHistory: true
        });

        await interaction.reply({ content: `Successfully added ${user} to the ticket.` });
    },
};
