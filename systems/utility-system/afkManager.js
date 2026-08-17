/**
 * AFK Manager
 *
 * Stores temporary AFK states in memory.
 */

const afkUsers = new Map();

/**
 * Set user AFK
 */
function setAFK(
    userId,
    reason
) {

    afkUsers.set(
        userId,
        {
            reason,
            since: Date.now()
        }
    );
}

/**
 * Get user's AFK state
 */
function getAFK(
    userId
) {

    return afkUsers.get(
        userId
    );
}

/**
 * Check whether user is AFK
 */
function isAFK(
    userId
) {

    return afkUsers.has(
        userId
    );
}

/**
 * Remove AFK
 */
function removeAFK(
    userId
) {

    return afkUsers.delete(
        userId
    );
}

/**
 * Get all AFK users
 */
function getAllAFK() {

    return afkUsers;
}

module.exports = {

    setAFK,

    getAFK,

    isAFK,

    removeAFK,

    getAllAFK
};