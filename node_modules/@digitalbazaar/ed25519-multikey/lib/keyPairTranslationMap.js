/*!
 * Copyright (c) 2022-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as base58btc from 'base58-universal';
import {
  ED25519_SIGNATURE_2018_V1_URL,
  ED25519_SIGNATURE_2020_V1_URL,
  MULTIKEY_CONTEXT_V1_URL
} from './constants.js';
import {mbEncodeKeyPair} from './helpers.js';

const keyPairTranslationMap = new Map([
  ['Ed25519VerificationKey2020', {
    contextUrl: ED25519_SIGNATURE_2020_V1_URL,
    translationFn: _translateEd25519VerificationKey2020
  }],
  ['Ed25519VerificationKey2018', {
    contextUrl: ED25519_SIGNATURE_2018_V1_URL,
    translationFn: _translateEd25519VerificationKey2018
  }]
]);

async function _translateEd25519VerificationKey2020({keyPair}) {
  return {
    ...keyPair,
    type: 'Multikey',
    '@context': MULTIKEY_CONTEXT_V1_URL,
    secretKeyMultibase: keyPair.privateKeyMultibase
  };
}

async function _translateEd25519VerificationKey2018({keyPair}) {
  const key = {
    publicKey: base58btc.decode(keyPair.publicKeyBase58),
    secretKey: undefined
  };

  if(keyPair.privateKeyBase58) {
    key.secretKey = base58btc.decode(keyPair.privateKeyBase58);
  }

  const {publicKeyMultibase, secretKeyMultibase} = mbEncodeKeyPair({
    keyPair: key
  });

  return {
    '@context': MULTIKEY_CONTEXT_V1_URL,
    id: keyPair.id,
    type: 'Multikey',
    controller: keyPair.controller,
    revoked: keyPair.revoked,
    publicKeyMultibase,
    secretKeyMultibase,
  };
}

export {keyPairTranslationMap};
