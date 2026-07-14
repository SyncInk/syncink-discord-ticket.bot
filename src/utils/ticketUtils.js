const {
    ActionRowBuilder,
    AttachmentBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    EmbedBuilder,
    ModalBuilder,
    PermissionFlagsBits,
    TextInputBuilder,
    TextInputStyle
} = require('discord.js');

const config = require('../../config');
const db = require('./database');
const {
    buildRoleMention,
    buildTicketPanelPayload,
    getCategoryConfig,
    normalizeTicketOptions,
    resolveRoleIdsForCategory
} = require('./panelBuilder');

function renderTicketOpeningMessage(template, guildName, targetUserId, staffPing) {
    return template
        .replaceAll('{user}', `<@${targetUserId}>`)
        .replaceAll('{staffPing}', staffPing)
        .replaceAll('{server}', guildName);
}

async function handleSelectMenu(interaction, client) {
    if (interaction.customId === 'ticket_select_type') {
        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        const selectedValue = interaction.values[0];
        const optionData = getCategoryConfig(guildConfig, selectedValue);

        if (!optionData) {
            return interaction.reply({ content: '<a:refused:1520914088568295564> Invalid ticket type.', ephemeral: true });
        }

        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${selectedValue}`)
            .setTitle('What is your issue?');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticket_reason')
            .setLabel('Description')
            .setStyle(TextInputStyle.Paragraph)
            .setPlaceholder('I need help with...')
            .setMinLength(10)
            .setMaxLength(4000)
            .setRequired(true);

        modal.addComponents(new ActionRowBuilder().addComponents(reasonInput));

        await interaction.showModal(modal);

        if (interaction.message && interaction.message.components) {
            const payload = buildTicketPanelPayload(guildConfig);
            await interaction.message.edit({ components: payload.components }).catch(() => {});
        }
    } else if (interaction.customId === 'ticket_transfer_select') {
        const transferValue = interaction.values[0];
        const ticket = await db.getTicket(interaction.channel.id);
        if (!ticket) {
            return interaction.reply({ content: '<a:refused:1520914088568295564> Ticket not found.', ephemeral: true });
        }

        await interaction.update({ content: 'Transferring ticket...', components: [] });

        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        const transferOptions = Array.isArray(guildConfig.transferOptions) && guildConfig.transferOptions.length > 0
            ? guildConfig.transferOptions
            : [
                { label: 'Staff', value: 'staffRoleIds', emoji: '1513352362121625661', roleIds: [] },
                { label: 'Admins', value: 'adminRoleIds', emoji: '1513805305492799508', roleIds: [] },
                { label: 'Developers', value: 'developerRoleIds', emoji: '754668951232839772', roleIds: [] },
                { label: 'Owner', value: 'ownerRoleIds', emoji: '1513803214674464788', roleIds: [] }
            ];

        const targetOption = transferOptions.find(opt => opt.value === transferValue);
        if (!targetOption) {
            return interaction.followUp({ content: '<a:refused:1520914088568295564> Transfer option not found.', ephemeral: true });
        }

        let targetRoleIds = [];
        if (targetOption.roleIds && targetOption.roleIds.length > 0) {
            targetRoleIds = targetOption.roleIds;
        } else {
            const fallbackKey = targetOption.value;
            targetRoleIds = Array.isArray(guildConfig[fallbackKey]) ? guildConfig[fallbackKey] : [];
        }

        const validRoleIds = targetRoleIds.filter(id => /^\d+$/.test(String(id)));
        const ping = validRoleIds.length > 0
            ? validRoleIds.map((roleId) => `<@&${roleId}>`).join(' ')
            : targetOption.value === 'adminRoleIds' ? '@Admins' :
                targetOption.value === 'developerRoleIds' ? '@Developers' :
                    targetOption.value === 'ownerRoleIds' ? '@Owner' : '@Staff';

        const roleGroup = targetOption.label || targetOption.value;

        let reason = 'Transferred ticket';
        let welcomeMsgId = null;

        try {
            const msgs = await interaction.channel.messages.fetch({ after: '1', limit: 10 });
            const welcomeMsg = msgs.find((message) => message.author.id === client.user.id && message.embeds.length >= 2);
            if (welcomeMsg) {
                reason = welcomeMsg.embeds[1].description;
                welcomeMsgId = welcomeMsg.id;
            }
        } catch (error) {
            console.error('[TRANSFER] Failed to inspect welcome message:', error);
        }

        const parentChannel = interaction.channel.parent;

        try {
            const newThread = await parentChannel.threads.create({
                name: interaction.channel.name,
                autoArchiveDuration: 1440,
                type: ChannelType.PrivateThread,
                reason: 'Ticket transferred'
            });

            await newThread.members.add(ticket.creatorId);

            const contentText = renderTicketOpeningMessage(
                guildConfig.defaultTicketMessages.openingLine,
                interaction.guild.name,
                ticket.creatorId,
                ping
            );

            const claimersEmbed = new EmbedBuilder()
                .setTitle('Claimers')
                .setDescription('• No one has claimed this ticket yet.')
                .setColor(config.colors.primary)
                .setThumbnail(targetOption && targetOption.emoji ? `https://cdn.discordapp.com/emojis/${targetOption.emoji.match(/\d+/) ? targetOption.emoji.match(/\d+/)[0] : ''}.webp?size=1024` : null);

            const reasonEmbed = new EmbedBuilder()
                .setTitle('Reason')
                .setDescription(reason)
                .setColor('#ff5555');

            const closeBtn = new ButtonBuilder()
                .setCustomId('ticket_btn_close')
                .setLabel('Close')
                .setStyle(ButtonStyle.Danger)
                .setEmoji('🔒');
            const transferBtn = new ButtonBuilder()
                .setCustomId('ticket_btn_transfer')
                .setLabel('Transfer')
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('🔄');
            const claimBtn = new ButtonBuilder()
                .setCustomId('ticket_btn_claim')
                .setLabel('Claim')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🙋');

            const row = new ActionRowBuilder().addComponents(closeBtn, transferBtn, claimBtn);

            await newThread.send({
                content: contentText,
                embeds: [claimersEmbed, reasonEmbed],
                components: [row]
            });

            const transferHistory = Array.isArray(ticket.transferHistory) ? [...ticket.transferHistory] : [];
            transferHistory.push({
                fromChannelId: interaction.channel.id,
                toChannelId: newThread.id,
                performedById: interaction.user.id,
                targetGroup: roleGroup,
                targetRoleIds,
                timestamp: Date.now()
            });

            await db.updateTicket(interaction.channel.id, {
                channelId: newThread.id,
                lastActivityAt: Date.now(),
                transferHistory
            });

            await db.createActivityLog({
                guildId: interaction.guild.id,
                type: 'ticket_transferred',
                title: 'Ticket transferred',
                description: `${interaction.user.username} transferred ${ticket.ticketId} to ${roleGroup}.`,
                actorId: interaction.user.id,
                actorTag: interaction.user.tag,
                ticketChannelId: newThread.id,
                relatedTicketId: ticket.ticketId,
                metadata: {
                    fromChannelId: interaction.channel.id,
                    toChannelId: newThread.id,
                    targetGroup: roleGroup
                }
            });

            await logTicketAction(
                client,
                interaction.guild,
                'Ticket Transferred',
                `Old Thread: <#${interaction.channel.id}>\nNew Thread: <#${newThread.id}>\nTransferred To: ${ping}\nBy: <@${interaction.user.id}>`,
                config.colors.primary
            );

            try {
                await interaction.channel.members.remove(ticket.creatorId);
            } catch (error) {
                console.error('[TRANSFER] Failed to remove creator from old thread:', error);
            }

            const embed = new EmbedBuilder()
                .setDescription(`🔄 **This ticket has been transferred to** <#${newThread.id}>`)
                .setColor(config.colors.success);

            if (welcomeMsgId) {
                await interaction.channel.send({
                    embeds: [embed],
                    reply: { messageReference: welcomeMsgId }
                });
            } else {
                await interaction.channel.send({ embeds: [embed] });
            }

            await interaction.channel.setName(`transferred-${ticket.creatorId}`).catch(() => {});
            await interaction.channel.setLocked(true).catch(() => {});
            await interaction.channel.setArchived(true).catch(() => {});
        } catch (error) {
            console.error('[TRANSFER] Transfer cloning failed:', error);
        }
    }
}

