/*!
 * Copyright (c) 2021-2022 Digital Bazaar, Inc. All rights reserved.
 */
import * as base58btc from 'base58-universal';
import {LDKeyPair} from 'crypto-ld';
import {Point} from '@noble/ed25519';

import {
  deriveSecret, ed25519SecretKeyToX25519, generateKeyPair
} from './crypto.js';

const SUITE_ID = 'X25519KeyAgreementKey2020';
// multibase base58-btc header
const MULTIBASE_BASE58BTC_HEADER = 'z';
// multicodec ed25519-pub header as varint
const MULTICODEC_ED25519_PUB_HEADER = new Uint8Array([0xed, 0x01]);
// multicodec ed25519-priv header as varint
const MULTICODEC_ED25519_PRIV_HEADER = new Uint8Array([0x80, 0x26]);
// multicodec x25519-pub header as varint
const MULTICODEC_X25519_PUB_HEADER = new Uint8Array([0xec, 0x01]);
// multicodec x25519-priv header as varint
const MULTICODEC_X25519_PRIV_HEADER = new Uint8Array([0x82, 0x26]);

export class X25519KeyAgreementKey2020 extends LDKeyPair {
  /**
   * @param {object} options - Options hashmap.
   * @param {string} options.controller - Controller DID or document url.
   * @param {string} [options.id] - Key ID, typically composed of controller
   *   URL and key fingerprint as hash fragment.
   * @param {string} options.publicKeyMultibase - Multibase encoded public key.
   * @param {string} [options.privateKeyMultibase] - Multibase private key.
   * @param {string} [options.revoked] - Timestamp of when the key has been
   *   revoked, in RFC3339 format. If not present, the key itself is considered
   *   not revoked. Note that this mechanism is slightly different than DID
   *   Document key revocation, where a DID controller can revoke a key from
   *   that DID by removing it from the DID Document.
   */
  constructor(options = {}) {
    super(options);
    this.type = SUITE_ID;
    const {publicKeyMultibase, privateKeyMultibase} = options;

    if(!publicKeyMultibase) {
      throw new TypeError('The "publicKeyMultibase" property is required.');
    }

    if(!publicKeyMultibase || !_isValidKeyHeader(
      publicKeyMultibase, MULTICODEC_X25519_PUB_HEADER)) {
      throw new Error(
        '"publicKeyMultibase" has invalid header bytes: ' +
        `"${publicKeyMultibase}".`);
    }

    if(privateKeyMultibase && !_isValidKeyHeader(
      privateKeyMultibase, MULTICODEC_X25519_PRIV_HEADER)) {
      throw new Error('"privateKeyMultibase" has invalid header bytes.');
    }

    // assign valid key values
    this.publicKeyMultibase = publicKeyMultibase;
    this.privateKeyMultibase = privateKeyMultibase;

    if(this.controller && !this.id) {
      this.id = `${this.controller}#${this.fingerprint()}`;
    }
  }

  /**
   * Generates a new public/private X25519 Key Pair.
   *
   * @param {object} [options={}] - Keypair options (see controller docstring).
   *
   * @returns {Promise<X25519KeyAgreementKey2020>} Generated key pair.
   */
  static async generate(options = {}) {
    const {publicKey, privateKey} = await generateKeyPair();

    return new X25519KeyAgreementKey2020({
      publicKeyMultibase:
        _multibaseEncode(MULTICODEC_X25519_PUB_HEADER, publicKey),
      privateKeyMultibase:
        _multibaseEncode(MULTICODEC_X25519_PRIV_HEADER, privateKey),
      ...options
    });
  }

  /**
   * Creates an X25519KeyAgreementKey2020 Key Pair from an existing key
   * (constructor method).
   *
   * @param {object} [options={}] - Keypair options (see controller docstring).
   *
   * @returns {X25519KeyAgreementKey2020} An X25519 Key Pair.
   */
  static async from(options = {}) {
    // Check to see if this is an X25519KeyAgreementKey2019
    if(options.publicKeyBase58) {
      // Convert it to a 2020 key pair instance
      return this.fromX25519KeyAgreementKey2019(options);
    }
    return new X25519KeyAgreementKey2020(options);
  }

