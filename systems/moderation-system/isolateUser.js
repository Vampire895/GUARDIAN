const IsolatedUser = require(
    "../../database/models/IsolatedUser"
);

/**
 * Isolate user
 */

async function isolateUser({

    target,

    durationMs,

    quarantineRole,

    guild
}) {

    /**
     * Prevent duplicate isolation
     */
    const existing =
        await IsolatedUser.findOne({

            userId:
                target.id,

            guildId:
                guild.id
        });

    if (existing) {

        return {

            success: false,

            error:
                "User is already isolated."
        };
    }

    /**
     * Filter removable roles
     */
    const removableRoles =
        target.roles.cache.filter(role => {

            /**
             * Skip @everyone
             */
            if (role.id === guild.id) {
                return false;
            }

            /**
             * Skip quarantine role
             */
            if (role.id === quarantineRole.id) {
                return false;
            }

            /**
             * Skip managed roles
             */
            if (role.managed) {
                return false;
            }

            /**
             * Skip roles above bot
             */
            if (

                role.position >=
                guild.members.me.roles.highest.position

            ) {
                return false;
            }

            return true;
        });

    /**
     * Store role IDs
     */
    const roles =
        removableRoles.map(
            role => role.id
        );

    /**
     * Store in DB
     */
    await IsolatedUser.create({

        userId:
            target.id,

        guildId:
            guild.id,

        roles,

        endTime:
            new Date(
                Date.now() + durationMs
            )
    });

    /**
     * Remove removable roles
     */
    if (roles.length) {

        await target.roles.remove(
            roles
        );
    }

    /**
     * Add quarantine role
     */
    await target.roles.add(
        quarantineRole
    );

    return {
        success: true
    };
}

module.exports = {
    isolateUser
};