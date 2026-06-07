const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const { AttachmentBuilder } = require('discord.js');
const config = require('../../config');
const db = require('./database');

async function handleSelectMenu(interaction, client) {
    if (interaction.customId === 'ticket_select_type') {
        const selectedValue = interaction.values[0];
        const optionData = config.ticketOptions.find(o => o.value === selectedValue);
        
        if (!optionData) return interaction.reply({ content: 'Invalid ticket type.', ephemeral: true });

        const modal = new ModalBuilder()
            .setCustomId(`ticket_modal_${selectedValue}`)
            .setTitle('What is your issue?');

        const reasonInput = new TextInputBuilder()
            .setCustomId('ticket_reason')
            .setLabel("Description - Must be between 30 and 4,000 in length.")
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(30)
            .setMaxLength(4000)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(reasonInput)
        );

        await interaction.showModal(modal);
    } else if (interaction.customId === 'ticket_transfer_select') {
        const role = interaction.values[0];
        const ticket = await db.getTicket(interaction.channel.id);
        if (!ticket) return interaction.reply({ content: 'Ticket not found.', ephemeral: true });
        
        const guildConfig = await db.getGuildConfig(interaction.guild.id);
        let ping = '@here';
        if (role === 'staff') ping = guildConfig.staffRoleIds && guildConfig.staffRoleIds[0] ? `<@&${guildConfig.staffRoleIds[0]}>` : '@Staff';
        if (role === 'admin') ping = guildConfig.adminRoleIds && guildConfig.adminRoleIds[0] ? `<@&${guildConfig.adminRoleIds[0]}>` : '@Admins';
        if (role === 'dev') ping = guildConfig.developerRoleIds && guildConfig.developerRoleIds[0] ? `<@&${guildConfig.developerRoleIds[0]}>` : '@Developers';
        if (role === 'owner') ping = guildConfig.ownerRoleIds && guildConfig.ownerRoleIds[0] ? `<@&${guildConfig.ownerRoleIds[0]}>` : '@Owner';
        
        await interaction.channel.send(`🔁 This ticket has been transferred to ${ping} by <@${interaction.user.id}>.`);
        await interaction.update({ content: 'Ticket transferred successfully!', components: [] });
        await logTicketAction(client, interaction.guild, 'Ticket Transferred', `Thread: <#${interaction.channel.id}>\nTransferred To: ${ping}\nBy: <@${interaction.user.id}>`, config.colors.primary);
    }
}

async function handleModalSubmit(interaction, client) {
    if (interaction.customId.startsWith('ticket_modal_')) {
        await interaction.deferReply({ ephemeral: true });

        const typeValue = interaction.customId.replace('ticket_modal_', '');
        const optionData = config.ticketOptions.find(o => o.value === typeValue);
        const reason = interaction.fields.getTextInputValue('ticket_reason');
        
        // Reset the select menu on the panel message so it doesn't get "stuck"
        if (interaction.message && interaction.message.components) {
            await interaction.message.edit({ components: interaction.message.components }).catch(() => {});
        }
        
        const guild = interaction.guild;
        const guildConfig = await db.getGuildConfig(guild.id);

        let prefix = 'ticket';
        if (typeValue === 'bug_report') prefix = 'bug';
        else if (typeValue === 'user_report') prefix = 'report';
        else if (typeValue === 'general_request') prefix = 'help';

        const threadName = `${prefix}-${interaction.user.username}`;

        try {
            // Create private thread from the panel channel
            const thread = await interaction.channel.threads.create({
                name: threadName,
                autoArchiveDuration: 1440,
                type: ChannelType.PrivateThread,
                reason: 'Ticket thread'
            });

            // Add the user to the private thread
            await thread.members.add(interaction.user.id);

            const ticketId = Math.floor(Math.random() * 100000).toString();

            // Store in DB using thread ID
            await db.createTicket({
                channelId: thread.id,
                ticketId,
                creatorId: interaction.user.id,
                type: typeValue,
                claimerId: null,
                status: 'open',
                createdAt: Date.now(),
                closedAt: null
            });

            // Formatting exactly like screenshots
            let staffPing = '@Staff';
            if (typeValue === 'general_request' || typeValue === 'other_request') {
                staffPing = guildConfig.staffRoleIds && guildConfig.staffRoleIds.length > 0 ? `<@&${guildConfig.staffRoleIds[0]}>` : '@Staff';
            } else if (typeValue === 'user_report' || typeValue === 'staff_abuse') {
                staffPing = guildConfig.adminRoleIds && guildConfig.adminRoleIds.length > 0 ? `<@&${guildConfig.adminRoleIds[0]}>` : '@Admins';
            } else if (typeValue === 'bug_report') {
                staffPing = guildConfig.developerRoleIds && guildConfig.developerRoleIds.length > 0 ? `<@&${guildConfig.developerRoleIds[0]}>` : '@Developers';
            } else if (typeValue === 'owner_contact') {
                staffPing = guildConfig.ownerRoleIds && guildConfig.ownerRoleIds.length > 0 ? `<@&${guildConfig.ownerRoleIds[0]}>` : '@Owner';
            }

            const contentText = `Thank you for your patience <@${interaction.user.id}>\n${staffPing} will be with you shortly.`;

            const claimersEmbed = new EmbedBuilder()
                .setTitle('Claimers')
                .setDescription('• 🦅 No one has claimed this ticket yet.')
                .setColor('#9b59b6') // Purple
                .setThumbnail('https://i.imgur.com/vH1l5s4.png'); // Placeholder purple shield

            const reasonEmbed = new EmbedBuilder()
                .setTitle('Reason')
                .setDescription(reason)
                .setColor('#ff5555'); // Pink/Red

            const closeBtn = new ButtonBuilder().setCustomId('ticket_btn_close').setLabel('Close').setStyle(ButtonStyle.Danger).setEmoji('🔒');
            const transferBtn = new ButtonBuilder().setCustomId('ticket_btn_transfer').setLabel('Transfer').setStyle(ButtonStyle.Secondary).setEmoji('🔁');
            const claimBtn = new ButtonBuilder().setCustomId('ticket_btn_claim').setLabel('Claim').setStyle(ButtonStyle.Success).setEmoji('📝');

            const row = new ActionRowBuilder().addComponents(closeBtn, transferBtn, claimBtn);

            await thread.send({ content: contentText, embeds: [claimersEmbed, reasonEmbed], components: [row] });
            
            await logTicketAction(client, guild, 'Ticket Created', `User: <@${interaction.user.id}>\nThread: <#${thread.id}>\nType: ${optionData.label}`, config.colors.success);

            await interaction.editReply(`Your ticket has been created: <#${thread.id}>`);
        } catch (error) {
            console.error('[TICKET CREATE ERROR]', error);
            await interaction.editReply('Failed to create ticket thread. Please check permissions and ensure the server has Private Threads enabled.');
        }
    }
}