async function handleModalSubmit(interaction, client) {
    if (!interaction.customId.startsWith('ticket_modal_')) {
        return;
    }

    await interaction.deferReply({ ephemeral: true });

    const typeValue = interaction.customId.replace('ticket_modal_', '');
    const guild = interaction.guild;
    const guildConfig = await db.getGuildConfig(guild.id);
    const optionData = getCategoryConfig(guildConfig, typeValue);
    const reason = interaction.fields.getTextInputValue('ticket_reason');

    if (!optionData) {
        return interaction.editReply('<a:refused:1520914088568295564> This ticket category is no longer available.');
    }

    let prefix = 'ticket';
    if (typeValue === 'bug_report') prefix = 'bug';
    else if (typeValue === 'user_report') prefix = 'report';
    else if (typeValue === 'general_request') prefix = 'help';

    const threadName = `${prefix}-${interaction.user.username}`;

    try {
        let thread;
        try {
            thread = await interaction.channel.threads.create({
                name: threadName,
                autoArchiveDuration: 1440,
                type: ChannelType.PrivateThread,
                reason: 'Ticket thread'
            });
            await thread.members.add(interaction.user.id);
        } catch (threadError) {
            console.error('[TICKET THREAD ERROR] Thread creation failed, falling back to text channel...', threadError.message);
            
            const staffRoleIds = resolveRoleIdsForCategory(guildConfig, typeValue);
            const staffOverwrites = staffRoleIds.map(roleId => ({
                id: roleId,
                allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
            }));

            thread = await interaction.guild.channels.create({
                name: threadName,
                type: ChannelType.GuildText,
                parent: interaction.channel.parentId,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel]
                    },
                    {
                        id: client.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    {
                        id: interaction.user.id,
                        allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory]
                    },
                    ...staffOverwrites
                ],
                reason: 'Ticket fallback channel'
            });
        }

        const ticketId = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
        const staffPing = buildRoleMention(guildConfig, typeValue);

        await db.createTicket({
            channelId: thread.id,
            ticketId,
            guildId: guild.id,
            creatorId: interaction.user.id,
            type: typeValue,
            claimerId: null,
            claimerIds: [],
            status: 'open',
            createdAt: Date.now(),
            lastActivityAt: Date.now(),
            closedAt: null,
            panelChannelId: interaction.channel.id
        });

        const contentText = renderTicketOpeningMessage(
            guildConfig.defaultTicketMessages.openingLine,
            interaction.guild.name,
            interaction.user.id,
            staffPing
        );

        const claimersEmbed = new EmbedBuilder()
            .setTitle('Claimers')
            .setDescription('• No one has claimed this ticket yet.')
            .setColor(config.colors.primary)
            .setThumbnail((optionData.emoji && /^\d+$/.test(optionData.emoji)) ? `https://cdn.discordapp.com/emojis/${optionData.emoji}.webp?size=1024` : null);

        const reasonEmbed = new EmbedBuilder()
            .setTitle('Reason')
            .setDescription(reason)
            .setColor('#ff5555');

        const closeBtn = new ButtonBuilder()
            .setCustomId('ticket_btn_close')
            .setLabel('Close')
            .setStyle(ButtonStyle.Danger)
            .setEmoji('🔒');
        const transferBtn = new ButtonBuilder()
            .setCustomId('ticket_btn_transfer')
            .setLabel('Transfer')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🔄');
        const claimBtn = new ButtonBuilder()
            .setCustomId('ticket_btn_claim')
            .setLabel('Claim')
            .setStyle(ButtonStyle.Success)
            .setEmoji('🙋');

        const row = new ActionRowBuilder().addComponents(closeBtn, transferBtn, claimBtn);

        await thread.send({ content: contentText, embeds: [claimersEmbed, reasonEmbed], components: [row] });

        await db.createActivityLog({
            guildId: guild.id,
            type: 'ticket_created',
            title: 'Ticket created',
            description: `${interaction.user.username} opened ${optionData.label}.`,
            actorId: interaction.user.id,
            actorTag: interaction.user.tag,
            ticketChannelId: thread.id,
            relatedTicketId: ticketId,
            metadata: {
                category: optionData.label,
                panelChannelId: interaction.channel.id
            }
        });

        await logTicketAction(
            client,
            guild,
            'Ticket Created',
            `User: <@${interaction.user.id}>\nThread: <#${thread.id}>\nType: ${optionData.label}`,
            config.colors.success
        );

        const successEmbed = new EmbedBuilder()
            .setDescription(`<a:approved:1520913982678896670> <#${thread.id}> **| Ticket created successfully!**`)
            .setColor(config.colors.success);
        await interaction.editReply({ content: '', embeds: [successEmbed] });
    } catch (error) {
        console.error('[TICKET CREATE ERROR]', error);
        await interaction.editReply(`<a:refused:1520914088568295564> Failed to create ticket: \`${error.message}\`. Please check my permissions in this channel (I must have \`Manage Channels\`, \`Manage Roles\`, \`Embed Links\`, and \`Create Private Threads\`).`);
    }
}

