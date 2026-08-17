const renderModerationPanel = require(
    "../panels/renderModerationPanel"
);

const renderSecurityPanel = require(
    "../panels/renderSecurityPanel"
);

const renderLoggingPanel = require(
    "../panels/renderLoggingPanel"
);

const renderVerificationPanel = require(
    "../panels/renderVerificationPanel"
);

const panelRegistry =
    new Map();

/**
 * Moderation
 */

panelRegistry.set(

    "moderation",

    {
        label:
            "Moderation",

        emoji:
            "🔨",

        render:
            renderModerationPanel
    }
);

/**
 * Security
 */

panelRegistry.set(

    "security",

    {
        label:
            "Security",

        emoji:
            "🛡️",

        render:
            renderSecurityPanel
    }
);

/**
 * Logging
 */

panelRegistry.set(

    "logging",

    {
        label:
            "Logging",

        emoji:
            "📜",

        render:
            renderLoggingPanel
    }
);

/**
 * Verification
 */

panelRegistry.set(

    "verification",

    {
        label:
            "Verification",

        emoji:
            "✅",

        render:
            renderVerificationPanel
    }
);

module.exports =
    panelRegistry;