const {
    SlashCommandBuilder,
    EmbedBuilder,
    Interaction
} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const yaml = require('js-yaml');
const minisearch = require('minisearch');

const search = new minisearch({ fields: ['id'] });
const faq = new Map();
const foldersPath = path.join(__dirname, '../../entries');
const entries = fs
    .readdirSync(foldersPath)
    .filter((file) => file.endsWith('.yaml'));

for (const file of entries) {
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

const faqKeys = [...faq.keys()];
const faqs = faqKeys.map((id) => ({ id }));
search.addAll(faqs);

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
        value: 'Previews starting from March 11, 2025 will try to release on a Tuesday: https://bsky.app/profile/jorax.bsky.social/post/3lk4lhrpmoc2p'
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
        value: 'Previews starting from March 11, 2025 will try to release on a Tuesday: https://bsky.app/profile/jorax.bsky.social/post/3lk4lhrpmoc2p'
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
        value: 'Previews starting from March 11, 2025 will try to release on a Tuesday: https://bsky.app/profile/jorax.bsky.social/post/3lk4lhrpmoc2p'
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
        await interaction.deferReply();
        switch (interaction.options.getSubcommand()) {
            case 'info':
                await interaction.editReply({ embeds: [infoEmbed] });
                break;
            case 'get':
                let faqName = interaction.options.getString('name').trim();
                let faqEntry = faq.get(search.search(faqName)[0]?.id);

                if (faqEntry === undefined) {
                    await interaction.editReply({
                        ephemeral: true,
                        content: 'Cannot find an faq with the specified tag.'
                    });
                } else {
                    const message = await interaction.editReply({
                        embeds: [faqEntry]
                    });

                    const emoji = '🚫';
                    await message.react(emoji);

                    const collector = message.createReactionCollector({
                        filter: (reaction, user) =>
                            reaction.emoji.name == emoji &&
                            user.id == interaction.user.id,
                        time: 10 * 1000
                    });

                    collector.on('collect', () => message.delete());
                    collector.on('end', async () => {
                        message
                            .fetch()
                            .then(() => {
                                const reaction =
                                    message.reactions.resolve(emoji);
                                reaction.users.remove(
                                    interaction.client.user.id
                                );
                            })
                            .catch(() => {});
                    });
                }
                break;
            case 'preview':
                const now = new Date();
                switch (now.getUTCDay()) {
                    case 0:
                    case 6:
                        await interaction.editReply({
                            embeds: [weekendPreviewEmbed]
                        });
                        break;
                    case 3:
                    case 4:
                        await interaction.editReply({ embeds: [previewEmbed] });
                        break;
                    default:
                        await interaction.editReply({
                            embeds: [notPreviewEmbed]
                        });
                        break;
                }
                break;
        }
    },
    /** @param { Interaction } interaction */
    async autocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().trim();
        let filtered = faqKeys.filter((choice) =>
            choice.includes(focusedValue)
        );

        filtered = filtered
            .concat(
                search
                    .search(focusedValue)
                    .map(({ id }) => id)
                    .filter((value) => !filtered.includes(value))
            )
            .sort();

        await interaction.respond(
            filtered
                .slice(0, 24)
                .map((choice) => ({ name: choice, value: choice }))
        );
    }
};
