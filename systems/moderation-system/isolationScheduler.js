const IsolatedUser = require(
    "../../database/models/IsolatedUser"
);

/**
 * Restore isolated users
 */

async function restoreIsolation(client) {

    try {

        const isolatedUsers =
            await IsolatedUser.find();

        for (
            const data
            of isolatedUsers
        ) {

            scheduleRestore(
                client,
                data
            );
        }

    } catch (error) {

        console.error(
            "[Isolation Scheduler Error]",
            error
        );
    }
}

/**
 * Schedule restoration
 * for one isolated user
 */

function scheduleRestore(
    client,
    data
) {

    /**
     * Remaining duration
     */

    const remaining =
        data.endTime.getTime()
        - Date.now();

    /**
     * Already expired
     */

    if (remaining <= 0) {

        restoreUser(
            client,
            data
        );

        return;
    }

    /**
     * Schedule restore
     */

    setTimeout(
        async () => {

            await restoreUser(
                client,
                data
            );

        },
        remaining
    );

    console.log(

`[Isolation] Restoration scheduled for ${data.userId} in ${Math.ceil(remaining / 1000)}s`
    );
}

/**
 * Restore single user
 */

async function restoreUser(
    client,
    data
) {

    try {

        const guild =
            client.guilds.cache.get(
                data.guildId
            );

        /**
         * Guild no longer available
         *
         * Remove stale isolation data.
         */

        if (!guild) {

            await IsolatedUser.deleteOne({

                userId:
                    data.userId,

                guildId:
                    data.guildId
            });

            return;
        }

        const member =
            await guild.members.fetch(
                data.userId
            ).catch(() => null);

        /**
         * User no longer exists
         * in the guild.
         *
         * Remove stale isolation data.
         */

        if (!member) {

            await IsolatedUser.deleteOne({

                userId:
                    data.userId,

                guildId:
                    data.guildId
            });

            return;
        }

        /**
         * Restore exact previous roles
         *
         * This also removes the
         * Quarantine role because
         * it was never stored in data.roles.
         */

        await member.roles.set(
            data.roles
        );

        /**
         * Delete isolation data
         * only after successful
         * restoration.
         */

        await IsolatedUser.deleteOne({

            userId:
                data.userId,

            guildId:
                data.guildId
        });

        console.log(

`[Isolation] Restored ${member.user.tag}`
        );

    } catch (error) {

        /**
         * Keep database record if
         * restoration fails.
         *
         * This prevents Guardian from
         * losing the saved role snapshot.
         */

        console.error(

            "[Isolation Restore Error]",

            error
        );
    }
}

/**
 * Export startup restoration
 * and live scheduling.
 */

module.exports = restoreIsolation;

module.exports.scheduleRestore =
    scheduleRestore;