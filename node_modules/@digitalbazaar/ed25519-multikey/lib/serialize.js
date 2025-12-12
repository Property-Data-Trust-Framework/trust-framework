/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as base64url from 'base64url-universal';
import {mbDecodeKeyPair, mbEncodeKeyPair} from './helpers.js';
import {
  MULTIKEY_CONTEXT_V1_URL,
  PUBLIC_KEY_SIZE,
  SECRET_KEY_SIZE
} from './constants.js';

const LEGACY_SECRET_KEY_SIZE = SECRET_KEY_SIZE + PUBLIC_KEY_SIZE;

export async function exportKeyPair({
  keyPair, secretKey, publicKey, includeContext, canonicalize = false
} = {}) {
  if(!(publicKey || secretKey)) {
    throw new TypeError(
      'Export requires specifying either "publicKey" or "secretKey".');
  }

  const useSecretKey = secretKey && !!keyPair.secretKey;

  // export as Multikey
  const exported = {};
  if(includeContext) {
    exported['@context'] = MULTIKEY_CONTEXT_V1_URL;
  }
  exported.id = keyPair.id;
  exported.type = 'Multikey';
  exported.controller = keyPair.controller;

  if(publicKey) {
    exported.publicKeyMultibase = rawToPublicKeyMultibase(keyPair);
  }
  if(useSecretKey) {
    exported.secretKeyMultibase = rawToSecretKeyMultibase({
      ...keyPair, canonicalize
    });
  }

  if(keyPair.revoked) {
    exported.revoked = keyPair.revoked;
  }

  return exported;
}

export async function importKeyPair({
  id, controller, secretKeyMultibase, publicKeyMultibase, revoked
}) {
  if(!publicKeyMultibase) {
    throw new TypeError('The "publicKeyMultibase" property is required.');
  }

  const {
    publicKey, secretKey
  } = mbDecodeKeyPair({publicKeyMultibase, secretKeyMultibase});

  if(controller && !id) {
    id = `${controller}#${publicKeyMultibase}`;
  }

  return {
    id,
    controller,
    publicKey,
    secretKey,
    publicKeyMultibase,
    secretKeyMultibase,
    revoked,
  };
}

export function jwkToPublicKeyBytes({jwk} = {}) {
  const {kty, crv, x} = jwk;
  if(kty !== 'OKP') {
    throw new TypeError('"jwk.kty" must be "OKP".');
  }
  if(crv !== 'Ed25519') {
    throw new TypeError('"jwk.crv" must be "Ed25519".');
  }
  if(typeof x !== 'string') {
    throw new TypeError('"jwk.x" must be a string.');
  }
  const publicKey = base64url.decode(jwk.x);
  if(publicKey.length !== PUBLIC_KEY_SIZE) {
    throw new Error(
      `Invalid public key size (${publicKey.length}); ` +
      `expected ${PUBLIC_KEY_SIZE}.`);
  }
  return publicKey;
}

export function jwkToPublicKeyMultibase({jwk} = {}) {
  const publicKey = jwkToPublicKeyBytes({jwk});
  const {publicKeyMultibase} = mbEncodeKeyPair({
    keyPair: {publicKey}
  });
  return publicKeyMultibase;
}

export function jwkToSecretKeyBytes({jwk} = {}) {
  const {kty, crv, d} = jwk;
  if(kty !== 'OKP') {
    throw new TypeError('"jwk.kty" must be "OKP".');
  }
  if(crv !== 'Ed25519') {
    throw new TypeError('"jwk.crv" must be "Ed25519".');
  }
  if(typeof d !== 'string') {
    throw new TypeError('"jwk.d" must be a string.');
  }
  const secretKey = Uint8Array.from(base64url.decode(jwk.d));
  if(secretKey.length !== SECRET_KEY_SIZE) {
    throw new Error(
      `Invalid secret key size (${secretKey.length}); ` +
      `expected ${SECRET_KEY_SIZE}.`);
  }
  return secretKey;
}

export function jwkToSecretKeyMultibase({jwk} = {}) {
  const secretKey = jwkToSecretKeyBytes({jwk});
  const {secretKeyMultibase} = mbEncodeKeyPair({
    keyPair: {secretKey}
  });
  return secretKeyMultibase;
}

export function rawToPublicKeyMultibase({publicKey} = {}) {
  if(publicKey.length !== PUBLIC_KEY_SIZE) {
    throw new Error(
      `Invalid public key size (${publicKey.length}); ` +
      `expected ${PUBLIC_KEY_SIZE}.`);
  }
  const {publicKeyMultibase} = mbEncodeKeyPair({
    keyPair: {publicKey}
  });
  return publicKeyMultibase;
}

export function rawToSecretKeyMultibase({
  secretKey, canonicalize = false
} = {}) {
  if(secretKey.length !== SECRET_KEY_SIZE) {
    if(secretKey.length !== LEGACY_SECRET_KEY_SIZE) {
      throw new Error(
        `Invalid secret key size (${secretKey.length}); ` +
        `expected ${SECRET_KEY_SIZE}.`);
    }
    // handle legacy concatenated (secret key + public key)
    if(canonicalize) {
      secretKey = secretKey.subarray(0, SECRET_KEY_SIZE);
    }
  }
  const {secretKeyMultibase} = mbEncodeKeyPair({
    keyPair: {secretKey}
  });
  return secretKeyMultibase;
}
