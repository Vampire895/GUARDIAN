const startSessionSweeper = require(
    "./sessions/startSessionSweeper"
);

/**
 * Buttons
 */

require(
    "./buttons/home/controlHomeButton"
);

require(
    "./buttons/controlPanelButton"
);

require(
    "./buttons/moderationSelectMenu"
);

require(
    "./buttons/moderationPaginationButton"
);

require(
    "./buttons/securityControls"
);

require(
    "./buttons/verificationControls"
);

/**
 * Initialize control system
 */

function controlSystem(
    client
) {

    /**
     * Start session sweeper
     */
    startSessionSweeper(
        client
    );

    console.log(
        "[Control System] Loaded."
    );
}

module.exports =
    controlSystem;