  /**
   * Creates an X25519KeyAgreementKey2020 Key Pair from an existing 2019 key
   * (backwards compatibility method).
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.publicKeyBase58 - Base58btc encoded public key.
   * @param {string} [options.privateKeyBase58] - Base58btc encoded private key.
   * @param {object} [options.keyPairOptions] - Other options.
   *
   * @returns {Promise<X25519KeyAgreementKey2020>} 2020 Crypto suite key pair.
   */
  static async fromX25519KeyAgreementKey2019({
    publicKeyBase58, privateKeyBase58, ...keyPairOptions
  } = {}) {
    let publicKeyMultibase;
    let privateKeyMultibase;

    if(publicKeyBase58) {
      // prefix with `z` to indicate multi-base base58btc encoding
      publicKeyMultibase = _multibaseEncode(
        MULTICODEC_X25519_PUB_HEADER, base58btc.decode(publicKeyBase58));
    }
    if(privateKeyBase58) {
      // prefix with `z` to indicate multi-base base58btc encoding
      privateKeyMultibase = _multibaseEncode(
        MULTICODEC_X25519_PRIV_HEADER, base58btc.decode(privateKeyBase58));
    }
    return new X25519KeyAgreementKey2020({
      publicKeyMultibase, privateKeyMultibase, ...keyPairOptions
    });
  }

  /**
   * Converts a keypair instance of type Ed25519VerificationKey2020 to an
   * instance of this class.
   *
   * @see https://github.com/digitalbazaar/ed25519-verification-key-2020
   *
   * @param {object} [options={}] - Options hashmap.
   *
   * @typedef {object} Ed25519VerificationKey2020
   * @param {Ed25519VerificationKey2020} options.keyPair - Source key pair.
   *
   * @returns {X25519KeyAgreementKey2020} A derived/converted key agreement
   *   key pair.
   */
  static fromEd25519VerificationKey2020({keyPair} = {}) {
    if(!keyPair.publicKeyMultibase) {
      throw new Error('Source public key is required to convert.');
    }

    if(!keyPair.publicKeyMultibase.startsWith(MULTIBASE_BASE58BTC_HEADER)) {
      throw new TypeError(
        'Expecting "publicKeyMultibase" value to be multibase base58btc ' +
        'encoded (must start with "z").'
      );
    }

    const xKey = new X25519KeyAgreementKey2020({
      controller: keyPair.controller,
      publicKeyMultibase: X25519KeyAgreementKey2020
        .convertFromEdPublicKey(keyPair)
    });

    if(keyPair.privateKeyMultibase) {
      if(!keyPair.privateKeyMultibase.startsWith(MULTIBASE_BASE58BTC_HEADER)) {
        throw new TypeError(
          'Expecting "privateKeyMultibase" value to be multibase base58btc ' +
          'encoded (must start with "z").'
        );
      }

      xKey.privateKeyMultibase = X25519KeyAgreementKey2020
        .convertFromEdPrivateKey(keyPair);
    }

    return xKey;
  }

  /**
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.publicKeyMultibase - Multibase encoded Ed25519
   *   public key.
   *
   * @returns {string} Multibase encoded converted X25519 Public key.
   */
  static convertFromEdPublicKey({publicKeyMultibase} = {}) {
    if(!publicKeyMultibase) {
      throw new Error('Source public key is required to convert.');
    }

    const edPubkeyBytes =
      _multibaseDecode(MULTICODEC_ED25519_PUB_HEADER, publicKeyMultibase);

    // Converts a 32-byte Ed25519 public key into a 32-byte Curve25519 key
    // Returns null if the given public key in not a valid Ed25519 public key.
    const dhPubkeyBytes = Point.fromHex(edPubkeyBytes).toX25519();
    if(!dhPubkeyBytes) {
      throw new Error(
        'Error converting to X25519; Invalid Ed25519 public key.');
    }
    return _multibaseEncode(MULTICODEC_X25519_PUB_HEADER, dhPubkeyBytes);
  }

