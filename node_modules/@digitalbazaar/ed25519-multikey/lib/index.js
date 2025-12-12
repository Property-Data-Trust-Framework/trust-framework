/*!
 * Copyright (c) 2020-2023 Digital Bazaar, Inc. All rights reserved.
 */
import * as base64url from 'base64url-universal';
import * as ed25519 from './ed25519.js';
import {createSigner, createVerifier} from './factory.js';
import {
  exportKeyPair, importKeyPair,
  jwkToPublicKeyMultibase,
  jwkToSecretKeyMultibase
} from './serialize.js';
import {MULTIKEY_CONTEXT_V1_URL, SECRET_KEY_SIZE} from './constants.js';
import {mbEncodeKeyPair} from './helpers.js';
import {toMultikey} from './keyPairTranslator.js';

export async function generate({id, controller, seed} = {}) {
  let key;
  if(seed) {
    key = await ed25519.generateKeyPairFromSeed(seed);
  } else {
    key = await ed25519.generateKeyPair();
  }

  const {publicKeyMultibase, secretKeyMultibase} = mbEncodeKeyPair({
    keyPair: key
  });
  if(controller && !id) {
    id = `${controller}#${publicKeyMultibase}`;
  }
  const keyPair = {
    id,
    controller,
    publicKeyMultibase,
    secretKeyMultibase,
    ...key,
  };
  return _createKeyPairInterface({keyPair});
}

// import key pair from JSON Multikey
export async function from(key) {
  let multikey = {...key};
  if(multikey.type !== 'Multikey') {
    // attempt loading from JWK if `publicKeyJwk` is present
    if(multikey.publicKeyJwk) {
      let id;
      let controller;
      if(multikey.type === 'JsonWebKey' || multikey.type === 'JsonWebKey2020') {
        ({id, controller} = multikey);
      }
      return fromJwk({
        jwk: multikey.publicKeyJwk, secretKey: false, id, controller
      });
    }
    if(multikey.type) {
      multikey = await toMultikey({keyPair: multikey});
      return _createKeyPairInterface({keyPair: multikey});
    }
  }
  if(!multikey.type) {
    multikey.type = 'Multikey';
  }
  if(!multikey['@context']) {
    multikey['@context'] = MULTIKEY_CONTEXT_V1_URL;
  }

  _assertMultikey(multikey);
  return _createKeyPairInterface({keyPair: multikey});
}

// imports key pair from JWK
export async function fromJwk({jwk, secretKey = false, id, controller} = {}) {
  const multikey = {
    '@context': MULTIKEY_CONTEXT_V1_URL,
    type: 'Multikey',
    publicKeyMultibase: jwkToPublicKeyMultibase({jwk})
  };
  if(typeof id === 'string') {
    multikey.id = id;
  }
  if(typeof controller === 'string') {
    multikey.controller = controller;
  }
  if(secretKey && jwk.d) {
    multikey.secretKeyMultibase = jwkToSecretKeyMultibase({jwk});
  }
  return from(multikey);
}

// converts key pair to JWK
export async function toJwk({keyPair, secretKey = false} = {}) {
  const jwk = {
    kty: 'OKP',
    crv: 'Ed25519',
    x: base64url.encode(keyPair.publicKey)
  };
  const useSecretKey = secretKey && !!keyPair.secretKey;
  if(useSecretKey) {
    jwk.d = base64url.encode(keyPair.secretKey);
  }
  return jwk;
}

async function _createKeyPairInterface({keyPair}) {
  if(!keyPair.publicKey) {
    keyPair = await importKeyPair(keyPair);
  }
  keyPair = {
    ...keyPair,
    async export({
      publicKey = true, secretKey = false, includeContext = true, raw = false,
      canonicalize = false
    } = {}) {
      if(raw) {
        const {publicKey, secretKey} = keyPair;
        const result = {};
        if(publicKey) {
          result.publicKey = publicKey.slice();
        }
        if(secretKey) {
          if(canonicalize && secretKey.length > SECRET_KEY_SIZE) {
            result.secretKey = secretKey.subarray(0, SECRET_KEY_SIZE).slice();
          } else {
            result.secretKey = secretKey;
          }
        }
        return result;
      }
      return exportKeyPair({
        keyPair, publicKey, secretKey, includeContext, canonicalize
      });
    },
    signer() {
      const {id, secretKey} = keyPair;
      return createSigner({id, secretKey});
    },
    verifier() {
      const {id, publicKey} = keyPair;
      return createVerifier({id, publicKey});
    }
  };

  return keyPair;
}

function _assertMultikey(key) {
  if(!(key && typeof key === 'object')) {
    throw new TypeError('"key" must be an object.');
  }
  if(key.type !== 'Multikey') {
    throw new Error('"key" must be a Multikey with type "Multikey".');
  }
  if(!(key['@context'] === MULTIKEY_CONTEXT_V1_URL ||
    (Array.isArray(key['@context']) &&
    key['@context'].includes(MULTIKEY_CONTEXT_V1_URL)))) {
    throw new TypeError(
      '"key" must be a Multikey with context ' +
      `"${MULTIKEY_CONTEXT_V1_URL}".`);
  }
}