async function handleButton(interaction, client) {
    const { customId, channel: thread, user, guild } = interaction;
    const ticket = await db.getTicket(thread.id);

    if (!ticket) {
        if (customId.startsWith('ticket_btn_')) {
            return interaction.reply({
                content: '<a:refused:1520914088568295564> This thread is not registered as a ticket in the database.',
                ephemeral: true
            });
        }
        return;
    }

    const guildConfig = await db.getGuildConfig(guild.id);
    const staffRoleIds = [
        ...guildConfig.staffRoleIds,
        ...guildConfig.adminRoleIds,
        ...guildConfig.ownerRoleIds,
        ...guildConfig.developerRoleIds
    ];
    const isStaff = staffRoleIds.some((roleId) => interaction.member.roles.cache.has(roleId)) ||
        interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (customId === 'ticket_btn_claim') {
        if (!isStaff) {
            return interaction.reply({ content: '<a:refused:1520914088568295564> Only staff members can claim tickets.', ephemeral: true });
        }
        if (ticket.claimerIds && ticket.claimerIds.includes(user.id)) {
            return interaction.reply({
                content: `<a:refused:1520914088568295564> You have already claimed this ticket.`,
                ephemeral: true
            });
        }

        const claimerIds = Array.isArray(ticket.claimerIds) ? Array.from(new Set([...ticket.claimerIds, user.id])) : [user.id];
        await db.updateTicket(thread.id, {
            claimerId: ticket.claimerId || user.id, // keep first claimer as primary
            claimerIds,
            claimedAt: ticket.claimedAt || Date.now(),
            lastActivityAt: Date.now(),
            activityCount: (ticket.activityCount || 0) + 1
        });

        const claimersEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        const formattedClaimers = claimerIds.map(id => `• <:claimers:1513345698689581087> <@${id}>`).join('\n\n');
        claimersEmbed.setDescription(formattedClaimers);

        const embedsToKeep = interaction.message.embeds.slice(1);
        await interaction.update({ embeds: [claimersEmbed, ...embedsToKeep] });
        await thread.send({ content: `<:claimers:1513345698689581087> <@${user.id}> is a claimer now!` });

        await db.createActivityLog({
            guildId: guild.id,
            type: 'ticket_claimed',
            title: 'Ticket claimed',
            description: `${user.username} claimed ${ticket.ticketId}.`,
            actorId: user.id,
            actorTag: user.tag,
            ticketChannelId: thread.id,
            relatedTicketId: ticket.ticketId
        });

        await logTicketAction(
            client,
            guild,
            'Ticket Claimed',
            `Thread: <#${thread.id}>\nClaimed By: <@${user.id}>`,
            config.colors.primary
        );
    } else if (customId === 'ticket_btn_close') {
        if (!isStaff && user.id !== ticket.creatorId) {
            return interaction.reply({
                content: '<a:refused:1520914088568295564> You do not have permission to close this ticket.',
                ephemeral: true
            });
        }

        const closeEmbed = new EmbedBuilder()
            .setDescription('🔒 **| Closing ticket, please wait...**')
            .setColor(config.colors.error);
        await interaction.reply({ embeds: [closeEmbed], ephemeral: true });

        const messages = await thread.messages.fetch({ limit: 100 });
        const dbMessages = messages.map((m) => ({
            authorId: m.author.id,
            authorTag: m.author.tag,
            authorAvatar: m.author.displayAvatarURL(),
            content: m.content,
            timestamp: m.createdTimestamp,
            attachments: m.attachments.map(a => a.url)
        })).reverse();

        const transcriptData = dbMessages
            .map((message) => `[${new Date(message.timestamp).toLocaleString()}] ${message.authorTag}: ${message.content}`)
            .join('\n');

        const transcript = new AttachmentBuilder(Buffer.from(transcriptData, 'utf-8'), {
            name: `${thread.name}-transcript.txt`
        });

        await db.updateTicket(thread.id, {
            status: 'closed',
            closedAt: Date.now(),
            closedById: user.id,
            lastActivityAt: Date.now(),
            messages: dbMessages,
            activityCount: (ticket.activityCount || 0) + 1
        });

        const logResult = await logTicketAction(
            client,
            guild,
            'Ticket Closed',
            `Thread: ${thread.name}\nClosed By: <@${user.id}>\nCreator: <@${ticket.creatorId}>`,
            config.colors.error,
            transcript,
            ticket.ticketId
        );

        await db.updateTicket(thread.id, {
            transcriptChannelId: logResult?.transcriptMessage?.channelId || guildConfig.transcriptChannelId || guildConfig.logChannelId || null,
            transcriptMessageUrl: logResult?.transcriptMessage?.url || null
        });

        await db.createActivityLog({
            guildId: guild.id,
            type: 'ticket_closed',
            title: 'Ticket closed',
            description: `${user.username} closed ${ticket.ticketId}.`,
            actorId: user.id,
            actorTag: user.tag,
            ticketChannelId: thread.id,
            relatedTicketId: ticket.ticketId,
            metadata: {
                transcriptUrl: logResult?.transcriptMessage?.url || null
            }
        });

        try {
            const firstMsgCollection = await thread.messages.fetch({ after: '1', limit: 10 });
            const welcomeMsg = firstMsgCollection.find((message) => message.author.id === client.user.id && message.embeds.length >= 2);
            if (welcomeMsg) {
                const logEmbed = new EmbedBuilder()
                    .setTitle('Log')
                    .setDescription(logResult?.logMessage ? `🔒 [Ticket Log](${logResult.logMessage.url})` : '⚠️ *Log channel not set. Transcript not archived.*')
                    .setColor('#2b2d31');
                await welcomeMsg.edit({ embeds: [...welcomeMsg.embeds, logEmbed], components: [] });
            }
        } catch (error) {
            console.error('[CLOSE] Error adding log embed:', error);
        }

        const successEmbed = new EmbedBuilder()
            .setDescription('<a:approved:1520913982678896670> **| Ticket is closed successfully.**')
            .setColor(config.colors.success);
        await thread.send({ embeds: [successEmbed] });
        await thread.members.remove(ticket.creatorId).catch(() => {});
        await thread.setLocked(true).catch(() => {});
        await thread.setArchived(true).catch(() => {});
    } else if (customId === 'ticket_btn_transfer') {
        if (!isStaff) {
            return interaction.reply({ content: '<a:refused:1520914088568295564> Only staff can transfer tickets.', ephemeral: true });
        }

        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        const transferOptions = Array.isArray(guildConfig.transferOptions) && guildConfig.transferOptions.length > 0
            ? guildConfig.transferOptions
            : [
                { label: 'Staff', value: 'staffRoleIds', emoji: '1513352362121625661' },
                { label: 'Admins', value: 'adminRoleIds', emoji: '1513805305492799508' },
                { label: 'Developers', value: 'developerRoleIds', emoji: '754668951232839772' },
                { label: 'Owner', value: 'ownerRoleIds', emoji: '1513803214674464788' }
            ];

        const options = transferOptions.map(opt => {
            const emojiObj = opt.emoji && typeof opt.emoji === 'string' && opt.emoji.match(/\d+/)
                ? { id: opt.emoji.match(/\d+/)[0] }
                : (opt.emoji ? { name: opt.emoji } : undefined);
            
            return {
                label: (opt.label || 'Unknown Role').substring(0, 100),
                description: (opt.description || '').substring(0, 100),
                value: opt.value,
                emoji: emojiObj
            };
        });

        if (options.length === 0) {
            return interaction.reply({ content: '<a:refused:1520914088568295564> No transfer roles available.', ephemeral: true });
        }

        const { StringSelectMenuBuilder } = require('discord.js');
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_transfer_select')
            .setPlaceholder('Select a role to transfer to')
            .addOptions(options.slice(0, 25));

        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({
            content: 'Who would you like to transfer this ticket to?',
            components: [row],
            ephemeral: true
        });
    }
}

