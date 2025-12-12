# Trusted Issuer Registry (Option B) — Usage & Operations Guide

This guide describes how to operate the PDTF Trust Registry using **Option B**: **GA-issued accreditation credentials** (Verifiable Credentials) for trusted issuers and proxies.

It is written for three audiences:

- **Registry Operator / Governance Authority (GA)**: how to publish and maintain the trust registry.
- **Trusted Issuers / Trusted Proxies**: how to onboard, issue credentials, and manage lifecycle.
- **Verifiers / Hubs (AS/RS)**: how to consume the registry and enforce trust decisions.

> Note
> - The legacy `public/trusted-issuers-registry.json` was not intended to be a valid, normative registry model.
> - The normative model described here is based on **JSON-LD VCs + Linked Data Proofs** and **Status List 2021**.

---

## 1. Concepts and artifacts

### 1.1 Roles

- **Governance Authority (GA)**: Trust anchor. Owns the GA DID and signing keys and issues accreditation credentials.
- **Trust Registry Operator (TRO)**: Publishes and maintains registry artifacts. MAY be the same org as GA.
- **Trusted Issuer**: An entity accredited to issue specific PDTF credential types/schemas.
- **Trusted Proxy**: An entity accredited to issue credentials *on behalf of* a primary source (policy-governed).
- **Verifier / Hub**: A relying party (or PDTF hub AS/RS) that verifies credentials and enforces trust policy.

### 1.2 Registry artifacts (per environment)

All artifacts exist in **two separate environments**:

- **`test`**: sandbox/pilot use only.
- **`live`**: production.

#### A) GA Accreditation Status List VC (Status List 2021)

Purpose: allow the GA to revoke/suspend accreditation credentials (IACs) without rewriting history.

- **Type**: `StatusList2021Credential`
- **Context**: `https://w3id.org/vc/status-list/2021/v1`
- **Issuer**: GA DID
- **URL pattern (recommended)**:
  - `https://trust.propdata.org.uk/status/test/ga-accreditation-revocation.json`
  - `https://trust.propdata.org.uk/status/live/ga-accreditation-revocation.json`

#### B) Issuer Accreditation Credential (IAC)

Purpose: a GA-signed VC asserting that a particular issuer DID is accredited for certain issuance scopes.

- **Type**: `PDTFIssuerAccreditationCredential`
- **Issuer**: GA DID
- **Subject**: issuer DID (in `credentialSubject.id`)
- Includes:
  - **environment** (`test` or `live`)
  - **status** (`active` / operational lifecycle)
  - **assuranceLevel** (e.g., AL2 / AL4 per governance)
  - **authorizations** (allowed schemas/types/formats)
  - **discovery** (OID4VCI URL, issuer status list URL, etc.)
  - **credentialStatus** entry pointing to the GA accreditation Status List VC

#### C) Trust Registry Index Credential

Purpose: a GA-signed VC that lists the **current** IACs for an environment.

- **Type**: `PDTFTrustRegistryIndexCredential`
- **Issuer**: GA DID
- **Subject**: a `PDTFTrustRegistryIndex` object containing:
  - `environment`
  - `publishedDate`
  - `issuers[]` entries referencing IAC IDs (and optional integrity hashes)

**URL pattern (recommended)**:

- `https://trust.propdata.org.uk/trust-registry/test/index.json`
- `https://trust.propdata.org.uk/trust-registry/live/index.json`

---

## 2. Publication layout (recommended)

This repository is already deployed as a static site (GitHub Pages). A pragmatic static layout is:

```
public/
  contexts/
    trust-registry-v1.jsonld
  status/
    test/
      ga-accreditation-revocation.json
    live/
      ga-accreditation-revocation.json
  trust-registry/
    test/
      index.json
      iac/
        <issuer-identifier>.json
    live/
      index.json
      iac/
        <issuer-identifier>.json
```

Where `<issuer-identifier>` is an implementation choice (URL-safe slug). The authoritative identifier remains `iac.id`.

---

## 3. Cryptographic and DID requirements

### 3.1 GA DID and keys

- GA **MUST** control a DID suitable for verification by relying parties (typically `did:web` on the registry domain).
- GA **MUST** maintain two separate signing keys:
  - **live key**: e.g., `did:web:trust.propdata.org.uk#key-1`
  - **test key**: e.g., `did:web:trust.propdata.org.uk#test-key-1`
