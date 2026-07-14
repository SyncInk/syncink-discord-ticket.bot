const {
    ActionRowBuilder,
    EmbedBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder
} = require('discord.js');

const config = require('../../config');

function getDefaultPanelConfig() {
    return {
        title: 'Support Requests',
        description: [
            '<:looking:1513319472172367992> Choose the appropriate `Option` from the select `Menu` below',
            '',
            '<:rules:1513319398688034997> Any form of `Trolling/Spam` to abuse the system will result in a severe punishment'
        ],
        color: '#2b2d31',
        thumbnailUrl: 'https://cdn3.emoji.gg/emojis/70776-admin.png',
        placeholder: 'Select a ticket type'
    };
}

function getDefaultOpeningMessage() {
    return 'Thank you for your patience {user}\n{staffPing} will be with you shortly.';
}

function defaultRoleGroupForCategory(ticketType) {
    if (ticketType === 'general_request' || ticketType === 'other_request') return 'staffRoleIds';
    if (ticketType === 'user_report' || ticketType === 'staff_abuse') return 'adminRoleIds';
    if (ticketType === 'bug_report') return 'developerRoleIds';
    if (ticketType === 'owner_contact') return 'ownerRoleIds';
    return 'staffRoleIds';
}

function normalizeTicketOptions(guildConfig) {
    if (Array.isArray(guildConfig?.categoryOverrides) && guildConfig.categoryOverrides.length > 0) {
        return guildConfig.categoryOverrides.map((override) => ({
            ...override,
            roleIds: Array.isArray(override.roleIds) ? override.roleIds : [],
            roleGroup: override.roleGroup || defaultRoleGroupForCategory(override.value)
        }));
    }

    return config.ticketOptions.map((baseOption) => ({
        ...baseOption,
        roleIds: [],
        roleGroup: defaultRoleGroupForCategory(baseOption.value)
    }));
}

function getCategoryConfig(guildConfig, ticketType) {
    return normalizeTicketOptions(guildConfig).find((option) => option.value === ticketType) || null;
}

function resolveRoleIdsForCategory(guildConfig, ticketType) {
    const categoryConfig = getCategoryConfig(guildConfig, ticketType);
    if (!categoryConfig) return [];

    if (Array.isArray(categoryConfig.roleIds) && categoryConfig.roleIds.length > 0) {
        return categoryConfig.roleIds;
    }

    const fallbackKey = categoryConfig.roleGroup || defaultRoleGroupForCategory(ticketType);
    return Array.isArray(guildConfig?.[fallbackKey]) ? guildConfig[fallbackKey] : [];
}

function buildRoleMention(guildConfig, ticketType) {
    const roleIds = resolveRoleIdsForCategory(guildConfig, ticketType);
    const validRoleIds = roleIds.filter(id => /^\d+$/.test(String(id)));
    if (validRoleIds.length > 0) {
        return validRoleIds.map((roleId) => `<@&${roleId}>`).join(' ');
    }

    const fallbackKey = defaultRoleGroupForCategory(ticketType);
    if (fallbackKey === 'adminRoleIds') return '@Admins';
    if (fallbackKey === 'developerRoleIds') return '@Developers';
    if (fallbackKey === 'ownerRoleIds') return '@Owner';
    return '@Staff';
}

function buildTicketPanelPayload(guildConfig) {
    const panelConfig = {
        ...getDefaultPanelConfig(),
        ...(guildConfig?.panelConfig || {})
    };

    let descriptionLines = Array.isArray(panelConfig.description)
        ? panelConfig.description.filter(Boolean)
        : String(panelConfig.description || '')
            .split('\n')
            .map((line) => line.trim())
            .filter(Boolean);

    descriptionLines = descriptionLines.filter(line => !line.includes('__**Support Requests**__') && !line.includes('__Support Requests__'));

    if (panelConfig.thumbnailUrl === 'https://cdn.discordapp.com/emojis/1513315354439581746.webp?size=1024') {
        panelConfig.thumbnailUrl = 'https://cdn3.emoji.gg/emojis/70776-admin.png';
    }

    const embed = new EmbedBuilder()
        .setDescription(
            `# <:staff:1513328514529624185> __${panelConfig.title || 'Support Requests'}__\n\n` +
            descriptionLines.map((line) => `• ${line}`).join('\n\n')
        )
        .setColor(panelConfig.color || '#2b2d31');

    if (panelConfig.thumbnailUrl) {
        embed.setThumbnail(panelConfig.thumbnailUrl);
    }

    const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('ticket_select_type')
        .setPlaceholder(panelConfig.placeholder || 'Select a ticket type');

    for (const option of normalizeTicketOptions(guildConfig)) {
        selectMenu.addOptions(
            new StringSelectMenuOptionBuilder()
                .setLabel(option.label)
                .setDescription(option.description)
                .setValue(option.value)
                .setEmoji(option.emoji)
        );
    }

    return {
        embeds: [embed],
        components: [new ActionRowBuilder().addComponents(selectMenu)]
    };
}

module.exports = {
    buildTicketPanelPayload,
    buildRoleMention,
    defaultRoleGroupForCategory,
    getCategoryConfig,
    getDefaultOpeningMessage,
    getDefaultPanelConfig,
    normalizeTicketOptions,
    resolveRoleIdsForCategory
};
