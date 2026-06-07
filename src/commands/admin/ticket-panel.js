const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, PermissionFlagsBits } = require('discord.js');
const config = require('../../../config');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-panel')
        .setDescription('Sends the ticket creation panel to the current channel.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setDescription('<:DiscordStaff:846569357353680896> **__Support Requests__**\n\n• <:looking:1513319472172367992> Choose the appropriate `Option` from the select `Menu` below\n\n• <:rules:1513319398688034997> Any form of `Trolling/Spam` to abuse the system will result in a severe punishment')
            .setColor('#2b2d31') // Invisible Discord color to match Worldwide
            .setThumbnail('https://cdn.discordapp.com/emojis/1513315354439581746.webp?size=1024');

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
