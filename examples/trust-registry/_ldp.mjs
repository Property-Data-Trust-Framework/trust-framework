import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import * as vc from '@digitalbazaar/vc';
import {securityLoader} from '@digitalbazaar/security-document-loader';
import {Ed25519VerificationKey2020} from '@digitalbazaar/ed25519-verification-key-2020';
import {Ed25519Signature2020} from '@digitalbazaar/ed25519-signature-2020';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadEd25519KeyPair2020FromFile(keyPath) {
  const raw = fs.readFileSync(keyPath, 'utf8');
  const serialized = JSON.parse(raw);
  return await Ed25519VerificationKey2020.from(serialized);
}

export function buildDocumentLoader() {
  const loader = securityLoader();

  // Add repo-local contexts when running in this repository (optional).
  // This avoids network fetches for the PDTF context when scripts are run locally.
  try {
    const pdtfV2Url = 'https://trust.propdata.org.uk/contexts/pdtf-v2.jsonld';
    const localPath = path.resolve(__dirname, '../../public/contexts/pdtf-v2.jsonld');
    if(fs.existsSync(localPath)) {
      loader.addStatic(pdtfV2Url, JSON.parse(fs.readFileSync(localPath, 'utf8')));
    }
  } catch {
    // ignore
  }

  try {
    const trUrl = 'https://trust.propdata.org.uk/contexts/trust-registry-v1.jsonld';
    const localPath = path.resolve(__dirname, '../../public/contexts/trust-registry-v1.jsonld');
    if(fs.existsSync(localPath)) {
      loader.addStatic(trUrl, JSON.parse(fs.readFileSync(localPath, 'utf8')));
    }
  } catch {
    // ignore
  }

  const baseLoader = loader.build();

  return async function documentLoader(url) {
    try {
      return await baseLoader(url);
    } catch (e) {
      // Fallback to fetching unknown contexts/documents over HTTPS.
      // Note: for production verifiers, you should avoid arbitrary remote context fetching.
      const res = await fetch(url, {
        headers: {accept: 'application/ld+json, application/json'}
      });
      if(!res.ok) {
        throw new Error(`documentLoader failed for ${url}: HTTP ${res.status}`);
      }
      const document = await res.json();
      return {
        contextUrl: null,
        documentUrl: url,
        document
      };
    }
  };
}

export async function issueEd25519Signature2020({credential, keyPair, documentLoader}) {
  const suite = new Ed25519Signature2020({key: keyPair});
  return await vc.issue({credential, suite, documentLoader});
}

