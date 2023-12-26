const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const faq = new Map();
const foldersPath = path.join(__dirname, '../entries');
const commandFiles = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith('.yaml'));

for (const file of commandFiles) {
    const filePath = path.join(foldersPath, file);
    const doc = yaml.load(fs.readFileSync(filePath, 'utf8'));
    const faqEntry = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle(doc['title'])
        .setDescription(doc['body'])
        .setTimestamp();
    faq.set(doc['name'], faqEntry);
}

const infoEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('Info')
    .setDescription(
        'This bot was created by [SmokeyStack](https://smokeystack.dev) for the purpose of making a FAQ bot for the Bedrock Add-Ons Discord Server.'
    )
    .addFields({
        name: 'Managing Entries',
        value: 'To manage entries, please make a pull request on GitHub.'
    })
    .addFields({
        name: 'Source Code',
        value: '[GitHub](https://github.com/SmokeyStack/bao-faq-bot)'
    })
    .setTimestamp();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('faq')
        .setDescription('Commands for accessing the FAQ')
        .addSubcommand((subcommand) =>
            subcommand
                .setName('get')
                .setDescription('Return the FAQ Entry')
                .addStringOption((option) =>
                    option
                        .setName('name')
                        .setDescription('The name of the FAQ Entry')
                        .setRequired(true)
                        .setAutocomplete(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('info').setDescription('Info about the FAQ Bot')
        ),
    async execute(interaction) {
        if (interaction.options.getSubcommand() === 'info')
            await interaction.reply({ embeds: [infoEmbed] });
        else if (interaction.options.getSubcommand() === 'get')
            await interaction.reply({
                embeds: [faq.get(interaction.options.getString('name'))]
            });
    },
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused();
        const choices = [...faq.keys()];
        const filtered = choices.filter((choice) =>
            choice.includes(focusedValue)
        );
        await interaction.respond(
            filtered
                .slice(0, 24)
                .map((choice) => ({ name: choice, value: choice }))
        );
    }
};
