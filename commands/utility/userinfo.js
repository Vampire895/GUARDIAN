const {
    EmbedBuilder
} = require("discord.js");

const name =
    "userinfo";

const aliases = [
    "ui",
    "whois"
];

const description =
    "Show detailed information about a server member.";


/**
 * Format Discord timestamp
 */
function timestamp(date) {

    if (!date) {
        return "Unknown";
    }

    return `<t:${Math.floor(
        date.getTime() / 1000
    )}:R>`;
}


/**
 * Resolve target member
 */
async function resolveMember(
    message,
    input
) {

    /**
     * No target = command author
     */
    if (!input) {

        return message.member;
    }


    /**
     * Mention
     */
    const mentionedMember =
        message.mentions.members.first();

    if (mentionedMember) {

        return mentionedMember;
    }


    /**
     * User ID
     */
    const userId =
        input.replace(
            /[<@!>]/g,
            ""
        );


    if (!/^\d{17,20}$/.test(userId)) {

        return null;
    }


    try {

        return await message.guild.members.fetch(
            userId
        );

    } catch {

        return null;
    }
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
     * Resolve target
     */
    const member =
        await resolveMember(
            message,
            args[0]
        );


    if (!member) {

        return message.reply({

            embeds: [

                new EmbedBuilder()

                    .setTitle(
                        "❌ User Not Found"
                    )

                    .setDescription(
                        "I couldn't find that member in this server."
                    )

                    .addFields({

                        name:
                            "Example",

                        value:
`• \`.userinfo\`
• \`.userinfo @User\`
• \`.ui USER_ID\`
• \`.whois @User\``

                    })

            ]

        });
    }


    const user =
        member.user;


    /**
     * Server nickname
     */
    const nickname =
        member.nickname
            ? member.nickname
            : "None";


    /**
     * Highest role
     */
    const highestRole =
        member.roles.highest;


    /**
     * Roles
     *
     * Exclude @everyone.
     */
    const roles =
        member.roles.cache

            .filter(
                role =>
                    role.id !== guild.id
            )

            .sort(
                (a, b) =>
                    b.position - a.position
            );


    let roleText =
        roles.size
            ? roles
                .map(
                    role =>
                        `<@&${role.id}>`
                )
                .slice(0, 15)
                .join(", ")
            : "None";


    if (roles.size > 15) {

        roleText +=
            `\n...and ${roles.size - 15} more`;
    }


    /**
     * Account status
     */
    const presence =
        member.presence;


    const status =
        presence?.status
            ? presence.status
                .replace(
                    "online",
                    "🟢 Online"
                )
                .replace(
                    "idle",
                    "🌙 Idle"
                )
                .replace(
                    "dnd",
                    "⛔ Do Not Disturb"
                )
                .replace(
                    "offline",
                    "⚫ Offline"
                )
            : "⚫ Offline";


    /**
     * Activities
     */
    const activities =
        presence?.activities || [];


    let activityText =
        "None";


    if (activities.length) {

        activityText =
            activities

                .slice(0, 3)

                .map(
                    activity => {

                        if (
                            activity.name
                        ) {

                            return `🎮 ${activity.name}`;
                        }

                        return null;
                    }
                )

                .filter(Boolean)

                .join("\n")
                ||
                "None";
    }


    /**
     * Key permissions
     */
    const permissions =
        member.permissions;


    const importantPermissions = [];


    if (
        permissions.has("Administrator")
    ) {

        importantPermissions.push(
            "👑 Administrator"
        );

    } else {

        if (
            permissions.has("ManageGuild")
        ) {

            importantPermissions.push(
                "⚙️ Manage Server"
            );
        }

        if (
            permissions.has("ManageChannels")
        ) {

            importantPermissions.push(
                "📺 Manage Channels"
            );
        }

        if (
            permissions.has("ManageRoles")
        ) {

            importantPermissions.push(
                "🎭 Manage Roles"
            );
        }

        if (
            permissions.has("BanMembers")
        ) {

            importantPermissions.push(
                "🔨 Ban Members"
            );
        }

        if (
            permissions.has("KickMembers")
        ) {

            importantPermissions.push(
                "👢 Kick Members"
            );
        }

        if (
            permissions.has("ModerateMembers")
        ) {

            importantPermissions.push(
                "⏱️ Moderate Members"
            );
        }
    }


    const permissionText =
        importantPermissions.length
            ? importantPermissions.join("\n")
            : "No major administrative permissions";


    /**
     * Booster
     */
    const booster =
        member.premiumSince;


    const boosterText =
        booster
            ? `💎 Boosting since ${timestamp(booster)}`
            : "Not boosting this server";


    /**
     * Bot status
     */
    const botText =
        user.bot
            ? "🤖 Bot"
            : "👤 Human";


    /**
     * Avatar
     */
    const avatar =
        user.displayAvatarURL({

            size:
                1024,

            extension:
                "png",

            forceStatic:
                false
        });


    /**
     * Banner
     */
    let banner =
        null;


    try {

        const fetchedUser =
            await user.fetch();

        banner =
            fetchedUser.bannerURL({

                size:
                    1024,

                extension:
                    "png",

                forceStatic:
                    false
            });

    } catch {

        banner =
            null;
    }


    /**
     * Embed color
     */
    const color =
        highestRole?.color
            && highestRole.color !== 0

            ? highestRole.color

            : 0x5865F2;


    /**
     * Build embed
     */
    const embed =
        new EmbedBuilder()

            .setColor(color)

            .setTitle(
                `👤 User Information — ${member.displayName}`
            )

            .setThumbnail(
                avatar
            )

            .setDescription(
`${member}
${botText}

🆔 \`${user.id}\``
            )

            .addFields(

                {
                    name:
                        "🏷️ Username",

                    value:
                        `\`${user.tag}\``,

                    inline:
                        true
                },

                {
                    name:
                        "📛 Server Nickname",

                    value:
                        `\`${nickname}\``,

                    inline:
                        true
                },

                {
                    name:
                        "🟢 Status",

                    value:
                        status,

                    inline:
                        true
                },

                {
                    name:
                        "📅 Account Created",

                    value:
                        timestamp(
                            user.createdAt
                        ),

                    inline:
                        true
                },

                {
                    name:
                        "📥 Joined Server",

                    value:
                        timestamp(
                            member.joinedAt
                        ),

                    inline:
                        true
                },

                {
                    name:
                        "🏆 Highest Role",

                    value:
                        highestRole
                            ? `${highestRole}`
                            : "None",

                    inline:
                        true
                },

                {
                    name:
                        "🎭 Roles",

                    value:
                        roleText,

                    inline:
                        false
                },

                {
                    name:
                        "🎮 Activity",

                    value:
                        activityText,

                    inline:
                        false
                },

                {
                    name:
                        "🛡️ Key Permissions",

                    value:
                        permissionText,

                    inline:
                        false
                },

                {
                    name:
                        "🚀 Server Boost",

                    value:
                        boosterText,

                    inline:
                        false
                }

            );


    /**
     * Banner
     */
    if (banner) {

        embed.setImage(
            banner
        );
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