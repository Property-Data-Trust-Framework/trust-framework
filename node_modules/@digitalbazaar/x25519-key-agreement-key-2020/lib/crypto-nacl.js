/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import nacl from 'tweetnacl';

/**
 * Note: The following two functions are async to match the signature of
 * their native Node.js counterparts (see './crypto.js').
 */

export async function deriveSecret({privateKey, remotePublicKey}) {
  return nacl.scalarMult(privateKey, remotePublicKey);
}

export async function generateKeyPair() {
  // Each is a Uint8Array with 32-byte key
  const {publicKey, secretKey: privateKey} = nacl.box.keyPair();
  return {publicKey, privateKey};
}

export function ed25519SecretKeyToX25519(secretKey) {
  const hash = new Uint8Array(64);
  // X25519 secret key is the first 32 bytes of the hash with clamped values
  nacl.lowlevel.crypto_hash(hash, secretKey, 32);
  hash[0] &= 248;
  hash[31] &= 127;
  hash[31] |= 64;
  const x25519SecretKey = hash.slice(0, 32);
  // zero-fill remainder of hash before returning
  hash.fill(0, 32);
  return x25519SecretKey;
}
