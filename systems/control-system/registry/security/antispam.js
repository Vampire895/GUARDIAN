module.exports = {
    id: "antispam",

    title: "Anti Spam",

    description:
        "Protects against message flooding and spam attacks.",

    category: "Protection",

    configPath: "antiSpam",

    supports: {
        enabled: true,
        action: true,
        whitelist: true,
        ignoredChannels: true,
        reset: true,

        maxMessages: true,
        interval: true,
    }
};