- Verifiers **MUST** pin the appropriate GA verification method for the environment they operate in.

### 3.2 Issuer DIDs and keys

- Issuers **MUST** control the DID that appears as the `issuer` of business credentials.
- Issuers **SHOULD** publish DID documents and rotate keys according to their security policy.

---

## 4. Operator/GA: Day-0 setup

### 4.1 Add trust registry context

This repo includes a trust registry context:

- `public/contexts/trust-registry-v1.jsonld`

If you add new fields used in IACs or index credentials, you **MUST** update this context (or define a new versioned context).

### 4.2 Generate GA keys (test and live)

Example (writes JSON key material; keep private keys out of Git):

```bash
node examples/trust-registry/generate-ga-keypair.mjs \
  --environment test \
  --out ./ga-test-keypair.json \
  --out-public ./ga-test-public.json

node examples/trust-registry/generate-ga-keypair.mjs \
  --environment live \
  --out ./ga-live-keypair.json \
  --out-public ./ga-live-public.json
```

Operational requirements:

- GA **MUST** store private keys in a secure KMS/HSM (or equivalent) in production.
- GA **MUST NOT** commit private keys to this repository.
- GA **SHOULD** publish the GA public key material via the GA DID document.

---

## 5. Operator/GA: Issuer onboarding and accreditation issuance

### 5.1 Onboarding inputs (minimum)

Issuer provides:

- **Issuer DID** to be accredited
- **Legal name** (and other KYB/KYC evidence as required by governance)
- Requested **authorization scope**:
  - `credentialTypes` and/or `allowedSchemas`
  - supported VC formats
  - assurance level requested (GA decides)
- Discovery metadata:
  - OID4VCI credential issuer URL (if relevant)
  - issuer status list URL(s) for credentials it issues
- Environment: `test` or `live`

### 5.2 DID control verification (required)

GA/TRO **MUST** verify the applicant controls the issuer DID (e.g., DID-Auth challenge signed by a DID verification method).

### 5.3 Create / update GA accreditation status list VC

Create per environment:

```bash
node examples/trust-registry/generate-ga-accreditation-status-list.mjs \
  --ga-keypair ./ga-test-keypair.json \
  --environment test \
  --length 16384 \
  --revoked "" \
  --out ./ga-accreditation-revocation-test.json

node examples/trust-registry/generate-ga-accreditation-status-list.mjs \
  --ga-keypair ./ga-live-keypair.json \
  --environment live \
  --length 16384 \
  --revoked "" \
  --out ./ga-accreditation-revocation-live.json
```

Publishing notes:

- This VC is updated as revocations occur. Verifiers cache with short TTL/ETag.

### 5.4 Issue an IAC (Issuer Accreditation Credential)

```bash
node examples/trust-registry/generate-iac.mjs \
  --ga-keypair ./ga-live-keypair.json \
  --environment live \
  --issuer-did did:web:issuer.example \
  --legal-name "Issuer Example Ltd" \
  --status-list-credential https://trust.propdata.org.uk/status/live/ga-accreditation-revocation.json \
  --status-list-index 123 \
  --credential-types PropertyOwnershipCertificate,LandRegistryExtract \
  --allowed-schemas https://trust.propdata.org.uk/schemas/PDTF-VerifiableCredential \
  --vc-formats jsonld-di \
  --oid4vci-issuer https://issuer.example/oid4vci \
  --issuer-status-list https://issuer.example/status/list-2021.json \
  --out ./iac-issuer-example.json
```

Operational rules:

- GA **MUST** allocate a unique `statusListIndex` for each IAC and track it.
- GA **MUST** publish the IAC at an immutable URL (do not overwrite; supersede via index updates).
- GA **MUST** issue a **new** IAC for any scope change (schemas/types/formats/endpoints).

### 5.5 Publish/update the registry index VC

```bash
node examples/trust-registry/generate-registry-index.mjs \
  --ga-keypair ./ga-live-keypair.json \
  --environment live \
  --iac ./iac-issuer-example.json \
  --out ./index-live.json
```

The index generator **refuses** to include IACs from the wrong environment.

