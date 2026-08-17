const selectMenuRegistry = require("../../interaction-system/registry/selectMenuRegistry");
const { renderModerationModulePanel } = require("../panels/moderationModulePanel");

async function execute(interaction) {
    return renderModerationModulePanel({
        interaction,
        moduleId: interaction.values[0]
    });
}

for (const page of [1, 2, 3]) {
    selectMenuRegistry.set(`control:select:moderation:${page}`, execute);
}

console.log("[Control System] Moderation select loaded.");
