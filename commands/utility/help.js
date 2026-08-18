const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const {
    createInfoEmbed
} = require("../../ui/embeds");

const name = "help";

const aliases = [
    "commands",
    "cmds"
];

const description =
    "Show all available Guardian commands.";

/**
 * Category display configuration
 */
const categoryConfig = {

    moderation: {
        name: "🛡️ MODERATION",
        order: 1
    },

    security: {
        name: "🔐 SECURITY",
        order: 2
    },

    automation: {
        name: "⚙️ AUTOMATION",
        order: 3
    },

    utility: {
        name: "🔧 UTILITY",
        order: 4
    }
};

/**
 * Build command list
 */
function getCommands(client) {

    const uniqueCommands =
        new Map();

    for (
        const command
        of client.commands.values()
    ) {

        if (!command.name) {
            continue;
        }

        /**
         * Prevent aliases from
         * appearing as separate commands
         */
        if (
            uniqueCommands.has(
                command.name.toLowerCase()
            )
        ) {
            continue;
        }

        uniqueCommands.set(
            command.name.toLowerCase(),
            command
        );
    }

    return [
        ...uniqueCommands.values()
    ];
}

/**
 * Build help pages
 *
 * Each category gets its own page.
 */
function buildHelpPages(client) {

    const commands =
        getCommands(client);

    const categories =
        new Map();

    /**
     * Group commands by category
     */
    for (const command of commands) {

        const category =
            (
                command.category
                || "utility"
            ).toLowerCase();

        if (!categories.has(category)) {

            categories.set(
                category,
                []
            );
        }

        categories
            .get(category)
            .push(command);
    }

    /**
     * Sort commands alphabetically
     */
    for (
        const categoryCommands
        of categories.values()
    ) {

        categoryCommands.sort(
            (a, b) =>
                a.name.localeCompare(
                    b.name
                )
        );
    }

    /**
     * Sort categories
     */
    const sortedCategories =
        [...categories.entries()]
            .sort(
                ([a], [b]) => {

                    const orderA =
                        categoryConfig[a]?.order
                        ?? 999;

                    const orderB =
                        categoryConfig[b]?.order
                        ?? 999;

                    return orderA - orderB;
                }
            );

    /**
     * Create ONE page per category
     */
    const pages = [];

    for (
        const [
            category,
            categoryCommands
        ]
        of sortedCategories
    ) {

        const categoryName =
            categoryConfig[category]?.name
            || `📁 ${category.toUpperCase()}`;

        /**
         * Build command lines
         */
       const commandLines =
    categoryCommands.map(
        command =>
            `\`.${command.name}\``
    );

        /**
         * Create category page
         */
        const content =

`${categoryName}

${commandLines.join("\n")}`;

        pages.push(
            createInfoEmbed(
                `📖 Guardian Commands\n\n${content}`
            )
        );
    }

    /**
     * Always have at least one page
     */
    if (!pages.length) {

        pages.push(
            createInfoEmbed(
                "📖 Guardian Commands\n\n" +
                "No commands are currently available."
            )
        );
    }

    return pages;
}

/**
 * Build pagination buttons
 */
function buildPaginationRow({
    userId,
    page,
    totalPages
}) {

    const row =
        new ActionRowBuilder();

    /**
     * Previous
     */
    row.addComponents(

        new ButtonBuilder()

            .setCustomId(
                `help:button:page:prev:${userId}:${page}`
            )

            .setLabel("◀️")

            .setStyle(
                ButtonStyle.Secondary
            )

    );

    /**
     * Page indicator
     */
    row.addComponents(

        new ButtonBuilder()

            .setCustomId(
                `help:button:page:current:${userId}:${page}`
            )

            .setLabel(
                `${page + 1} / ${totalPages}`
            )

            .setStyle(
                ButtonStyle.Secondary
            )

            .setDisabled(true)

    );

    /**
     * Next
     */
    row.addComponents(

        new ButtonBuilder()

            .setCustomId(
                `help:button:page:next:${userId}:${page}`
            )

            .setLabel("▶️")

            .setStyle(
                ButtonStyle.Secondary
            )

    );

    return row;
}

/**
 * Execute command
 */
async function execute(
    message
) {

    const pages =
        buildHelpPages(
            message.client
        );

    const row =
        buildPaginationRow({

            userId:
                message.author.id,

            page:
                0,

            totalPages:
                pages.length
        });

    await message.reply({

        embeds: [
            pages[0]
        ],

        components:
            pages.length > 1
                ? [row]
                : []

    });
}

module.exports = {

    name,

    aliases,

    description,

    execute,

    buildHelpPages,

    buildPaginationRow
};