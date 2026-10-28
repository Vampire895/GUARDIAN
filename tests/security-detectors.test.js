const test = require("node:test");
const assert = require("node:assert/strict");

const antiLink = require("../systems/security-system/antiLink");
const inviteFilter = require("../systems/security-system/inviteFilter");
const antiRaid = require("../systems/security-system/antiRaid");

function message(content, { userId = "user-1", bot = false, guild = true, roles = [] } = {}) {
    return {
        content,
        guild: guild ? { id: "guild-test" } : null,
        author: { id: userId, bot },
        member: { roles: { cache: roles.map(id => ({ id })) } }
    };
}

test("anti-link allows exact domains and their subdomains", () => {
    const config = { enabled: true, allowedDomains: ["youtube.com"], action: "warn" };
    assert.equal(antiLink.evaluate(message("https://youtube.com/watch?v=1"), config).triggered, false);
    assert.equal(antiLink.evaluate(message("www.youtube.com/watch?v=1"), config).triggered, false);
});

test("anti-link does not accept lookalike suffix domains", () => {
    const config = { enabled: true, allowedDomains: ["youtube.com"], action: "warn" };
    assert.equal(antiLink.evaluate(message("https://notyoutube.com/"), config).triggered, true);
    assert.equal(antiLink.evaluate(message("https://youtube.com.attacker.example/"), config).triggered, true);
});

test("anti-link honors per-module user and role whitelist", () => {
    const config = { enabled: true, allowedDomains: [], whitelist: { users: ["trusted"], roles: ["trusted-role"] } };
    assert.equal(antiLink.evaluate(message("https://evil.example", { userId: "trusted" }), config).triggered, false);
    assert.equal(antiLink.evaluate(message("https://evil.example", { roles: ["trusted-role"] }), config).triggered, false);
});

test("invite filter matches real Discord invite hosts and paths only", () => {
    assert.equal(inviteFilter.isDiscordInvite("https://discord.gg/abc123"), true);
    assert.equal(inviteFilter.isDiscordInvite("https://discord.com/invite/abc123"), true);
    assert.equal(inviteFilter.isDiscordInvite("https://discord.gg.attacker.example/abc123"), false);
    assert.equal(inviteFilter.isDiscordInvite("https://discord.com/users/123"), false);
});

test("anti-raid returns the detected cohort once threshold is reached", () => {
    antiRaid.clearGuild("guild-test");
    const config = { enabled: true, joinThreshold: 2, interval: 10000, action: "kick", whitelist: { users: [], roles: [] } };
    const first = antiRaid.evaluate({ id: "member-1", guild: { id: "guild-test" }, roles: { cache: [] } }, config);
    const second = antiRaid.evaluate({ id: "member-2", guild: { id: "guild-test" }, roles: { cache: [] } }, config);
    assert.equal(first.triggered, false);
    assert.equal(second.triggered, true);
    assert.deepEqual(second.members, ["member-1", "member-2"]);
    antiRaid.clearGuild("guild-test");
});

test("anti-raid excludes whitelisted members from enforcement", () => {
    antiRaid.clearGuild("guild-test");
    const config = { enabled: true, joinThreshold: 2, interval: 10000, action: "kick", whitelist: { users: ["trusted"], roles: [] } };
    const result = antiRaid.evaluate({ id: "trusted", guild: { id: "guild-test" }, roles: { cache: [] } }, config);
    assert.equal(result.triggered, false);
    assert.equal(result.ignored, true);
    antiRaid.clearGuild("guild-test");
});
