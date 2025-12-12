/*!
 * Copyright (c) 2020-2024 Digital Bazaar, Inc. All rights reserved.
 */
import * as base58btc from 'base58-universal';
import {
  MULTIBASE_BASE58BTC_HEADER,
  MULTICODEC_PRIV_HEADER,
  MULTICODEC_PUB_HEADER
} from './constants.js';

export function mbEncodeKeyPair({keyPair}) {
  const result = {};
  if(keyPair.publicKey) {
    result.publicKeyMultibase = _encodeMbKey(
      MULTICODEC_PUB_HEADER, keyPair.publicKey);
  }
  if(keyPair.secretKey) {
    result.secretKeyMultibase = _encodeMbKey(
      MULTICODEC_PRIV_HEADER, keyPair.secretKey);
  }
  return result;
}

export function mbDecodeKeyPair({publicKeyMultibase, secretKeyMultibase}) {
  if(!(publicKeyMultibase && typeof publicKeyMultibase === 'string' &&
  publicKeyMultibase[0] === 'z')) {
    throw new Error(
      '"publicKeyMultibase" must be a multibase, base58-encoded string.');
  }
  // remove multibase header
  const publicKeyMulticodec = base58btc.decode(publicKeyMultibase.substr(1));
  // remove multicodec header
  const publicKey = publicKeyMulticodec.slice(MULTICODEC_PUB_HEADER.length);

  let secretKey;
  if(secretKeyMultibase) {
    if(!(typeof secretKeyMultibase === 'string' &&
    secretKeyMultibase[0] === 'z')) {
      throw new Error(
        '"secretKeyMultibase" must be a multibase, base58-encoded string.');
    }
    // remove multibase header
    const secretKeyMulticodec = base58btc.decode(secretKeyMultibase.substr(1));
    // remove multicodec header
    secretKey = secretKeyMulticodec.slice(MULTICODEC_PRIV_HEADER.length);
  }

  return {
    publicKey,
    secretKey
  };
}

// encode a multibase base58-btc multicodec key
function _encodeMbKey(header, key) {
  const mbKey = new Uint8Array(header.length + key.length);

  mbKey.set(header);
  mbKey.set(key, header.length);

  return MULTIBASE_BASE58BTC_HEADER + base58btc.encode(mbKey);
}