  /**
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.privateKeyMultibase - Multibase encoded Ed25519
   *   private key.
   *
   * @returns {string} Multibase encoded converted X25519 Private key.
   */
  static convertFromEdPrivateKey({privateKeyMultibase} = {}) {
    if(!privateKeyMultibase) {
      throw new Error('Source private key is required to convert.');
    }

    const edPrivkeyBytes =
      _multibaseDecode(MULTICODEC_ED25519_PRIV_HEADER, privateKeyMultibase);
    // Converts a 64-byte Ed25519 secret key (or just the first 32-byte part of
    // it, which is the secret value) into a 32-byte Curve25519 secret key
    const dhPrivkeyBytes = ed25519SecretKeyToX25519(edPrivkeyBytes);
    // note: a future version should make this method async to allow use of
    // noble to convert private keys -- but the tweetnacl version used
    // internally is much faster (~ x100):
    // const {head: dhPrivkeyBytes} = await utils.getExtendedPublicKey(
    //   edPrivkeyBytes.slice(0, 32));
    if(!dhPrivkeyBytes) {
      throw new Error(
        'Error converting to X25519; Invalid Ed25519 private key.');
    }
    return _multibaseEncode(MULTICODEC_X25519_PRIV_HEADER, dhPrivkeyBytes);
  }

  /**
   * Exports the serialized representation of the KeyPair.
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {boolean} [options.publicKey] - Export public key material?
   * @param {boolean} [options.privateKey] - Export private key material?
   * @param {boolean} [options.includeContext] - Include JSON-LD context?
   *
   * @returns {object} A plain js object that's ready for serialization
   *   (to JSON, etc), for use in DIDs etc.
   */
  export({publicKey = false, privateKey = false, includeContext = false} = {}) {
    if(!(publicKey || privateKey)) {
      throw new TypeError(
        'Export requires specifying either "publicKey" or "privateKey".');
    }
    const exportedKey = {
      id: this.id,
      type: this.type
    };
    if(includeContext) {
      exportedKey['@context'] = X25519KeyAgreementKey2020.SUITE_CONTEXT;
    }
    if(this.controller) {
      exportedKey.controller = this.controller;
    }
    if(publicKey) {
      exportedKey.publicKeyMultibase = this.publicKeyMultibase;
    }
    if(privateKey) {
      exportedKey.privateKeyMultibase = this.privateKeyMultibase;
    }
    if(this.revoked) {
      exportedKey.revoked = this.revoked;
    }
    return exportedKey;
  }

  /**
   * Generates and returns a base58btc multibase encoded value of a multicodec
   * X25519 public key fingerprint (for use with cryptonyms, for example).
   *
   * @see https://github.com/multiformats/multicodec
   * @see https://github.com/multiformats/multibase
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.publicKeyMultibase - Multibase encoded public key.
   *
   * @returns {string} The fingerprint.
   */
  static fingerprintFromPublicKey({publicKeyMultibase} = {}) {
    if(!publicKeyMultibase) {
      throw new Error('Source public key is required.');
    }

    return publicKeyMultibase;
  }

  /**
   * Creates an instance of X25519KeyAgreementKey2020 from a key fingerprint.
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.fingerprint - Public key fingerprint.
   *
   * @returns {X25519KeyAgreementKey2020} Key pair instance (public key material
   *   only) created from the fingerprint.
   */
  static fromFingerprint({fingerprint} = {}) {
    return new X25519KeyAgreementKey2020({
      publicKeyMultibase: fingerprint
    });
  }

