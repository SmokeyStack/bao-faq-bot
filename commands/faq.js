const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const exampleEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Info')
    .setDescription(
        'This bot was created by [SmokeyStack](https://smokeystack.dev) for the purpose of making a FAQ bot for the Bedrock Add-Ons Discord Server.'
    )
    .setTimestamp();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faq')
        .setDescription('Commands for accessing the FAQ')
        .addSubcommand((subcommand) =>
            subcommand.setName('get').setDescription('Return the FAQ Entry')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('list')
                .setDescription('List all the FAQ Entries')
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('info').setDescription('Info about the FAQ Bot')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'info') {
            await interaction.reply({ embeds: [exampleEmbed] });
        } else {
            await interaction.reply('Huh?');
        }
    }
};
