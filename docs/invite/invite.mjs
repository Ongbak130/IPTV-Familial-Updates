/** Only the fragment (#...) carries invitation credentials, never a server-visible query. */
const HEX64 = /^[a-f0-9]{64}$/;
const HOST = /^[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
const KEYS = ['host', 'port', 'pin', 'token'];

function publicHost(host) {
  if (!HOST.test(host) || /(^|\.)(local|internal)$/i.test(host) || /^localhost$/i.test(host)) return false;
  const parts = host.split('.');
  if (parts.length === 4 && parts.every(p => /^\d+$/.test(p))) {
    const values = parts.map(Number);
    if (values.some(n => n < 0 || n > 255)) return false;
    const [a, b] = values;
    return !(a === 0 || a === 10 || a === 127 || a === 169 || a === 192 ||
      a === 255 || a >= 224 || (a === 172 && b >= 16 && b <= 31) ||
      (a === 100 && b >= 64 && b <= 127));
  }
  return host.includes('.') && !host.includes('..');
}

export function parseInvitationFragment(fragment) {
  const raw = fragment.startsWith('#') ? fragment.slice(1) : fragment;
  if (raw.length > 290 || !/^[A-Za-z0-9._&=-]+$/.test(raw)) return null;
  const segments = raw.split('&').map(entry => entry.split('='));
  if (segments.length !== 4 || segments.some(pair => pair.length !== 2)) return null;
  const map = new Map(segments);
  if (map.size !== 4 || KEYS.some(k => !map.has(k))) return null;
  const host = map.get('host'), portValue = map.get('port');
  const pin = map.get('pin'), token = map.get('token');
  if (!publicHost(host) || !/^\d{4,5}$/.test(portValue) ||
      !HEX64.test(pin) || !HEX64.test(token)) return null;
  const port = Number(portValue);
  if (port < 1025 || port > 65535) return null;
  return {host, port, pin, token};
}

export function makeAppLink(invite) {
  if (!invite) throw new Error('Invalid invitation');
  const fragment = ['host=' + invite.host, 'port=' + invite.port,
    'pin=' + invite.pin, 'token=' + invite.token].join('&');
  if (!parseInvitationFragment(fragment)) throw new Error('Invalid invitation');
  return 'iptvfamilial://invite?' + fragment;
}