  /**
   * Derives a shared secret via a given public key, typically for use
   * as one parameter for computing a shared key. It should not be used as
   * a shared key itself, but rather as an input into a key derivation function
   * (KDF) to produce a shared key.
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {LDKeyPair} options.publicKey - Remote key pair.
   *
   * @returns {Promise<Uint8Array>} Derived secret.
   */
  async deriveSecret({publicKey}) {
    const remotePublicKey = _multibaseDecode(
      MULTICODEC_X25519_PUB_HEADER, publicKey.publicKeyMultibase);
    const privateKey = _multibaseDecode(
      MULTICODEC_X25519_PRIV_HEADER, this.privateKeyMultibase);

    return deriveSecret({privateKey, remotePublicKey});
  }

  /**
   * Generates and returns a multiformats encoded
   * X25519 public key fingerprint (for use with cryptonyms, for example).
   *
   * @see https://github.com/multiformats/multicodec
   *
   * @returns {string} The fingerprint.
   */
  fingerprint() {
    return this.publicKeyMultibase;
  }

  /**
   * Tests whether the fingerprint was generated from a given key pair.
   *
   * @example
   * xKeyPair.verifyFingerprint('...');
   * // {valid: true};
   *
   * @param {object} [options={}] - Options hashmap.
   * @param {string} options.fingerprint - An x25519 key fingerprint (typically
   *   from a key id).
   *
   * @returns {object} An object indicating valid is true or false.
   */
  verifyFingerprint({fingerprint} = {}) {
    // fingerprint should have `z` prefix indicating
    // that it's base58btc multibase encoded
    if(!_isValidKeyHeader(fingerprint, MULTICODEC_X25519_PUB_HEADER)) {
      throw new Error(
        `"fingerprint" has invalid header bytes: "${fingerprint}".`);
    }

    return {valid: true};
  }
}

// Used by CryptoLD harness for dispatching.
X25519KeyAgreementKey2020.suite = SUITE_ID;
// Used by CryptoLD harness's fromKeyId() method.
X25519KeyAgreementKey2020.SUITE_CONTEXT =
  'https://w3id.org/security/suites/x25519-2020/v1';

/**
 * Checks to see if the given value is a valid multibase encoded key.
 *
 * @param {Uint8Array} multibaseKey - The multibase-encoded key value.
 * @param {Uint8Array} expectedHeader - The expected header for the key value.
 * @returns {boolean} Returns true if the header is valid, false otherwise.
 */
function _isValidKeyHeader(multibaseKey, expectedHeader) {
  if(!(typeof multibaseKey === 'string' &&
    multibaseKey[0] === MULTIBASE_BASE58BTC_HEADER)) {
    return false;
  }

  const keyBytes = base58btc.decode(multibaseKey.slice(1));
  return expectedHeader.every((val, i) => keyBytes[i] === val);
}

/**
 * Encodes a given Uint8Array to multibase-encoded string.
 *
 * @param {Uint8Array} header - Multicodec header to prepend to the bytes.
 * @param {Uint8Array} bytes - Bytes to encode.
 * @returns {string} Multibase-encoded string.
 */
function _multibaseEncode(header, bytes) {
  const mcBytes = new Uint8Array(header.length + bytes.length);

  mcBytes.set(header);
  mcBytes.set(bytes, header.length);

  return MULTIBASE_BASE58BTC_HEADER + base58btc.encode(mcBytes);
}

/**
 * Decodes a given string as a multibase-encoded multicodec value.
 *
 * @param {Uint8Array} header - Expected header bytes for the multicodec value.
 * @param {string} text - Multibase encoded string to decode.
 * @returns {Uint8Array} Decoded bytes.
 */
function _multibaseDecode(header, text) {
  const mcValue = base58btc.decode(text.substr(1));

  if(!header.every((val, i) => mcValue[i] === val)) {
    throw new Error('Multibase value does not have expected header.');
  }

  return mcValue.slice(header.length);
}
