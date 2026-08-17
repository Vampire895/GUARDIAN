// systems/moderation-system/caseManager.js

let currentCase = 0;

/**
 * @returns {number}
 */
function generateCase() {
  return ++currentCase;
}

module.exports = { generateCase };