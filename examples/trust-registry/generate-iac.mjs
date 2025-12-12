#!/usr/bin/env node
/**
 * Generate a GA-signed Issuer Accreditation Credential (IAC) as a VC-shaped JSON object.
 *
 * Notes:
 * - This uses a compact JWS (EdDSA) embedded in `proof.jws`.
 * - It uses deterministic key-sorted JSON for signing (NOT JSON-LD canonicalization).
 *   For production, use a proper VC Data Integrity implementation and JSON-LD canonicalization.
 *
 * Usage:
 *   node examples/trust-registry/generate-iac.mjs \
 *     --ga-did did:web:trust.propdata.org.uk \
 *     --ga-vm did:web:trust.propdata.org.uk#key-1 \
 *     --ga-private ./ga-private.pem \
 *     --issuer-did did:web:landregistry.example \
 *     --legal-name "UK Land Registry Authority" \
 *     --status-list-credential https://trust.propdata.org.uk/status/ga-accreditation-revocation.json \
 *     --status-list-index 12 \
 *     --out ./iac-landregistry.json
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { signJwsEdDsa, stableJsonStringify } from './_jws.mjs';

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

const gaDid = getArg('--ga-did', { required: true });
const gaVm = getArg('--ga-vm', { required: true });
const gaPrivatePath = getArg('--ga-private', { required: true });

const issuerDid = getArg('--issuer-did', { required: true });
const legalName = getArg('--legal-name', { required: true });

const statusListCredential = getArg('--status-list-credential', { required: true });
const statusListIndex = Number(getArg('--status-list-index', { required: true }));
if (!Number.isInteger(statusListIndex) || statusListIndex < 0) {
  throw new Error('--status-list-index must be a non-negative integer');
}

const outPath = getArg('--out', { defaultValue: '-' });

// Optional policy/metadata flags (repeatable comma-separated lists).
const authorizedTypes = (getArg('--credential-types', { defaultValue: '' }) || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const allowedSchemas = (getArg('--allowed-schemas', { defaultValue: '' }) || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const vcFormats = (getArg('--vc-formats', { defaultValue: 'jsonld-di' }) || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const assuranceLevel = getArg('--assurance-level', { defaultValue: 'AL2' });
const oid4vciIssuer = getArg('--oid4vci-issuer', { defaultValue: undefined });
const issuerStatusList = getArg('--issuer-status-list', { defaultValue: undefined });
const environment = getArg('--environment', { defaultValue: 'test' }); // test|live

const now = new Date();
const validFrom = getArg('--valid-from', { defaultValue: now.toISOString() });
const validUntil = getArg('--valid-until', { defaultValue: undefined });

const id = getArg('--id', {
  defaultValue: `urn:pdtf:trust-registry:iac:${crypto.randomUUID()}`
});

const vc = {
  '@context': ['https://www.w3.org/2018/credentials/v1'],
  id,
  type: ['VerifiableCredential', 'PDTFIssuerAccreditationCredential'],
  issuer: gaDid,
  validFrom,
  ...(validUntil ? { validUntil } : {}),
  credentialSubject: {
    id: issuerDid,
    legalName,
    environment,
    status: 'active',
    assuranceLevel,
    authorizations: {
      ...(authorizedTypes.length ? { credentialTypes: authorizedTypes } : {}),
      ...(allowedSchemas.length ? { allowedSchemas } : {}),
      vcFormats
    },
    discovery: {
      ...(oid4vciIssuer ? { oid4vciIssuer } : {}),
      ...(issuerStatusList ? { issuerStatusList } : {})
    }
  },
  credentialStatus: {
    id: `${statusListCredential}#${statusListIndex}`,
    type: 'BitstringStatusListEntry',
    statusPurpose: 'revocation',
    statusListIndex: String(statusListIndex),
    statusListCredential
  }
};

const gaPrivatePem = fs.readFileSync(gaPrivatePath, 'utf8');
const gaPrivateKey = crypto.createPrivateKey(gaPrivatePem);

const jws = signJwsEdDsa({
  header: { alg: 'EdDSA', typ: 'JWS', kid: gaVm },
  payload: vc,
  privateKey: gaPrivateKey
});

const signedVc = {
  ...vc,
  proof: {
    type: 'JwsProof2025',
    created: now.toISOString(),
    proofPurpose: 'assertionMethod',
    verificationMethod: gaVm,
    jws
  }
};

const output = `${JSON.stringify(signedVc, null, 2)}\n`;

if (outPath === '-' || outPath === '/dev/stdout') {
  process.stdout.write(output);
} else {
  fs.writeFileSync(outPath, output, 'utf8');
}

// Also print a deterministic hash line to stderr for easy indexing.
process.stderr.write(`IAC_SHA256=${crypto.createHash('sha256').update(stableJsonStringify(signedVc)).digest('hex')}\n`);

