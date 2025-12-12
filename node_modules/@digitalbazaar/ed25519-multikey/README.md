# Ed25519Multikey Key Pair Library for Linked Data _(@digitalbazaar/ed25519-multikey)_

[![Node.js CI](https://github.com/digitalbazaar/ed25519-multikey/workflows/Node.js%20CI/badge.svg)](https://github.com/digitalbazaar/ed25519-multikey/actions?query=workflow%3A%22Node.js+CI%22)
[![NPM Version](https://img.shields.io/npm/v/@digitalbazaar/ed25519-multikey.svg)](https://npm.im/@digitalbazaar/ed25519-multikey)

> Javascript library for generating and working with Ed25519Multikey key pairs.

## Table of Contents

- [Background](#background)
- [Security](#security)
- [Install](#install)
- [Usage](#usage)
- [Contribute](#contribute)
- [Commercial Support](#commercial-support)
- [License](#license)

## Background

For use with:

* [`@digitalbazaar/eddsa-2022-cryptosuite`](https://github.com/digitalbazaar/eddsa-2022-cryptosuite) `^1.0.0`
  crypto suite (with [`jsonld-signatures`](https://github.com/digitalbazaar/jsonld-signatures) `^11.0.0`)
* [`@digitalbazaar/data-integrity`](https://github.com/digitalbazaar/data-integrity) `^1.0.0`

See also (related specs):

* [Verifiable Credential Data Integrity](https://w3c.github.io/vc-data-integrity/)

## Security

As with most security- and cryptography-related tools, the overall security of
your system will largely depend on your design decisions.

## Install

- Node.js 16+ is required.

To install locally (for development):

```
git clone https://github.com/digitalbazaar/ed25519-multikey.git
cd ed25519-multikey
npm install
```

## Usage

### Generating a new public/secret key pair

To generate a new public/secret key pair:

* `{string} [id]` Optional id for the generated key.
* `{string} [controller]` Optional controller URI or DID to initialize the
  generated key. (This will also init the key id.)
* `{string} [seed]` Optional deterministic seed value from which to generate the
  key.

```js
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';

const edKeyPair = await Ed25519Multikey.generate();
```

### Importing a key pair from storage

To create an instance of a public/secret key pair from data imported from
storage, use `.from()`:

```js
const serializedKeyPair = { ... };

const keyPair = await Ed25519Multikey.from(serializedKeyPair);
````

### Exporting the public key only

To export just the public key of a pair:

```js
await keyPair.export({publicKey: true});
// ->
{
  type: 'Multikey',
  id: 'did:example:1234#z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX',
  controller: 'did:example:1234',
  publicKeyMultibase: 'z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX'
}
```

### Exporting the full public-secret key pair

To export the full key pair, including secret key (warning: this should be a
carefully considered operation, best left to dedicated Key Management Systems):

```js
await keyPair.export({publicKey: true, secretKey: true});
// ->
{
  type: 'Multikey',
  id: 'did:example:1234#z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX',
  controller: 'did:example:1234',
  publicKeyMultibase: 'z6Mkon3Necd6NkkyfoGoHxid2znGc59LU3K7mubaRcFbLfLX',
  secretKeyMultibase: 'zruzf4Y29hDp7vLoV3NWzuymGMTtJcQfttAWzESod4wV2fbPvEp4XtzGp2VWwQSQAXMxDyqrnVurYg2sBiqiu1FHDDM'
}
```

### Creating a signer function

In order to perform a cryptographic signature, you need to create a `sign`
function, and then invoke it.

```js
const keyPair = Ed25519Multikey.generate();

const {sign} = keyPair.signer();

// data is a Uint8Array of bytes
const data = (new TextEncoder()).encode('test data goes here');
// Signing also outputs a Uint8Array, which you can serialize to text etc.
const signatureValueBytes = await sign({data});
```

### Creating a verifier function

In order to verify a cryptographic signature, you need to create a `verify`
function, and then invoke it (passing it the data to verify, and the signature).

```js
const keyPair = Ed25519Multikey.generate();

const {verify} = keyPair.verifier();

const valid = await verify({data, signature});
// true
```

### Converting from previous Ed25519VerificationKey2020 key type

If you have serialized and stored keys of the previous
`Ed25519VerificationKey2020` key type (for example, generated using
the [`ed25519-verification-key-2020`](https://github.com/digitalbazaar/ed25519-verification-key-2020))
library, things to keep in mind:

* Instances of those key types still contain the same key material, the only
  thing that has changed from the 2020 suite to Multikey is the property name
  change for storing the secret key and replacing the type with `Multikey`.
  The 2020 suite key types serialize using the type `Ed25519VerificationKey2020`
  and stored secret key material in `privateKeyMultibase`, and the Ed25519
  Multikey (this repo) serializes using corresponding the type `Multikey` an
  stores the secret key material in `secretKeyMultibase` property.
* You can convert from the 2020 key type to Multikey using the provided
  `Ed25519Multikey.from()` method (see below).
* They `generate()` the same key material, given the same `seed` parameter.
* Both the 2020 and Multikey keys produce and verify the same signatures.

Example of converting:

```js
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {Ed25519VerificationKey2020}
  from '@digitalbazaar/ed25519-verification-key-2020';


const keyPair2020 = await Ed25519VerificationKey2020.generate({
  controller: 'did:example:1234'
});

const ed25519Multikey = await Ed25519Multikey.from(keyPair2020);

// The resulting ed25519Multikey will have the same `id` and `controller` properties
// as its 2020 source. They will also produce and verify the same signatures.

// data is a Uint8Array of bytes
const data = (new TextEncoder()).encode('test data goes here');
const signatureBytes2020 = await keyPair2020.signer().sign({data});

// this is the same signature as that produced by the 2020 key. And will verify
// the same.
await ed25519Multikey.verifier().verify({data, signature: signatureBytes2020})
// true
```

### Converting from previous Ed25519VerificationKey2018 key type

If you have serialized and stored keys of the previous
`Ed25519VerificationKey2018` key type (for example, generated using
the [`ed25519-verification-key-2018`](https://github.com/digitalbazaar/ed25519-verification-key-2018))
library, things to keep in mind:

* Instances of those key types still contain the same key material, the only
  thing that has changed from the 2018 suite to Multikey is the way the public
  and secret key material is serialized when exporting. The 2018 suite key
  types serialize using the `publicKeyBase58` and `secretKeyBase58` properties,
  and the Ed25519 Multikey (this repo) serializes using corresponding
  `publicKeyMultibase` and `secretKeyMultibase` property.
* You can convert from the 2018 key type to Multikey using the provided
  `Ed25519Multikey.from()` method (see below).
* They `generate()` the same key material, given the same `seed` parameter.
* Both the 2018 and Multikey keys produce and verify the same signatures.

Example of converting:

```js
import * as Ed25519Multikey from '@digitalbazaar/ed25519-multikey';
import {Ed25519VerificationKey2018}
  from '@digitalbazaar/ed25519-verification-key-2018';


const keyPair2018 = await Ed25519VerificationKey2018.generate({
  controller: 'did:example:1234'
});

const ed25519Multikey = await Ed25519Multikey.from(keyPair2018);

// The resulting ed25519Multikey will have the same `id` and `controller` properties
// as its 2018 source. They will also produce and verify the same signatures.

// data is a Uint8Array of bytes
const data = (new TextEncoder()).encode('test data goes here');
const signatureBytes2018 = await keyPair2018.signer().sign({data});

// this is the same signature as that produced by the 2020 key. And will verify
// the same.
await ed25519Multikey.verifier().verify({data, signature: signatureBytes2018})
// true
```

## Contribute

See [the contribute file](https://github.com/digitalbazaar/bedrock/blob/master/CONTRIBUTING.md)!

PRs accepted.

If editing the Readme, please conform to the
[standard-readme](https://github.com/RichardLitt/standard-readme) specification.

## Commercial Support

Commercial support for this library is available upon request from
Digital Bazaar: support@digitalbazaar.com

## License

[New BSD License (3-clause)](LICENSE) © 2020 Digital Bazaar
