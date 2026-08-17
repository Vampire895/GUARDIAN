const antispam = require("./antispam");
const antilink = require("./antilink");
const invitefilter = require("./invitefilter");
const antiraid = require("./antiraid");
const antibot = require("./antibot");
const whitelist = require("./whitelist");
const ignoredchannels = require("./ignoredchannels");
const securityreset = require("./securityreset");

const modules = [
    antispam,
    antilink,
    invitefilter,
    antiraid,
    antibot,
    whitelist,
    ignoredchannels,
    securityreset
];

function getAllModules() {
    return modules;
}

function getModule(id) {
    return modules.find(m => m.id === id);
}

function getModulesByCategory(category) {
    return modules.filter(m => m.category === category);
}

function getCategories() {
    return [...new Set(modules.map(m => m.category))];
}

module.exports = {
    getAllModules,
    getModule,
    getModulesByCategory,
    getCategories
};