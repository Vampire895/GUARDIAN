const { checkPermissions } = require(
    "../../systems/permission-system"
);

const renderHomePanel = require(
    "../../systems/control-system/panels/homePanel"
);

const name = "control";

const description =
    "Open the control center.";

async function execute(message) {

    /**
     * Permission check
     */
    const permCheck =
        checkPermissions({

            member:
                message.member,

            botMember:
                message.guild.members.me,

            requiredPermissions: [
                "ManageGuild"
            ]
        });

    if (!permCheck.success) {

        return message.reply({

            content:
                "❌ You need Manage Server permission."
        });
    }

    /**
     * Render dashboard
     */
    await renderHomePanel({
        message
    });
}

module.exports = {

    name,

    description,

    execute
};