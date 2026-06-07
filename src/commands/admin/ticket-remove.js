const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-remove')
        .setDescription('Remove a user from the current ticket')
        .addUserOption(option => option.setName('user').setDescription('The user to remove').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    
    async execute(interaction) {
        const ticket = await db.getTicket(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: 'This command can only be used in a ticket channel.', ephemeral: true });

        const user = interaction.options.getUser('user');

        if (user.id === ticket.creatorId) {
            return interaction.reply({ content: 'You cannot remove the ticket creator.', ephemeral: true });
        }

        await interaction.channel.permissionOverwrites.edit(user.id, {
            ViewChannel: false,
            SendMessages: false,
            ReadMessageHistory: false
        });

        await interaction.reply({ content: `Successfully removed ${user} from the ticket.` });
    },
};
