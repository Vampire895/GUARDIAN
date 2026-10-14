/**
 * Legacy action-log compatibility shim.
 *
 * V1 intentionally logs command invocations only. Existing moderation commands
 * may still call logAction after completing an action; those calls must not
 * create a second, action-based stream in the new command-only Logging Center.
 */
async function logAction() {
    return;
}

module.exports = logAction;
