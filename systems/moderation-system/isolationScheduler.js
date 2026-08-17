const IsolatedUser = require(
    "../../database/models/IsolatedUser"
);

/**
 * Restore isolated users
 */

async function restoreIsolation(client) {

    const isolatedUsers =
        await IsolatedUser.find();

    for (const data of isolatedUsers) {

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

            await restoreUser(
                client,
                data
            );

            continue;
        }

        /**
         * Schedule restore
         */
        setTimeout(async () => {

            await restoreUser(
                client,
                data
            );

        }, remaining);
    }
}

/**
 * Restore single user
 */

async function restoreUser(client, data) {

    try {

        const guild =
            client.guilds.cache.get(
                data.guildId
            );

        if (!guild) return;

        const member =
            await guild.members.fetch(
                data.userId
            );

        if (!member) return;

        /**
         * Restore roles
         */
        await member.roles.set(
            data.roles
        );

        /**
         * Delete isolation data
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

        console.error(

            "[Isolation Restore Error]",

            error
        );
    }
}

module.exports = restoreIsolation;