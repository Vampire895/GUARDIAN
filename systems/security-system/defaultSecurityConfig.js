/**
 * Default Security Configuration
 * Used when:
 * - New guild joins
 * - securityreset command runs
 */

module.exports = {
  antiSpam: {
    enabled: false,
    maxMessages: 5,
    interval: 5000,
    action: "warn",
    whitelist: { users: [], roles: [] },
  },

  antiLink: {
    enabled: false,
    action: "timeout",
    allowedDomains: [],
    whitelist: { users: [], roles: [] },
  },

  inviteFilter: {
    enabled: false,
    action: "timeout",
    whitelist: { users: [], roles: [] },
  },

  antiRaid: {
    enabled: false,
    joinThreshold: 5,
    interval: 10000,
    action: "kick",
    whitelist: { users: [], roles: [] },
  },

  antiMentionSpam: {
    enabled: false,
    threshold: 5,
    action: "warn",
  },

  antiBot: {
    enabled: false,
    whitelist: { users: [], roles: [] },
  },

  antiWebhook: {
    enabled: false,
    action: "delete",
  },

  ignoredChannels: [],

  actions: {
    spam: "warn",
    link: "delete",
    raid: "kick",
  },

  autorole: {
  enabled: false,
  roles: []
},

welcome: {
  enabled: false,
  channelId: null,
  embed: {
    title: "Welcome {user}",
    description: "Welcome to {server}! You are member #{membercount}",
    color: "#5865F2",
    thumbnail: true,
    image: null
  }
},

goodbye: {
  enabled: false,
  channelId: null,
  embed: {
    title: "Goodbye {user}",
    description: "{user} left {server}",
    color: "#ED4245",
    thumbnail: true,
    image: null
  }
},

autoresponder: {
  enabled: false,
  responses: []
},

verification: {
  enabled: false,
  type: null,
  channelId: null,
  roleIds: [],
  phrase: null,
  messageId: null
},

};
