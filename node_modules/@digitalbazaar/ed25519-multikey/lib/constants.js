/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc. All rights reserved.
 */

// Ed25519 Signature 2018 Context v1 URL
export const ED25519_SIGNATURE_2018_V1_URL =
  'https://w3id.org/security/suites/ed25519-2018/v1';
// Ed25519 Signature 2020 Context v1 URL
export const ED25519_SIGNATURE_2020_V1_URL =
  'https://w3id.org/security/suites/ed25519-2020/v1';
// multibase base58-btc header
export const MULTIBASE_BASE58BTC_HEADER = 'z';
// multicodec ed25519-pub header as varint
export const MULTICODEC_PUB_HEADER = new Uint8Array([0xed, 0x01]);
// multicodec ed25519-priv header as varint
export const MULTICODEC_PRIV_HEADER = new Uint8Array([0x80, 0x26]);
// multikey context v1 url
export const MULTIKEY_CONTEXT_V1_URL = 'https://w3id.org/security/multikey/v1';
// Ed25519 public key size in bytes
export const PUBLIC_KEY_SIZE = 32;
// Ed25519 secret key size in bytes
export const SECRET_KEY_SIZE = 32;
