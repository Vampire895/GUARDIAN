module.exports = {
    id: "antiraid",

    title: "Anti Raid",

    description:
        "Detects mass joins and raid attempts.",

    category: "Raid Defense",

    configPath: "antiRaid",

    supports: {
        enabled: true,
        action: true,
        reset: true,

        joinThreshold: true,
        interval: true,
    }
};