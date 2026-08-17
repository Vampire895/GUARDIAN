module.exports = {
    id: "whitelist",

    title: "Whitelist",

    description:
        "Manage globally trusted users and roles.",

    category: "Exceptions",

    configPath: "whitelist",

    supports: {
        users: true,
        roles: true,
        channels: true,
        reset: true,
    }
};