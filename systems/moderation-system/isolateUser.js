const IsolatedUser = require(
    "../../database/models/IsolatedUser"
);

const isolationScheduler = require(
    "./isolationScheduler"
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
     * Bot member
     */

    const botMember =
        guild.members.me;

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

            if (
                role.id ===
                quarantineRole.id
            ) {

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
                botMember.roles.highest.position

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
     * Remember whether the user
     * already had Quarantine
     */

    const alreadyHadQuarantine =
        target.roles.cache.has(
            quarantineRole.id
        );

    /**
     * Remove removable roles
     */

    try {

        if (roles.length) {

            await target.roles.remove(
                roles
            );
        }

    } catch (error) {

        console.error(
            "[Isolation] Failed to remove user roles:",
            error
        );

        return {

            success: false,

            error:
                "Failed to remove the user's roles."
        };
    }

    /**
     * Add Quarantine role
     */

    try {

        await target.roles.add(
            quarantineRole
        );

    } catch (error) {

        console.error(
            "[Isolation] Failed to add Quarantine role:",
            error
        );

        /**
         * Rollback removed roles
         */

        try {

            if (roles.length) {

                await target.roles.add(
                    roles
                );
            }

        } catch (rollbackError) {

            console.error(
                "[Isolation Rollback Error]",
                rollbackError
            );
        }

        return {

            success: false,

            error:
                "Failed to apply the Quarantine role."
        };
    }

    /**
     * Store isolation data
     *
     * Discord changes succeeded first.
     */

    let isolationData;

    try {

        isolationData =
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

    } catch (error) {

        console.error(
            "[Isolation] Failed to save isolation data:",
            error
        );

        /**
         * Rollback roles
         */

        try {

            if (roles.length) {

                await target.roles.add(
                    roles
                );
            }

        } catch (rollbackError) {

            console.error(
                "[Isolation Role Rollback Error]",
                rollbackError
            );
        }

        /**
         * Remove Quarantine only if
         * Guardian added it.
         */

        if (!alreadyHadQuarantine) {

            try {

                await target.roles.remove(
                    quarantineRole
                );

            } catch (rollbackError) {

                console.error(
                    "[Isolation Quarantine Rollback Error]",
                    rollbackError
                );
            }
        }

        return {

            success: false,

            error:
                "Isolation could not be saved. The action was rolled back."
        };
    }

    /**
     * Schedule automatic restoration
     *
     * This is required for isolations
     * created while Guardian is already
     * running.
     */

    isolationScheduler.scheduleRestore(

        guild.client,

        isolationData
    );

    /**
     * Isolation successful
     */

    return {

        success: true
    };
}

module.exports = {
    isolateUser
};