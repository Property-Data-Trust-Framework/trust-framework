/*!
 * Copyright (c) 2020-2022 Digital Bazaar, Inc. All rights reserved.
 */
import {assertKeyBytes} from './validators.js';
import crypto from 'node:crypto';
import {promisify} from 'node:util';

const randomBytesAsync = promisify(crypto.randomBytes);

// used to export node's public keys to buffers
const publicKeyEncoding = {format: 'der', type: 'spki'};
// used to turn secret key bytes into a buffer in DER format
const DER_PRIVATE_KEY_PREFIX = Buffer.from(
  '302e020100300506032b657004220420', 'hex');
// used to turn public key bytes into a buffer in DER format
const DER_PUBLIC_KEY_PREFIX = Buffer.from('302a300506032b6570032100', 'hex');

/**
 * Generates a key using a 32 byte Uint8Array.
 *
 * @param {Uint8Array} seedBytes - The bytes for the secret key.
 *
 * @returns {object} The object with the public and secret key material.
*/
export async function generateKeyPairFromSeed(seedBytes) {
  const secretKey = await crypto.createPrivateKey({
    // node is more than happy to create a new secret key using a DER
    key: _secretKeyDerEncode({seedBytes}),
    format: 'der',
    type: 'pkcs8'
  });
  // this expects either a PEM encoded key or a node secretKeyObject
  const publicKey = await crypto.createPublicKey(secretKey);
  const publicKeyBuffer = publicKey.export(publicKeyEncoding);
  const publicKeyBytes = _getKeyMaterial(publicKeyBuffer);
  return {
    publicKey: publicKeyBytes,
    secretKey: Buffer.concat([seedBytes, publicKeyBytes])
  };
}

// generates an ed25519 key using a random seed
export async function generateKeyPair() {
  const seed = await randomBytesAsync(32);
  return generateKeyPairFromSeed(seed);
}

export async function sign(secretKeyBytes, data) {
  const secretKey = await crypto.createPrivateKey({
    key: _secretKeyDerEncode({secretKeyBytes}),
    format: 'der',
    type: 'pkcs8'
  });
  return crypto.sign(null, data, secretKey);
}

export async function verify(publicKeyBytes, data, signature) {
  const publicKey = await crypto.createPublicKey({
    key: _publicKeyDerEncode({publicKeyBytes}),
    format: 'der',
    type: 'spki'
  });
  return crypto.verify(null, data, publicKey, signature);
}

export async function sha256digest({data}) {
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * The key material is the part of the buffer after the DER Prefix.
 *
 * @param {Buffer} buffer - A DER encoded key buffer.
 *
 * @throws {Error} If the buffer does not contain a valid DER Prefix.
 *
 * @returns {Buffer} The key material part of the Buffer.
*/
function _getKeyMaterial(buffer) {
  if(buffer.indexOf(DER_PUBLIC_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PUBLIC_KEY_PREFIX.length, buffer.length);
  }
  if(buffer.indexOf(DER_PRIVATE_KEY_PREFIX) === 0) {
    return buffer.slice(DER_PRIVATE_KEY_PREFIX.length, buffer.length);
  }
  throw new Error('Expected Buffer to match Ed25519 Public or Private Prefix');
}

/**
 * Takes a Buffer or Uint8Array with the raw secret key and encodes it
 * in DER-encoded PKCS#8 format.
 * Allows Uint8Arrays to be interoperable with node's crypto functions.
 *
 * @param {object} options - Options to use.
 * @param {Buffer} [options.secretKeyBytes] - Required if no seedBytes.
 * @param {Buffer} [options.seedBytes] - Required if no secretKeyBytes.
 *
 * @throws {TypeError} Throws if the supplied buffer is not of the right size
 *  or not a Uint8Array or Buffer.
 *
 * @returns {Buffer} DER secret key prefix + key bytes.
*/
function _secretKeyDerEncode({secretKeyBytes, seedBytes}) {
  if(!(secretKeyBytes || seedBytes)) {
    throw new TypeError('`secretKeyBytes` or `seedBytes` is required.');
  }
  if(!secretKeyBytes) {
    assertKeyBytes({
      bytes: seedBytes,
      expectedLength: 32
    });
  }
  if(!seedBytes) {
    assertKeyBytes({
      bytes: secretKeyBytes,
      // allow 32 bytes or 64 bytes
      expectedLength: secretKeyBytes.length === 32 ? 32 : 64
    });
  }
  let p;
  if(seedBytes) {
    p = seedBytes;
  } else {
    // extract the first 32 bytes of the 64 byte secret key representation
    p = secretKeyBytes.slice(0, 32);
  }
  return Buffer.concat([DER_PRIVATE_KEY_PREFIX, p]);
}

/**
 * Takes a Uint8Array of public key bytes and encodes it in DER-encoded
 * SubjectPublicKeyInfo (SPKI) format.
 * Allows Uint8Arrays to be interoperable with node's crypto functions.
 *
 * @param {object} options - Options to use.
 * @param {Uint8Array} options.publicKeyBytes - The keyBytes.
 *
 * @throws {TypeError} Throws if the bytes are not Uint8Array or of length 32.
 *
 * @returns {Buffer} DER Public key Prefix + key bytes.
*/
function _publicKeyDerEncode({publicKeyBytes}) {
  assertKeyBytes({
    bytes: publicKeyBytes,
    expectedLength: 32,
    code: 'invalidPublicKeyLength'
  });
  return Buffer.concat([DER_PUBLIC_KEY_PREFIX, publicKeyBytes]);
}
