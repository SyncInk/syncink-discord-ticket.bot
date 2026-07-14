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
                .setDescription('What level of access or custom category')
                .setRequired(true)
                .setAutocomplete(true)
            )
            .addRoleOption((option) => option
                .setName('role')
                .setDescription('The role to modify')
                .setRequired(true)
            )
        ),

    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === 'type') {
            const guildConfig = await db.getGuildConfig(interaction.guild.id);
            const { normalizeTicketOptions } = require('../../utils/panelBuilder');
            
            const options = [
                { name: 'Global: Staff', value: 'staffRoleIds' },
                { name: 'Global: Admin', value: 'adminRoleIds' },
                { name: 'Global: Owner', value: 'ownerRoleIds' },
                { name: 'Global: Developer', value: 'developerRoleIds' }
            ];

            const categories = normalizeTicketOptions(guildConfig);
            categories.forEach(cat => {
                options.push({ name: `Category: ${cat.label}`, value: `category_${cat.value}` });
            });

            const transferOptions = Array.isArray(guildConfig.transferOptions) ? guildConfig.transferOptions : [];
            transferOptions.forEach(opt => {
                if (opt.value && opt.label) {
                    options.push({ name: `Transfer: ${opt.label}`, value: `transfer_${opt.value}` });
                }
            });

            const filtered = options.filter(opt => opt.name.toLowerCase().includes(focusedOption.value.toLowerCase())).slice(0, 25);
            await interaction.respond(filtered);
        }
    },

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
            
            let isCategory = type.startsWith('category_');
            let isTransfer = type.startsWith('transfer_');
            let targetCategoryValue = isCategory ? type.replace('category_', '') : null;
            let targetTransferValue = isTransfer ? type.replace('transfer_', '') : null;
            let currentArray = [];
            
            if (isCategory) {
                const categoryOverrides = Array.isArray(guildConfig.categoryOverrides) ? guildConfig.categoryOverrides : [];
                const catOverride = categoryOverrides.find(c => c.value === targetCategoryValue);
                currentArray = catOverride && Array.isArray(catOverride.roleIds) ? [...catOverride.roleIds] : [];
            } else if (isTransfer) {
                const transferOptions = Array.isArray(guildConfig.transferOptions) ? guildConfig.transferOptions : [];
                const transOverride = transferOptions.find(t => t.value === targetTransferValue);
                currentArray = transOverride && Array.isArray(transOverride.roleIds) ? [...transOverride.roleIds] : [];
            } else {
                currentArray = Array.isArray(guildConfig[type]) ? [...guildConfig[type]] : [];
            }

            if (action === 'add') {
                if (currentArray.includes(role.id)) {
                    return interaction.reply({
                        content: `<a:refused:1520914088568295564> That role is already in the list.`,
                        ephemeral: true
                    });
                }
                currentArray.push(role.id);
            } else {
                const index = currentArray.indexOf(role.id);
                if (index === -1) {
                    return interaction.reply({
                        content: `<a:refused:1520914088568295564> That role is not in the list.`,
                        ephemeral: true
                    });
                }
                currentArray.splice(index, 1);
            }

            if (isCategory) {
                const categoryOverrides = Array.isArray(guildConfig.categoryOverrides) ? [...guildConfig.categoryOverrides] : [];
                const catIndex = categoryOverrides.findIndex(c => c.value === targetCategoryValue);
                if (catIndex > -1) {
                    categoryOverrides[catIndex].roleIds = currentArray;
                } else {
                    categoryOverrides.push({
                        value: targetCategoryValue,
                        roleIds: currentArray
                    });
                }
                await db.updateGuildConfig(interaction.guild.id, { categoryOverrides });
            } else if (isTransfer) {
                const transferOptions = Array.isArray(guildConfig.transferOptions) ? [...guildConfig.transferOptions] : [];
                const transIndex = transferOptions.findIndex(t => t.value === targetTransferValue);
                if (transIndex > -1) {
                    transferOptions[transIndex].roleIds = currentArray;
                } else {
                    transferOptions.push({
                        value: targetTransferValue,
                        label: targetTransferValue,
                        roleIds: currentArray
                    });
                }
                await db.updateGuildConfig(interaction.guild.id, { transferOptions });
            } else {
                await db.updateGuildConfig(interaction.guild.id, { [type]: currentArray });
            }

            await db.createAuditLog({
                guildId: interaction.guild.id,
                actorId: interaction.user.id,
                actorTag: interaction.user.tag,
                source: 'discord',
                action: `Updated ticket role access (${type})`,
                changes: [{
                    field: type,
                    before: 'previous',
                    after: currentArray
                }]
            });

            return interaction.reply({
                content: `<a:approved:1520913982678896670> Successfully ${action === 'add' ? 'added' : 'removed'} ${role.name}.`,
                ephemeral: true
            });
        }
    }
};