async function handleButton(interaction, client) {
    const { customId, channel: thread, user, guild } = interaction;
    const ticket = await db.getTicket(thread.id);

    if (!ticket) {
        if (customId.startsWith('ticket_btn_')) {
            return interaction.reply({ content: 'This thread is not registered as a ticket in the database.', ephemeral: true });
        }
        return;
    }

    const guildConfig = await db.getGuildConfig(guild.id);

    // Check staff permissions
    const isStaff = [...guildConfig.staffRoleIds, ...guildConfig.adminRoleIds, ...guildConfig.ownerRoleIds, ...guildConfig.developerRoleIds].some(roleId => interaction.member.roles.cache.has(roleId)) || interaction.member.permissions.has(PermissionFlagsBits.Administrator);

    if (customId === 'ticket_btn_claim') {
        if (!isStaff) return interaction.reply({ content: 'Only staff members can claim tickets.', ephemeral: true });
        if (ticket.claimerId) return interaction.reply({ content: `This ticket is already claimed by <@${ticket.claimerId}>.`, ephemeral: true });

        await db.updateTicket(thread.id, { claimerId: user.id });

        const claimersEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
        claimersEmbed.setDescription(`• 🦅 <@${user.id}>`);

        await interaction.update({ embeds: [claimersEmbed, interaction.message.embeds[1]] });

        await thread.send({ content: `🦅 <@${user.id}> is a claimer now!` });
        await logTicketAction(client, guild, 'Ticket Claimed', `Thread: <#${thread.id}>\nClaimed By: <@${user.id}>`, config.colors.primary);

    } else if (customId === 'ticket_btn_close') {
        if (!isStaff && user.id !== ticket.creatorId) return interaction.reply({ content: 'You do not have permission to close this ticket.', ephemeral: true });

        await interaction.reply({ content: 'Closing ticket and generating transcript in 5 seconds...' });

        // Generate simple text transcript for native Discord readability
        const messages = await thread.messages.fetch({ limit: 100 });
        const transcriptData = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}`).join('\n');
        const transcript = new AttachmentBuilder(Buffer.from(transcriptData, 'utf-8'), { name: `${thread.name}-transcript.txt` });

        await db.updateTicket(thread.id, { status: 'closed', closedAt: Date.now() });

        await logTicketAction(client, guild, 'Ticket Closed', `Thread: ${thread.name}\nClosed By: <@${user.id}>\nCreator: <@${ticket.creatorId}>`, config.colors.error, transcript);

        setTimeout(() => {
            thread.delete().catch(() => {});
        }, 5000);

    } else if (customId === 'ticket_btn_transfer') {
        if (!isStaff) return interaction.reply({ content: 'Only staff can transfer tickets.', ephemeral: true });
        
        const { StringSelectMenuBuilder } = require('discord.js');
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('ticket_transfer_select')
            .setPlaceholder('Select a role to transfer to')
            .addOptions([
                { label: 'Staff', value: 'staff', emoji: '🛡️' },
                { label: 'Admins', value: 'admin', emoji: '🔨' },
                { label: 'Developers', value: 'dev', emoji: '💻' },
                { label: 'Owner', value: 'owner', emoji: '👑' }
            ]);
            
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.reply({ content: 'Who would you like to transfer this ticket to?', components: [row], ephemeral: true });
    }
}

async function logTicketAction(client, guild, title, description, color, attachment = null) {
    const guildConfig = await db.getGuildConfig(guild.id);
    if (!guildConfig.logChannelId) return;
    const logChannel = guild.channels.cache.get(guildConfig.logChannelId);
    if (!logChannel) return;

    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp();

    const payload = { embeds: [embed] };
    if (attachment) payload.files = [attachment];

    try {
        await logChannel.send(payload);
    } catch (e) {
        console.error('[LOG ERROR]', e);
    }
}

module.exports = {
    handleSelectMenu,
    handleModalSubmit,
    handleButton
};
