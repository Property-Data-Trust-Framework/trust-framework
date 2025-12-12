#!/usr/bin/env node
/**
 * Generate a GA-signed Status List 2021 VC for accreditation credential revocation.
 *
 * This creates a VC-shaped JSON object with `credentialSubject.encodedList` as
 * a base64url-encoded, gzip-compressed bitstring.
 *
 * Bit ordering (common in StatusList tooling): index 0 is LSB of byte 0.
 *
 * Usage:
 *   node examples/trust-registry/generate-ga-accreditation-status-list.mjs \
 *     --ga-keypair ./ga-keypair.json \
 *     --id https://trust.propdata.org.uk/status/ga-accreditation-revocation.json \
 *     --length 2048 \
 *     --revoked 12,98,123 \
 *     --out ./ga-accreditation-revocation.json
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import {base64urlEncode} from './_jws.mjs';
import {buildDocumentLoader, issueEd25519Signature2020, loadEd25519KeyPair2020FromFile} from './_ldp.mjs';

function getArg(name, { required = false, defaultValue } = {}) {
  const idx = process.argv.indexOf(name);
  if (idx === -1) {
    if (required) throw new Error(`Missing required arg: ${name}`);
    return defaultValue;
  }
  const val = process.argv[idx + 1];
  if (!val && required) throw new Error(`Missing value for arg: ${name}`);
  return val ?? defaultValue;
}

const gaKeypairPath = getArg('--ga-keypair', { required: true });

const id = getArg('--id', { required: true });
const outPath = getArg('--out', { defaultValue: '-' });
const statusPurpose = getArg('--status-purpose', { defaultValue: 'revocation' }); // revocation|suspension
const length = Number(getArg('--length', { defaultValue: '16384' }));
if (!Number.isInteger(length) || length <= 0) throw new Error('--length must be a positive integer');

const revoked = (getArg('--revoked', { defaultValue: '' }) || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
  .map((s) => Number(s))
  .filter((n) => Number.isInteger(n) && n >= 0);

const now = new Date();

const encodedList = makeEncodedBitstring({ length, setBits: revoked });

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1'
  ],
  id,
  type: ['VerifiableCredential', 'StatusList2021Credential'],
  issuer: getArg('--ga-did', { defaultValue: undefined }) ?? undefined,
  issuanceDate: now.toISOString(),
  credentialSubject: {
    id: `${id}#list`,
    type: 'StatusList2021',
    statusPurpose,
    encodedList
  }
};

const keyPair = await loadEd25519KeyPair2020FromFile(gaKeypairPath);
if (!credential.issuer) credential.issuer = keyPair.controller;

const documentLoader = buildDocumentLoader();
const signedVc = await issueEd25519Signature2020({credential, keyPair, documentLoader});

const output = `${JSON.stringify(signedVc, null, 2)}\n`;
if (outPath === '-' || outPath === '/dev/stdout') process.stdout.write(output);
else fs.writeFileSync(outPath, output, 'utf8');

process.stderr.write(`STATUS_LIST_ID=${signedVc.id}\n`);

function makeEncodedBitstring({ length: bitLength, setBits }) {
  const byteLen = Math.ceil(bitLength / 8);
  const bytes = new Uint8Array(byteLen);

  for (const idx of setBits) {
    if (idx >= bitLength) continue;
    const byteIndex = Math.floor(idx / 8);
    const bitIndex = idx % 8; // LSB-first
    bytes[byteIndex] |= 1 << bitIndex;
  }

  const gz = zlib.gzipSync(Buffer.from(bytes));
  return base64urlEncode(gz);
}

