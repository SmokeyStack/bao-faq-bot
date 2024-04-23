const { SlashCommandBuilder, EmbedBuilder, Interaction } = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');

const faq = new Map();
const foldersPath = path.join(__dirname, '../../entries');
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

    if (doc['aliases'] === undefined) continue;
    for (let aliase of doc['aliases']) {
        faq.set(`${aliase} -> ${doc['name']}`, faqEntry);
    }
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

const previewEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('When Preview?')
    .setDescription(
        'Ladies and Gentlemen, it is with great honour to announce that it might be preview day'
    )
    .addFields({
        name: 'When do Previews usually happen?',
        value: 'Previews usually occur on a Wednesday or Thursday between <t:1703692800:t> and <t:1703700000:t>'
    })
    .setImage(
        'https://i.kym-cdn.com/photos/images/newsfeed/002/237/099/bfd.jpg'
    )
    .setTimestamp();
const notPreviewEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('When Preview?')
    .setDescription('It is unlikely to be preview day my dudes')
    .addFields({
        name: 'When do Previews usually happen?',
        value: 'Previews usually occur on a Wednesday or Thursday between <t:1703692800:t> and <t:1703700000:t>'
    })
    .setImage(
        'https://i.kym-cdn.com/photos/images/newsfeed/002/237/099/bfd.jpg'
    )
    .setTimestamp();
const weekendPreviewEmbed = new EmbedBuilder()
    .setColor(0x0099ff)
    .setTitle('When Preview?')
    .setDescription(
        'Mojang devs are off for the weekend, so it is unlikely to be preview day my dudes'
    )
    .addFields({
        name: 'When do Previews usually happen?',
        value: 'Previews usually occur on a Wednesday or Thursday between <t:1703692800:t> and <t:1703700000:t>'
    })
    .setImage(
        'https://i.kym-cdn.com/photos/images/newsfeed/002/237/099/bfd.jpg'
    )
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
        )
        .addSubcommand((subcommand) =>
            subcommand.setName('preview').setDescription('When Preview?')
        ),
    /** @param { Interaction } interaction */
    async execute(interaction) {
        switch (interaction.options.getSubcommand()) {
            case 'info':
                await interaction.reply({ embeds: [ infoEmbed ] });
            break;
            case 'get':
                await interaction.reply({
                    embeds: [ faq.get(interaction.options.getString('name')) ]
                });
            break;
            case 'preview':
                const now = new Date();
                switch (now.getUTCDay()) {
                    case 0:
                    case 6: await interaction.reply({ embeds: [ weekendPreviewEmbed ] }); break;
                    case 3:
                    case 4: await interaction.reply({ embeds: [ previewEmbed ] }); break;
                    default: await interaction.reply({ embeds: [ notPreviewEmbed ] }); break;
                };
            break;
        };
    },
    /** @param { Interaction } interaction */
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
