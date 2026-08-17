const mongoose = require("mongoose");

/**
 * Per-guild logging configuration.
 */

const logCategorySchema = new mongoose.Schema({

    enabled: {
        type: Boolean,
        default: false
    },

    channelId: {
        type: String,
        default: null
    }

}, { _id: false });

const logConfigSchema = new mongoose.Schema({

    guildId: {
        type: String,
        required: true,
        unique: true
    },

    categories: {

        moderation: {
            type: logCategorySchema,
            default: () => ({})
        },

        security: {
            type: logCategorySchema,
            default: () => ({})
        },

        automation: {
            type: logCategorySchema,
            default: () => ({})
        },

        messages: {
            type: logCategorySchema,
            default: () => ({})
        },

        members: {
            type: logCategorySchema,
            default: () => ({})
        },

        voice: {
            type: logCategorySchema,
            default: () => ({})
        },

        server: {
            type: logCategorySchema,
            default: () => ({})
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "LogConfig",
    logConfigSchema
);