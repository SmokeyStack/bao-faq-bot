const { Events, Interaction } = require('discord.js');
const InteractionsHandler = require('../classes/InteractionsHandler.js');

module.exports = {
    name: Events.InteractionCreate,
    /** @param { Interaction } interaction  */
    async execute(interaction) {
        if (interaction.isChatInputCommand()) {
            InteractionsHandler.handleSlashcommands(interaction);
        } else if (interaction.isAutocomplete()) {
            InteractionsHandler.handleAutocomplete(interaction);
        };
    },
};
