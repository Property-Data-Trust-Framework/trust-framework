#!/usr/bin/env node
/**
 * Generate and GA-sign a Trust Registry Index VC pointing to current IAC VCs.
 *
 * Usage:
 *   node examples/trust-registry/generate-registry-index.mjs \
 *     --ga-keypair ./ga-keypair.json \
 *     --environment live|test \
 *     --id https://trust.propdata.org.uk/trust-registry/v2/index.json \
 *     --iac ./iac-landregistry.json \
 *     --iac ./iac-epc.json \
 *     --out ./trust-registry-index.json
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {sha256Hex, stableJsonStringify} from './_jws.mjs';
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

function getMultiArg(name) {
  const vals = [];
  for (let i = 0; i < process.argv.length; i++) {
    if (process.argv[i] === name) vals.push(process.argv[i + 1]);
  }
  return vals.filter(Boolean);
}

const gaKeypairPath = getArg('--ga-keypair', { required: true });

const environment = getArg('--environment', { defaultValue: 'test' }); // test|live
if (!['test', 'live'].includes(environment)) {
  throw new Error('--environment must be "test" or "live"');
}

const id =
  getArg('--id', { defaultValue: undefined }) ??
  `https://trust.propdata.org.uk/trust-registry/${environment}/index.json`;

const outPath = getArg('--out', { defaultValue: '-' });

const iacPaths = getMultiArg('--iac');
if (!iacPaths.length) throw new Error('Provide at least one --iac <path>');

const now = new Date();

const issuers = iacPaths.map((p) => {
  const raw = fs.readFileSync(p, 'utf8');
  const iac = JSON.parse(raw);
  const issuerDid = iac?.credentialSubject?.id;
  if (!issuerDid) throw new Error(`IAC missing credentialSubject.id: ${p}`);

  const iacEnv = iac?.credentialSubject?.environment;
  if (iacEnv && iacEnv !== environment) {
    throw new Error(
      `IAC environment mismatch (index=${environment}, iac=${iacEnv}): ${p}`
    );
  }

  return {
    issuerDid,
    iacId: iac.id,
    iacSha256: sha256Hex(stableJsonStringify(iac)),
    // For static publication, you typically make iac.id a URL and omit this.
    // Keeping `sourcePath` is useful in CI pipelines.
    sourcePath: p
  };
});

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://trust.propdata.org.uk/contexts/pdtf-v2.jsonld',
    'https://trust.propdata.org.uk/contexts/trust-registry-v1.jsonld'
  ],
  id,
  type: ['VerifiableCredential', 'PDTFTrustRegistryIndexCredential'],
  issuer: getArg('--ga-did', { defaultValue: undefined }) ?? undefined,
  issuanceDate: now.toISOString(),
  credentialSubject: {
    id: `${id}#subject`,
    type: 'PDTFTrustRegistryIndex',
    publishedDate: now.toISOString(),
    environment,
    issuers
  }
};

const keyPair = await loadEd25519KeyPair2020FromFile(gaKeypairPath);
if (!credential.issuer) credential.issuer = keyPair.controller;

const documentLoader = buildDocumentLoader();
const signedIndex = await issueEd25519Signature2020({credential, keyPair, documentLoader});

const output = `${JSON.stringify(signedIndex, null, 2)}\n`;
if (outPath === '-' || outPath === '/dev/stdout') process.stdout.write(output);
else fs.writeFileSync(outPath, output, 'utf8');

process.stderr.write(`INDEX_ID=${signedIndex.id}\n`);

