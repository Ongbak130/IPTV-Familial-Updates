import test from 'node:test';
import assert from 'node:assert/strict';
import {parseInvitationFragment, makeAppLink} from './invite.mjs';

const pin = 'a'.repeat(64);
const token = 'b'.repeat(64);
const valid = 'host=184.144.209.219&port=8766&pin=' + pin + '&token=' + token;

test('valid fragment reconstructs legacy deep link without a server-visible query', () => {
  const invite = parseInvitationFragment('#' + valid);
  assert.equal(invite.host, '184.144.209.219');
  assert.equal(invite.port, 8766);
  assert.equal(makeAppLink(invite), 'iptvfamilial://invite?' + valid);
});

test('never allow dangerous hosts, duplicate fields or malformed tokens', () => {
  const bad = [
    '', 'host=localhost&port=8766&pin=' + pin + '&token=' + token,
    'host=192.168.0.1&port=8766&pin=' + pin + '&token=' + token,
    'host=hub.example.net&port=8766&pin=' + pin + '&token=short',
    valid + '&token=' + token,
    valid.replace('port=8766', 'port=80'),
    valid.replace('184.144.209.219', 'example.org@evil.test'),
    valid.replace('184.144.209.219', '0.0.0.0'),
    valid.replace('184.144.209.219', '127.0.0.1'),
    valid.replace('184.144.209.219', '10.0.0.1')
  ];
  for (const value of bad) assert.equal(parseInvitationFragment('#' + value), null, value);
});

test('the server-visible path does not include the invitation token', () => {
  const url = new URL('https://ongbak130.github.io/IPTV-Familial-Updates/invite/#' + valid);
  assert.equal(url.search, '');
  assert.ok(!url.pathname.includes(token));
  assert.ok(!url.origin.includes(token));
});
