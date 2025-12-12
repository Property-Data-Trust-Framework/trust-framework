#!/usr/bin/env node
/**
 * Generate and GA-sign a Trust Registry Index pointing to current IAC VCs.
 *
 * Usage:
 *   node examples/trust-registry/generate-registry-index.mjs \
 *     --ga-did did:web:trust.propdata.org.uk \
 *     --ga-vm did:web:trust.propdata.org.uk#key-1 \
 *     --ga-private ./ga-private.pem \
 *     --id https://trust.propdata.org.uk/trust-registry/v2/index.json \
 *     --iac ./iac-landregistry.json \
 *     --iac ./iac-epc.json \
 *     --out ./trust-registry-index.json
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { signJwsEdDsa, stableJsonStringify, sha256Hex } from './_jws.mjs';

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

function getMultiArg(name) {
  const vals = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === name) vals.push(process.argv[i + 1]);
  }
  return vals.filter(Boolean);
}

const gaDid = getArg('--ga-did', { required: true });
const gaVm = getArg('--ga-vm', { required: true });
const gaPrivatePath = getArg('--ga-private', { required: true });

const id = getArg('--id', { required: true });
const outPath = getArg('--out', { defaultValue: '-' });

const iacPaths = getMultiArg('--iac');
if (!iacPaths.length) throw new Error('Provide at least one --iac <path>');

const now = new Date();

const issuers = iacPaths.map((p) => {
  const raw = fs.readFileSync(p, 'utf8');
  const iac = JSON.parse(raw);
  const issuerDid = iac?.credentialSubject?.id;
  if (!issuerDid) throw new Error(`IAC missing credentialSubject.id: ${p}`);

  return {
    issuerDid,
    iacId: iac.id,
    iacSha256: sha256Hex(stableJsonStringify(iac)),
    // For static publication, you typically make iac.id a URL and omit this.
    // Keeping `sourcePath` is useful in CI pipelines.
    sourcePath: p
  };
});

const indexDoc = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id,
  type: 'PDTFTrustedIssuerRegistryIndex',
  issuer: gaDid,
  publishedDate: now.toISOString(),
  issuers
};

const gaPrivatePem = fs.readFileSync(gaPrivatePath, 'utf8');
const gaPrivateKey = crypto.createPrivateKey(gaPrivatePem);

const jws = signJwsEdDsa({
  header: { alg: 'EdDSA', typ: 'JWS', kid: gaVm },
  payload: indexDoc,
  privateKey: gaPrivateKey
});

const signedIndex = {
  ...indexDoc,
  proof: {
    type: 'JwsProof2025',
    created: now.toISOString(),
    proofPurpose: 'assertionMethod',
    verificationMethod: gaVm,
    jws
  }
};

const output = `${JSON.stringify(signedIndex, null, 2)}\n`;
if (outPath === '-' || outPath === '/dev/stdout') process.stdout.write(output);
else fs.writeFileSync(outPath, output, 'utf8');

process.stderr.write(`INDEX_SHA256=${crypto.createHash('sha256').update(stableJsonStringify(signedIndex)).digest('hex')}\n`);