---

## 6. Operator/GA: Suspension, revocation, and incident response

### 6.1 Suspension/revocation of an IAC

GA revokes an IAC by setting the corresponding bit/index in the GA accreditation status list VC.

Requirements:

- Verifiers **MUST** treat revoked accreditation as “issuer not trusted” for protected operations.
- GA **SHOULD** publish a change notice and keep an audit trail (issue/PR record).

### 6.2 GA key rotation

- GA **MUST** rotate keys by updating the GA DID document.
- GA **SHOULD** keep previous verification methods available long enough for old proofs to be verifiable (policy-defined).
- GA **MUST** ensure test and live rotations are independent (avoid cross-environment reuse).

---

## 7. Trusted Issuers / Trusted Proxies: How to operate

### 7.1 Preconditions

- You have an issuer DID and control the signing keys referenced in its DID document.
- You have completed GA onboarding and have a published, valid IAC for the right environment.

### 7.2 Issuing business credentials

When issuing any PDTF credential:

- **issuer MUST be your DID** (the one accredited in your IAC).
- You **MUST** use a proof format that is authorized in your IAC (e.g., JSON-LD Data Integrity / Ed25519Signature2020).
- You **MUST** publish and maintain your own **credential status list** for credentials you issue (per the access spec).

### 7.3 Issuer key rotation

- Rotate by updating your DID document.
- Notify the GA if your endpoints or supported formats change (GA will issue a new IAC).

### 7.4 Change requests

If you need to change:

- authorized schemas/types,
- issuance formats,
- OID4VCI metadata,
- issuer status list endpoints,

you **MUST** request a new IAC issuance from the GA/TRO.

---

## 8. Verifiers / Hubs: How to consume the registry

### 8.1 Environment selection (MUST)

Verifiers **MUST** decide which environment they operate in:

- **live verifiers** MUST only trust:
  - the **live** registry index URL and
  - the **live** GA verification method(s)
- **test verifiers** MUST only trust:
  - the **test** registry index URL and
  - the **test** GA verification method(s)

### 8.2 Verification algorithm (recommended baseline)

Given a business credential `C`:

1) **Fetch the registry index VC** for your environment.
2) **Verify the index proof** against the GA DID and pinned GA key for that environment.
3) Find the issuer entry where `issuerDid == C.issuer`.
4) **Fetch the referenced IAC VC**.
5) **Verify the IAC proof** against the GA DID and pinned GA key for that environment.
6) **Check GA accreditation status**:
   - Resolve `IAC.credentialStatus.statusListCredential`
   - Verify that status list VC proof (GA-signed)
   - Evaluate `statusListIndex` for revocation (revoked => reject)
7) **Enforce policy**:
   - Ensure `IAC.credentialSubject.environment` matches your environment
   - Ensure the credential type/schema/format is authorized by the IAC
   - Ensure assurance level meets your relying policy
8) **Verify the business credential**:
   - Verify its signature/proof against `C.issuer` DID document
   - Check its `credentialStatus` using the issuer’s status list (or its configured mechanism)
   - Validate schema/profile rules as required (PDTF schema + termsOfUse enforcement)

### 8.3 Caching rules

Suggested (aligning to the access spec’s “short cache” intent):

- Cache registry index VC: **ETag + TTL ≤ 5 minutes**
- Cache GA accreditation status list VC: **ETag + TTL ≤ 5 minutes**
- Cache IAC VCs: longer TTL is acceptable, but **MUST** re-check GA status list within policy TTL.

### 8.4 Failure handling (MUST)

If any of the following fail, verifiers **MUST** reject the credential for protected decisions:

- index proof invalid or cannot be fetched (within policy)
- IAC proof invalid or cannot be fetched
- IAC revoked in GA status list
- issuer not present in index for environment
- credential not authorized by IAC

---

## 9. Operational guardrails (strongly recommended)

- **Never mix environments**:
  - separate URLs
  - separate GA keys
  - separate registry indices
- **Pin GA verification methods** (do not “trust any key in did:web” without policy).
- **Avoid arbitrary remote context fetching** in production verifiers:
  - pre-load contexts used by PDTF and this trust registry profile
  - treat unknown contexts as policy failures
- **Keep all private keys out of Git** (including examples).

