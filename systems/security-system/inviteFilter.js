/**
 * inviteFilter.js
 * Detects actual Discord invite hostnames and invite paths.
 */

const urlPattern = /(?:https?:\/\/|www\.)[^\s<>]+|(?:^|\s)(?:discord\.gg|discord\.com|www\.discord\.com)\/[^\s<>]*/gi;

function isDiscordInvite(value) {
  let candidate = String(value || "").trim().replace(/^[.,!?([{]+/, "").replace(/[.,!?;:)}\]]+$/, "");
  if (!candidate) return false;
  if (/^www\./i.test(candidate)) candidate = "https://" + candidate;
  else if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;
  try {
    const url = new URL(candidate);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    if (host === "discord.gg") return url.pathname.length > 1;
    return host === "discord.com" && /^\/invite\/[a-z0-9-]+/i.test(url.pathname);
  } catch { return false; }
}

function evaluate(message, config) {
  if (!message.guild || !config?.enabled || message.author.bot) return { triggered: false };
  const member = message.member;
  if (config.whitelist?.users?.includes(message.author.id) || member?.roles?.cache?.some(role => config.whitelist?.roles?.includes(role.id))) return { triggered: false };
  const candidates = (message.content || "").match(urlPattern) || [];
  if (!candidates.some(isDiscordInvite)) return { triggered: false };
  return { triggered: true, action: config.action || "timeout", userId: message.author.id };
}

module.exports = { evaluate, isDiscordInvite };
