import crypto from 'node:crypto';

export function base64urlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buf
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '');
}

export function base64urlDecodeToBuffer(b64url) {
  const b64 = b64url.replaceAll('-', '+').replaceAll('_', '/');
  const padLen = (4 - (b64.length % 4)) % 4;
  return Buffer.from(b64 + '='.repeat(padLen), 'base64');
}

/**
 * Deterministic JSON stringify by sorting object keys recursively.
 * Note: this is NOT full JSON-LD canonicalization.
 */
export function stableJsonStringify(value) {
  return JSON.stringify(sortKeysDeep(value));
}

function sortKeysDeep(value) {
  if (Array.isArray(value)) return value.map(sortKeysDeep);
  if (value && typeof value === 'object') {
    const out = {};
    for (const key of Object.keys(value).sort()) out[key] = sortKeysDeep(value[key]);
    return out;
  }
  return value;
}

export function sha256Hex(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Create a compact JWS using EdDSA (Ed25519).
 * @param {object} header
 * @param {object} payload
 * @param {import('node:crypto').KeyObject|string|Buffer} privateKey
 */
export function signJwsEdDsa({ header, payload, privateKey }) {
  const protectedHeader = base64urlEncode(stableJsonStringify(header));
  const payloadB64 = base64urlEncode(stableJsonStringify(payload));
  const signingInput = Buffer.from(`${protectedHeader}.${payloadB64}`, 'utf8');
  const sig = crypto.sign(null, signingInput, privateKey);
  const sigB64 = base64urlEncode(sig);
  return `${protectedHeader}.${payloadB64}.${sigB64}`;
}

export function verifyJwsEdDsa({ jws, publicKey }) {
  const [h, p, s] = jws.split('.');
  if (!h || !p || !s) return false;
  const signingInput = Buffer.from(`${h}.${p}`, 'utf8');
  const sig = base64urlDecodeToBuffer(s);
  return crypto.verify(null, signingInput, publicKey, sig);
}

