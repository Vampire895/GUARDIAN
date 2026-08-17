const {
    EmbedBuilder
} = require("discord.js");

const name =
    "roleinfo";

const aliases = [
    "ri"
];

const description =
    "Show detailed information about a role.";


/**
 * Format timestamp
 */
function timestamp(
    date
) {

    if (!date) {
        return "Unknown";
    }

    return `<t:${Math.floor(
        date.getTime() / 1000
    )}:R>`;
}


/**
 * Execute command
 */
async function execute(
    message,
    args
) {

    const guild =
        message.guild;

    if (!guild) {

        return message.reply(
            "❌ This command can only be used inside a server."
        );
    }


    /**
     * Resolve role
     */
    let role = null;


    /**
     * Role mention
     */
    const mentionedRole =
        message.mentions.roles.first();

    if (mentionedRole) {

        role =
            mentionedRole;

    } else if (args[0]) {

        /**
         * Role ID
         */
        const roleId =
            args[0].replace(
                /[<@&>]/g,
                ""
            );

        role =
            guild.roles.cache.get(
                roleId
            );
    }


    /**
     * No role supplied
     */
    if (!role) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ Role Not Found"
                    )

                    .setDescription(
                        "Please mention a valid role or provide its ID."
                    )

                    .addFields({

                        name:
                            "Example",

                        value:
`• \`.roleinfo @Moderators\`
• \`.ri @Moderators\`
• \`.roleinfo ROLE_ID\``

                    })

            ]

        });
    }


    /**
     * Bot's highest role
     */
    const botMember =
        guild.members.me;

    const botHighestRole =
        botMember?.roles?.highest;


    /**
     * Hierarchy status
     */
    let hierarchyStatus =
        "Unknown";


    if (role.id === guild.id) {

        hierarchyStatus =
            "👑 @everyone role";

    } else if (
        botHighestRole
        &&
        role.position <
            botHighestRole.position
    ) {

        hierarchyStatus =
            "🟢 Guardian can manage";

    } else if (
        botHighestRole
        &&
        role.position ===
            botHighestRole.position
    ) {

        hierarchyStatus =
            "🟡 Same position as Guardian";

    } else {

        hierarchyStatus =
            "🔴 Above Guardian";
    }


    /**
     * Role color
     */
    const roleColor =
        role.color !== 0
            ? role.hexColor
            : "Default";


    /**
     * Member count
     */
    const memberCount =
        role.members?.size || 0;


    /**
     * Role status
     */
    const managedStatus =
        role.managed
            ? "🤖 Yes"
            : "👤 No";

    const mentionableStatus =
        role.mentionable
            ? "🟢 Yes"
            : "🔴 No";

    const hoistedStatus =
        role.hoist
            ? "🟢 Yes"
            : "🔴 No";


    /**
     * Create embed
     */
    const embed =
        new EmbedBuilder()

            .setTitle(
                `🎭 Role Information — ${role.name}`
            )

            .setDescription(
                `${role}`
            )

            .addFields(

                {
                    name:
                        "🎭 Name",

                    value:
                        `\`${role.name}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🆔 Role ID",

                    value:
                        `\`${role.id}\``,

                    inline:
                        true
                },

                {
                    name:
                        "👥 Members",

                    value:
                        `\`${memberCount.toLocaleString()}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🎨 Color",

                    value:
                        `\`${roleColor}\``,

                    inline:
                        true
                },

                {
                    name:
                        "📊 Position",

                    value:
                        `\`${role.position}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🛡️ Guardian Hierarchy",

                    value:
                        hierarchyStatus,

                    inline:
                        true
                },

                {
                    name:
                        "📌 Hoisted",

                    value:
                        hoistedStatus,

                    inline:
                        true
                },

                {
                    name:
                        "🔔 Mentionable",

                    value:
                        mentionableStatus,

                    inline:
                        true
                },

                {
                    name:
                        "🤖 Managed",

                    value:
                        managedStatus,

                    inline:
                        true
                },

                {
                    name:
                        "📅 Created",

                    value:
                        timestamp(role.createdAt),

                    inline:
                        true
                }
            );


    /**
     * Special @everyone information
     */
    if (
        role.id === guild.id
    ) {

        embed.addFields({

            name:
                "👑 Special Role",

            value:
                "This is the server's default @everyone role.",

            inline:
                false
        });
    }


    embed

        .setFooter({

            text:
                `Guardian • Requested by ${message.author.tag}`

        })

        .setTimestamp();


    return message.reply({

        embeds: [
            embed
        ]

    });
}


module.exports = {

    name,

    aliases,

    description,

    execute

};