#!/usr/bin/env node
/**
 * Generate a GA-signed Issuer Accreditation Credential (IAC) as a JSON-LD VC
 * with a Linked Data Proof (Ed25519Signature2020).
 *
 * Usage:
 *   node examples/trust-registry/generate-iac.mjs \
 *     --ga-keypair ./ga-keypair.json \
 *     --issuer-did did:web:landregistry.example \
 *     --legal-name "UK Land Registry Authority" \
 *     --status-list-credential https://trust.propdata.org.uk/status/ga-accreditation-revocation.json \
 *     --status-list-index 12 \
 *     --out ./iac-landregistry.json
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
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
const issuanceDate = getArg('--issuance-date', { defaultValue: now.toISOString() });
const expirationDate = getArg('--expiration-date', { defaultValue: undefined });

const id = getArg('--id', {
  defaultValue: `urn:pdtf:trust-registry:iac:${crypto.randomUUID()}`
});

const credential = {
  '@context': [
    'https://www.w3.org/2018/credentials/v1',
    'https://w3id.org/vc/status-list/2021/v1',
    // PDTF context (optional but useful for shared terms)
    'https://trust.propdata.org.uk/contexts/pdtf-v2.jsonld',
    // Trust registry terms used below
    'https://trust.propdata.org.uk/contexts/trust-registry-v1.jsonld'
  ],
  id,
  type: ['VerifiableCredential', 'PDTFIssuerAccreditationCredential'],
  issuer: getArg('--ga-did', { defaultValue: undefined }) ?? undefined,
  issuanceDate,
  ...(expirationDate ? { expirationDate } : {}),
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
    type: 'StatusList2021Entry',
    statusPurpose: 'revocation',
    statusListIndex: String(statusListIndex),
    statusListCredential
  }
};

const keyPair = await loadEd25519KeyPair2020FromFile(gaKeypairPath);
// If `--ga-did` wasn't explicitly provided, default the VC issuer to the key controller.
if (!credential.issuer) credential.issuer = keyPair.controller;

const documentLoader = buildDocumentLoader();
const signedVc = await issueEd25519Signature2020({credential, keyPair, documentLoader});

const output = `${JSON.stringify(signedVc, null, 2)}\n`;

if (outPath === '-' || outPath === '/dev/stdout') {
  process.stdout.write(output);
} else {
  fs.writeFileSync(outPath, output, 'utf8');
}

process.stderr.write(`IAC_ID=${signedVc.id}\n`);

