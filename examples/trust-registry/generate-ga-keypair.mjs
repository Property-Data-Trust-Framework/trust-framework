#!/usr/bin/env node
/**
 * Generate a GA Ed25519 keypair for signing registry credentials.
 *
 * Usage:
 *   node examples/trust-registry/generate-ga-keypair.mjs \
 *     --out-private ./ga-private.pem \
 *     --out-public ./ga-public.pem
 *
 * If no output paths are provided, prints PEM to stdout.
 */
import crypto from 'node:crypto';
import fs from 'node:fs';

function getArg(name) {
  const idx = process.argv.indexOf(name);
  return idx === -1 ? undefined : process.argv[idx + 1];
}

const outPrivate = getArg('--out-private');
const outPublic = getArg('--out-public');

const { privateKey, publicKey } = crypto.generateKeyPairSync('ed25519');

const privatePem = privateKey.export({ type: 'pkcs8', format: 'pem' });
const publicPem = publicKey.export({ type: 'spki', format: 'pem' });

if (outPrivate) fs.writeFileSync(outPrivate, privatePem, 'utf8');
if (outPublic) fs.writeFileSync(outPublic, publicPem, 'utf8');

if (!outPrivate && !outPublic) {
  process.stdout.write(privatePem);
  process.stdout.write('\n');
  process.stdout.write(publicPem);
}

