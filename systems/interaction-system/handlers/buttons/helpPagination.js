const {
    buildHelpPages,
    buildPaginationRow
} = require(
    "../../../../commands/utility/help"
);

/**
 * Guardian Help Pagination
 */

module.exports = {

    customId:
        "help:button:page",

    async execute(
        interaction,
        parsed
    ) {

        /**
         * Expected data:
         *
         * prev:userId:page
         * next:userId:page
         * current:userId:page
         */

        if (!parsed.data) {
            return;
        }

        const parts =
            parsed.data.split(":");

        const action =
            parts[0];

        const userId =
            parts[1];

        const currentPage =
            Number(parts[2]);

        /**
         * Validate data
         */
        if (
            !action
            ||
            !userId
            ||
            Number.isNaN(
                currentPage
            )
        ) {

            return interaction.reply({

                content:
                    "❌ Invalid help pagination.",

                ephemeral: true
            });
        }

        /**
         * Only the user who
         * opened .help can navigate
         */
        if (
            interaction.user.id !==
            userId
        ) {

            return interaction.reply({

                content:
                    "❌ These help controls aren't for you.",

                ephemeral: true
            });
        }

        /**
         * Rebuild pages
         */
        const pages =
            buildHelpPages(
                interaction.client
            );

        const totalPages =
            pages.length;

        /**
         * Current page button
         * should never do anything.
         */
        if (
            action === "current"
        ) {

            return interaction.deferUpdate();
        }

        let newPage =
            currentPage;

        /**
         * Previous
         */
        if (
            action === "prev"
        ) {

            newPage =
                currentPage > 0
                    ? currentPage - 1
                    : totalPages - 1;
        }

        /**
         * Next
         */
        else if (
            action === "next"
        ) {

            newPage =
                currentPage <
                totalPages - 1

                    ? currentPage + 1

                    : 0;
        }

        else {

            return;
        }

        /**
         * Build updated buttons
         */
        const row =
            buildPaginationRow({

                userId,

                page:
                    newPage,

                totalPages
            });

        /**
         * Update help message
         */
        return interaction.update({

            embeds: [
                pages[newPage]
            ],

            components:
                totalPages > 1
                    ? [row]
                    : []

        });
    }
};