#!/usr/bin/env node
/**
 * Generate a GA Ed25519VerificationKey2020 keypair (JSON) for Linked Data Proofs.
 *
 * Usage:
 *   node examples/trust-registry/generate-ga-keypair.mjs \
 *     --controller did:web:trust.propdata.org.uk \
 *     --id did:web:trust.propdata.org.uk#key-1 \
 *     --out ./ga-keypair.json \
 *     --out-public ./ga-public.json
 *
 * If no output paths are provided, prints keypair JSON to stdout.
 */
import fs from 'node:fs';
import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';

function getArg(name) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? undefined : process.argv[idx + 1];
}

const controller = getArg('--controller') ?? 'did:web:trust.propdata.org.uk';
const id = getArg('--id') ?? `${controller}#key-1`;

const out = getArg('--out');
const outPublic = getArg('--out-public');

const keyPair = await Ed25519VerificationKey2020.generate({controller, id});

const full = await keyPair.export({publicKey: true, privateKey: true});
const pub = await keyPair.export({publicKey: true});

if (out) fs.writeFileSync(out, `${JSON.stringify(full, null, 2)}\n`, 'utf8');
if (outPublic) fs.writeFileSync(outPublic, `${JSON.stringify(pub, null, 2)}\n`, 'utf8');

if (!out && !outPublic) {
  process.stdout.write(`${JSON.stringify(full, null, 2)}\n`);
}

