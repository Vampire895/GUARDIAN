module.exports = {
    id: "antilink",

    title: "Anti Link",

    description:
        "Blocks unauthorized links.",

    category: "Protection",

    configPath: "antiLink",

    supports: {
        enabled: true,
        action: true,
        whitelist: true,
        ignoredChannels: true,
        reset: true,

        allowedDomains: true,
    }
};