/**
 * antiLink.js
 * Detects links and allows only explicitly configured hostnames.
 */

function extractLinks(content) {
  const matches = content.match(/(?:https?:\/\/|www\.)[^\s<>]+|(?:^|\s)(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>]*)?/gi) || [];
  return matches.map(value => value.trim().replace(/^[.,!?([{]+/, "").replace(/[.,!?;:)}\]]+$/, "")).filter(Boolean);
}

function hostnameOf(value) {
  let candidate = value;
  if (/^www\./i.test(candidate)) candidate = "https://" + candidate;
  else if (!/^https?:\/\//i.test(candidate)) candidate = "https://" + candidate;
  try { return new URL(candidate).hostname.toLowerCase().replace(/\.$/, ""); } catch { return null; }
}

function normalizeDomain(value) {
  let domain = String(value || "").trim().toLowerCase();
  if (!domain) return null;
  domain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split(/[/?#]/)[0].replace(/\.$/, "");
  return domain || null;
}

function isAllowed(hostname, allowedDomains) {
  return (Array.isArray(allowedDomains) ? allowedDomains : []).some(value => {
    const domain = normalizeDomain(value);
    return domain && (hostname === domain || hostname.endsWith("." + domain));
  });
}

function evaluate(message, config) {
  if (!message.guild || !config?.enabled || message.author.bot) return { triggered: false };
  const userId = message.author.id;
  const member = message.member;
  if (config.whitelist?.users?.includes(userId) || member?.roles?.cache?.some(role => config.whitelist?.roles?.includes(role.id))) return { triggered: false };
  const links = extractLinks(message.content || "");
  if (!links.length) return { triggered: false };
  const blocked = links.some(link => { const hostname = hostnameOf(link); return !hostname || !isAllowed(hostname, config.allowedDomains); });
  if (!blocked) return { triggered: false };
  return { triggered: true, action: config.action || "timeout", userId };
}

module.exports = { evaluate, extractLinks, hostnameOf, isAllowed };
