const mongoose = require("mongoose");

const schema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    reactionRoles: {
        type: Array,
        default: []
    },

    // =========================
    // 🔥 ANTI-SPAM
    // =========================

    antiSpam: {

        enabled: {
            type: Boolean,
            default: false
        },

        maxMessages: {
            type: Number,
            default: 5
        },

        interval: {
            type: Number,
            default: 5000
        },

        action: {
            type: String,
            default: "timeout"
        },

        whitelist: {

            users: {
                type: [String],
                default: []
            },

            roles: {
                type: [String],
                default: []
            }
        }
    },

    // =========================
    // 🔥 ANTI-LINK
    // =========================

    antiLink: {

        enabled: {
            type: Boolean,
            default: false
        },

        allowedDomains: {
            type: [String],
            default: []
        },

        action: {
            type: String,
            default: "timeout"
        },

        whitelist: {

            users: {
                type: [String],
                default: []
            },

            roles: {
                type: [String],
                default: []
            }
        }
    },

    // =========================
    // 🔥 INVITE FILTER
    // =========================

    inviteFilter: {

        enabled: {
            type: Boolean,
            default: false
        },

        action: {
            type: String,
            default: "timeout"
        },

        whitelist: {

            users: {
                type: [String],
                default: []
            },

            roles: {
                type: [String],
                default: []
            }
        }
    },

    // =========================
    // 🔥 ANTI-RAID
    // =========================

    antiRaid: {

        enabled: {
            type: Boolean,
            default: false
        },

        joinThreshold: {
            type: Number,
            default: 5
        },

        interval: {
            type: Number,
            default: 10000
        },

        action: {
            type: String,
            default: "kick"
        },

        whitelist: {

            users: {
                type: [String],
                default: []
            },

            roles: {
                type: [String],
                default: []
            }
        }
    },

    // =========================
    // 🔥 ANTI-BOT
    // =========================

    antiBot: {

        enabled: {
            type: Boolean,
            default: false
        },

        whitelist: {

            users: {
                type: [String],
                default: []
            },

            roles: {
                type: [String],
                default: []
            }
        }
    },

    // =========================
    // 🔥 IGNORED CHANNELS
    // =========================

    ignoredChannels: {

        type: [String],

        default: []
    },

        // =========================
    // 🛡️ VERIFICATION
    // =========================

    verification: {

        enabled: {
            type: Boolean,
            default: false
        },

        type: {
            type: String,
            enum: [
                "reaction",
                "self"
            ],
            default: null
        },

        channelId: {
            type: String,
            default: null
        },

        roleIds: {
            type: [String],
            default: []
        },

        phrase: {
            type: String,
            default: null
        },

        messageId: {
            type: String,
            default: null
        }
    },

    // =========================
    // 🔥 ESCALATION
    // =========================

    escalation: {

        enabled: {
            type: Boolean,
            default: false
        },

        rules: [

            {
                count: Number,

                action: String
            }
        ]
    }

}, {

    timestamps: true
});

module.exports =
    mongoose.model(
        "SecurityConfig",
        schema
    );