const { ChannelType, PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');
const db = require('../../utils/database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-config')
        .setDescription('Configure ticket system settings for the server')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand((subcommand) => subcommand
            .setName('category')
            .setDescription('Set the category where new tickets are created')
            .addChannelOption((option) => option
                .setName('category')
                .setDescription('The category channel')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
            )
        )
        .addSubcommand((subcommand) => subcommand
            .setName('role')
            .setDescription('Add or remove a role from ticket permissions')
            .addStringOption((option) => option
                .setName('action')
                .setDescription('Add or Remove')
                .setRequired(true)
                .addChoices(
                    { name: 'Add', value: 'add' },
                    { name: 'Remove', value: 'remove' }
                )
            )
            .addStringOption((option) => option
                .setName('type')
                .setDescription('What level of access')
                .setRequired(true)
                .addChoices(
                    { name: 'Staff', value: 'staffRoleIds' },
                    { name: 'Admin', value: 'adminRoleIds' },
                    { name: 'Owner', value: 'ownerRoleIds' },
                    { name: 'Developer', value: 'developerRoleIds' }
                )
            )
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role to modify')
                .setRequired(true)
            )
        ),

    async execute(interaction) {
        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'category') {
            const category = interaction.options.getChannel('category');
            const previousValue = guildConfig.ticketCategoryId;

            await db.updateGuildConfig(interaction.guild.id, { ticketCategoryId: category.id });
            await db.createAuditLog({
                guildId: interaction.guild.id,
                actorId: interaction.user.id,
                actorTag: interaction.user.tag,
                source: 'discord',
                action: 'Updated ticket category',
                changes: [{
                    field: 'ticketCategoryId',
                    before: previousValue,
                    after: category.id
                }]
            });

            return interaction.reply({
                content: `Ticket category updated to ${category.name}.`,
                ephemeral: true
            });
        }

        if (subcommand === 'role') {
            const action = interaction.options.getString('action');
            const type = interaction.options.getString('type');
            const role = interaction.options.getRole('role');
            const currentArray = Array.isArray(guildConfig[type]) ? [...guildConfig[type]] : [];

            if (action === 'add') {
                if (currentArray.includes(role.id)) {
                    return interaction.reply({
                        content: `That role is already in the ${type} list.`,
                        ephemeral: true
                    });
                }
                currentArray.push(role.id);
            } else {
                const index = currentArray.indexOf(role.id);
                if (index === -1) {
                    return interaction.reply({
                        content: `That role is not in the ${type} list.`,
                        ephemeral: true
                    });
                }
                currentArray.splice(index, 1);
            }

            await db.updateGuildConfig(interaction.guild.id, { [type]: currentArray });
            await db.createAuditLog({
                guildId: interaction.guild.id,
                actorId: interaction.user.id,
                actorTag: interaction.user.tag,
                source: 'discord',
                action: 'Updated ticket role access',
                changes: [{
                    field: type,
                    before: guildConfig[type],
                    after: currentArray
                }]
            });

            return interaction.reply({
                content: `Successfully ${action === 'add' ? 'added' : 'removed'} ${role.name} ${action === 'add' ? 'to' : 'from'} ${type}.`,
                ephemeral: true
            });
        }
    }
};
