const { handleSelectMenu, handleModalSubmit, handleButton } = require('../utils/ticketUtils');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        try {
            if (interaction.isChatInputCommand()) {
                const command = client.commands.get(interaction.commandName);
                if (!command) return;
                await command.execute(interaction, client);
            } else if (interaction.isStringSelectMenu()) {
                await handleSelectMenu(interaction, client);
            } else if (interaction.isModalSubmit()) {
                await handleModalSubmit(interaction, client);
            } else if (interaction.isButton()) {
                await handleButton(interaction, client);
            }
        } catch (error) {
            console.error('[INTERACTION ERROR]', error);
            const msg = 'There was an error while executing this action!';
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: msg, ephemeral: true }).catch(() => {});
            } else {
                await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
            }
        }
    },
};