async function logTicketAction(client, guild, title, description, color, attachment = null, dashboardTicketId = null) {
    const guildConfig = await db.getGuildConfig(guild.id);
    const logChannel = guildConfig.logChannelId ? guild.channels.cache.get(guildConfig.logChannelId) : null;
    const transcriptChannel = guildConfig.transcriptChannelId
        ? guild.channels.cache.get(guildConfig.transcriptChannelId)
        : logChannel;

    let transcriptMessage = null;

    if (attachment && transcriptChannel) {
        try {
            transcriptMessage = await transcriptChannel.send({
                content: `Transcript archive for **${title}**`,
                files: [attachment]
            });
        } catch (error) {
            console.error('[TRANSCRIPT ERROR]', error);
        }
    }

    if (!logChannel) {
        return {
            logMessage: null,
            transcriptMessage
        };
    }

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

    if (transcriptMessage) {
        embed.addFields({
            name: 'Transcript',
            value: `[Download txt](${transcriptMessage.url})`
        });
    }

    if (dashboardTicketId) {
        const dashboardUrl = process.env.FRONTEND_URL || 'https://syncink-discord-ticketbot.up.railway.app';
        embed.addFields({
            name: 'Online Transcript',
            value: `[View on Dashboard](${dashboardUrl}/dashboard/${guild.id}/transcripts/${dashboardTicketId})`
        });
    }

    try {
        const logMessage = await logChannel.send({ embeds: [embed] });
        return {
            logMessage,
            transcriptMessage
        };
    } catch (error) {
        console.error('[LOG ERROR]', error);
        return {
            logMessage: null,
            transcriptMessage
        };
    }
}

async function sendConfiguredTicketPanel(channel) {
    const guildConfig = await db.getGuildConfig(channel.guild.id);
    const payload = buildTicketPanelPayload(guildConfig);
    return channel.send(payload);
}

module.exports = {
    handleButton,
    handleModalSubmit,
    handleSelectMenu,
    logTicketAction,
    normalizeTicketOptions,
    sendConfiguredTicketPanel
};
