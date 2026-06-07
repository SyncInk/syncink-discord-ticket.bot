const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-config')
        .setDescription('Configure ticket system settings for the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(sub => sub
            .setName('category')
            .setDescription('Set the category where new tickets are created')
            .addChannelOption(opt => opt.setName('category').setDescription('The category channel').setRequired(true).addChannelTypes(ChannelType.GuildCategory))
        )
        .addSubcommand(sub => sub
            .setName('role')
            .setDescription('Add or remove a role from ticket permissions')
            .addStringOption(opt => opt.setName('action').setDescription('Add or Remove').setRequired(true).addChoices(
                { name: 'Add', value: 'add' },
                { name: 'Remove', value: 'remove' }
            ))
            .addStringOption(opt => opt.setName('type').setDescription('What level of access').setRequired(true).addChoices(
                { name: 'Staff', value: 'staffRoleIds' },
                { name: 'Admin', value: 'adminRoleIds' },
                { name: 'Owner', value: 'ownerRoleIds' },
                { name: 'Developer', value: 'developerRoleIds' }
            ))
            .addRoleOption(opt => opt.setName('role').setDescription('The role to modify').setRequired(true))
        ),
    
    async execute(interaction) {
        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'category') {
            const category = interaction.options.getChannel('category');
            await db.updateGuildConfig(interaction.guild.id, { ticketCategoryId: category.id });
            await interaction.reply({ content: `✅ Ticket category updated to ${category.name}`, ephemeral: true });
        } 
        else if (subcommand === 'role') {
            const action = interaction.options.getString('action');
            const type = interaction.options.getString('type');
            const role = interaction.options.getRole('role');

            const currentArray = guildConfig[type] || [];
            
            if (action === 'add') {
                if (currentArray.includes(role.id)) {
                    return interaction.reply({ content: `❌ That role is already in the ${type} list.`, ephemeral: true });
                }
                currentArray.push(role.id);
            } else if (action === 'remove') {
                const index = currentArray.indexOf(role.id);
                if (index === -1) {
                    return interaction.reply({ content: `❌ That role is not in the ${type} list.`, ephemeral: true });
                }
                currentArray.splice(index, 1);
            }

            const updateData = {};
            updateData[type] = currentArray;
            await db.updateGuildConfig(interaction.guild.id, updateData);
            
            await interaction.reply({ content: `✅ Successfully ${action}ed ${role.name} to/from ${type}.`, ephemeral: true });
        }
    },
};
