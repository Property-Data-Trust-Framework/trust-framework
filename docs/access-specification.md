Property Data Trust Framework (PDTF)

Transaction DID + REST Access Specification (Draft v0.1)

Status: Draft for internal review
Editors: PDTF team
Intended audience: Architects, implementers of hubs (AS/RS), wallet vendors, issuer integrators

⸻

1. Purpose & Scope

This specification describes how residential property transaction data is protected and exchanged across multiple hubs using:
• A Transaction DID as the root of discovery and governance for a single transaction.
• The Transaction DID Document to declare authoritative hubs.
• OID4VP as the authorization grant to obtain OAuth 2.0 access tokens.
• RESTful endpoints as the resource interface for reading and writing Verifiable Credentials (VCs) and related artifacts.
• Issuer status lists for revocation and lifecycle, without a central anchor/registration VC.

Out of scope: wallet UX, notarization of non-VC artifacts, off-ledger settlement. Informative guidance is included where useful.

⸻

2. Terminology

MUST/SHOULD/MAY are to be interpreted as in RFC 2119.
Transaction: a residential property transaction (buy/sell/mortgage) with a unique DID.
Hub: a system that exposes an Authorization Server (AS) and a Resource Server (RS) for a transaction.
Issuer: a trusted party that issues VCs (e.g., conveyancer, land registry, surveyor, lender).
Participant VC: a VC asserting that a subject plays a role in a specific transaction.
Trust Registry: authoritative list of ecosystem issuer DIDs and metadata.
Status List: revocation/status mechanism for credentials (e.g., StatusList2021 or SD‑JWT Status).

⸻

3. Architecture Overview
   1. Each transaction is identified by a Transaction DID (e.g., did:web:pdtf.example/tx/12345 or did:ion:...).
   2. The DID Document names:
      • Authoritative Hubs (AS/RS base URLs, audiences, metadata)
   3. Holders obtain Participant VCs from issuers and present them via OID4VP to a hub's AS.
   4. The AS verifies the presentation, the issuer status against the Trust Registry, and applies dynamic authorization rules based on each VC's termsOfUse, then issues a short‑lived, DPoP‑bound OAuth access token.
   5. Clients call RESTful endpoints on the RS with that token to GET or POST domain VCs and artifacts.

⸻

4. Transaction DID and DID Document

4.1 Requirements
• A transaction MUST have a unique DID (the Transaction DID).
• The DID controller(s) MUST be the transaction coordinator/owner(s) under governance policy.
• The DID Document MUST publish:
• One or more Hub Service entries for the authoritative hubs.
• DID Document SHOULD be versioned (method support or external signed changelog).
• Verifiers MUST re-resolve the DID Doc at token issuance time (or use fresh cache with ETag/TTL ≤ 5 minutes).

4.2 Service Types

#### 4.2.1 PDTFHubAuthorizationService

```json
{
  "id": "#hub-as-1",
  "type": "PDTFHubAuthorizationService",
  "serviceEndpoint": {
    "issuer": "https://hub-a.example/",
    "authorization_endpoint": "https://hub-a.example/oidc/authorize",
    "token_endpoint": "https://hub-a.example/oidc/token",
    "jwks_uri": "https://hub-a.example/oidc/jwks.json",
    "introspection_endpoint": "https://hub-a.example/oidc/introspect",
    "RAR_types": ["pdtf:transaction"],
    "aud": "https://hub-a.example/api"
  }
}
```

#### 4.2.2 PDTFHubResourceService

```json
{
  "id": "#hub-rs-1",
  "type": "PDTFHubResourceService",
  "serviceEndpoint": {
    "api_base": "https://hub-a.example/api",
    "version": "v1",
    "capabilities": [
      "GET /transactions/{txDid}/vcs",
      "POST /transactions/{txDid}/vcs",
      "GET /artifacts/{hash}"
    ]
  }
}
```


4.3 DID Methods
• Any DID method MAY be used if it supports timely document updates and widespread resolution.
• For did:web, controllers SHOULD publish a signed change log URL in a PDTFChangeLog service for auditability.

⸻

5. Credential Profiles

5.1 Formats
• Hubs and issuers MUST support VC Data Model + JSON-LD with Linked Data Proofs using Ed25519.

5.2 Participant VC (normative, minimal)

Purpose: assert a subject’s role in a specific transaction.

Constraints:
• credentialSubject.txDid MUST equal the Transaction DID.
• issuer MUST be present in the Trust Registry.
• credentialStatus MUST reference an issuer‑hosted status list.

**Example (JSON-LD with Linked Data Proof):**

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1", 
    "https://trust.propdata.org.uk/contexts/pdtf-v2.jsonld"
  ],
  "type": ["VerifiableCredential", "ParticipantVC"],
  "issuer": "did:web:conveyancer.example",
  "validFrom": "2025-08-20T11:32:00Z",
  "credentialSubject": {
    "id": "did:pairwise:buyer#tx-12345",
    "txDid": "did:web:pdtf.example/tx/12345",
    "role": "buyer"
  },
  "credentialStatus": {
    "type": "StatusList2021Entry",
    "statusPurpose": "revocation",
    "statusListIndex": "1024",
    "statusListCredential": "https://conveyancer.example/status/participants/sl2021.json"
  },
  "proof": {
    "type": "Ed25519Signature2020", 
    "created": "2025-08-20T11:32:05Z",
    "proofPurpose": "assertionMethod",
    "verificationMethod": "did:web:conveyancer.example#key-1",
    "jws": "eyJhbGciOi..."
  }
}
```


⸻

6. Authorization Model

6.1 Overview
• OAuth 2.0 is used for API access.
• The authorization grant is OID4VP (presentation of required VCs).
• Tokens are DPoP‑bound and short‑lived.

6.2 Presentation Definition (PEX)

The AS MUST publish or embed a presentation_definition requiring a valid Participant VC for the requested txDid:

```json
{
  "id": "pdtf-participant",
  "input_descriptors": [
    {
      "id": "participant-vc",
      "constraints": {
        "fields": [
          {
            "path": ["$.type[*]"], 
            "filter": {
              "type": "string", 
              "pattern": "^ParticipantVC$"
            }
          },
          {
            "path": ["$.credentialSubject.txDid"], 
            "filter": {
              "const": "did:web:pdtf.example/tx/12345"
            }
          }
        ]
      }
    }
  ]
}
```

The AS MUST verify that the VC's issuer appears in the ecosystem Trust Registry, and that status is good.

#### 6.2.1 Dynamic Access Control

Access to VCs is determined by their `termsOfUse.confidentialityLevel`:

• **`Public`**: No authentication required - any client can access  
• **`Restricted`**: Requires a valid Participant VC for the transaction (any role)  
• **`Confidential`**: Requires specific role-based Participant VC or specific participant DID as defined in the VC's `termsOfUse.requiredCredentials`

The AS MUST evaluate each VC's termsOfUse independently when filtering responses.

6.3 Rich Authorization Requests (RAR)

Clients SHOULD request fine‑grained scopes via authorization_details:

```json
{
  "authorization_details": [
    {
      "type": "pdtf:transaction",
      "txDid": "did:web:pdtf.example/tx/12345",
      "permissions": [
        "read:vc:domain/title",
        "read:vc:domain/local-searches",
        "post:vc:domain/surveys"
      ]
    }
  ]
}
```

The AS maps satisfied VPs to permitted permissions and encodes them as OAuth scopes/claims.

6.4 Token Requirements
• Access tokens MUST be bound to a DPoP key (cnf/jkt).
• aud MUST equal the RS base URL published in PDTFHubResourceService.
• Lifetimes: access token ≤ 10 min; refresh token ≤ 1 hour (policy‑dependent).
• RS MUST validate DPoP, signature, issuer, audience, expiry, and required scopes.

6.5 Step‑up & Re‑auth

For sensitive operations, the RS MAY return 401 with an authorization challenge directing the client to re‑run OID4VP (e.g., require specific role-based Participant VC).

⸻

7. RESTful Resource API (RS)

7.1 Common
• Base URL from PDTFHubResourceService.serviceEndpoint.api_base.
• All requests MUST use TLS and include Authorization: Bearer <token> and a valid DPoP proof.
• Responses SHOULD include Cache-Control appropriate to content and ETags for artifact bodies.

7.2 Endpoints (normative)

7.2.1 List/Query VCs

GET /transactions/{txDid}/vcs

Query params (optional):
• type — VC type (e.g., domain/title, SurveyReportVC)
• latest — true|false (default true)
• issuer — filter by issuer DID
• since — ISO8601 timestamp filter

Responses:
• 200 OK — JSON array of VCs (base64url encoded JWS or JSON‑LD objects), or VC summaries, filtered based on each VC's termsOfUse confidentialityLevel.
• 401/403 — auth errors.
• 404 — transaction unknown to this hub.

**Example:**

```http
GET /api/transactions/did:web:pdtf.example:tx:12345/vcs?type=domain/title&latest=true
Authorization: Bearer eyJhbGciOi...
DPoP: eyJhbGciOi...
```

7.2.2 Submit a VC

POST /transactions/{txDid}/vcs

Body: a VC the client proposes to add to the transaction repository.
Requirements: RS MUST validate schema, signature, issuer trust, status, and that the caller’s token scope permits posting that VC type.
Responses: 201 Created with Location of the stored VC; or 400/403/422 with error details.

7.2.3 Retrieve an Artifact

GET /artifacts/{hash} — returns a binary artifact (e.g., PDF) referenced by a VC.
The RS MUST enforce token scopes for the parent VC domain.

7.3 Errors

Errors follow RFC 7807 (application/problem+json) and include error, error_description, and txDid when applicable.

⸻

8. Verification Logic (AS & RS)
   1. Resolve Transaction DID; cache with ETag/TTL ≤ 5 min.
   2. Validate hub audience: the AS/RS URL MUST appear in a PDTFHubAuthorizationService/PDTFHubResourceService entry.
   3. Verify Trust Registry: each issuer DID MUST appear in the Trust Registry and meet profile requirements.
   4. Verify VPs/VCs: proof, expiry, credentialStatus (fetch status list; cache with ETag), schema.
   5. Verify Participant VC: ensure txDid matches, role is valid, and issuer is authorized.
   6. Apply dynamic access control: for each VC, evaluate termsOfUse.confidentialityLevel against the presented Participant VC:
      • Public: include in response
      • Restricted: include only if valid Participant VC presented for the transaction
      • Confidential: include only if Participant VC role/DID matches requirements in termsOfUse.requiredCredentials
   7. Map Participant VC role to permitted scopes via RAR authorization_details.
   8. Emit/validate DPoP-bound tokens as per §6.

⸻

9. Trust Registry
   • Publishes issuer DID metadata: DID, supported VC formats, status list endpoints, OID4VCI metadata, and policy flags (e.g., allowed schemas).
   • Distribution options: static signed JSON, OpenID Federation, or equivalent.
   • AS/RS MUST reject issuers not present or not current in the registry.

⸻

10. Lifecycle & Revocation
    • Issuers maintain status lists for their VCs; revocation is signaled by flipping the relevant bit or status entry.
    • Hubs MUST check status at authorization time and MAY use introspection to proactively deny tokens after revocation.
    • Transaction DID Document updates (e.g., changing hubs) take effect as soon as resolvers refresh (≤ 5 min cache).

⸻

11. Privacy Considerations
    • Subjects use pairwise DIDs per transaction in Participant VCs.
    • DID Document lists hubs only; never list participants.
    • VCs should minimize exposed claims by design - include only necessary data in credentialSubject.
    • Log only VP hashes and presentation_submission; avoid storing raw VPs.

⸻

12. Security Considerations
    • Enforce TLS 1.2+; pin hostnames from DID Doc service endpoints.
    • DPoP to bind tokens to the client key; rotate keys per session where feasible.
    • Include nonce and aud in OID4VP requests; reject replayed VPs.
    • Time synchronization across hubs/issuers (NTP).
    • Key rotation and DID Document updates MUST be atomic and auditable.

⸻

13. Inter‑Hub Operation
    • Any hub MAY act as AS/RS for a transaction if listed in the Transaction DID Doc.
    • A hub's AS MUST accept Participant VCs issued by any issuer in the Trust Registry (not just itself), subject to Trust Registry and status checks.
    • Tokens are audience‑scoped to the target hub’s RS.

⸻

14. Example Flows

14.1 Onboard Participant 1. Issuer (already in Trust Registry) issues a Participant VC (status OK). 2. Holder stores VC in wallet.

14.2 Access Data (Read) 1. Client → AS /authorize with authorization_details and PEX. 2. Wallet returns VP containing Participant VC. 3. AS verifies Trust Registry + status; issues DPoP‑bound token. 4. Client calls GET /transactions/{txDid}/vcs?type=domain/title on RS. 5. RS validates token/scopes; returns VCs filtered by termsOfUse confidentialityLevel.

14.3 Post New VC (Write) 1. Client obtains scope post:vc:domain/surveys. 2. POST /transactions/{txDid}/vcs with the signed SurveyReportVC. 3. RS validates and persists; 201 Created returned.

14.4 Revoke Participant 1. Issuer flips status for the Participant VC. 2. AS refuses new tokens for that subject/txDid; RS denies upon token expiry or via introspection.

⸻

15. Implementation Profile (Informative)
    • Proof suites: Ed25519Signature2020 (MUST) for JSON-LD Linked Data Proofs.
    • DPoP: RFC 9449 compliant; max clock skew 60s.
    • Token lifetimes: 10 min access, 60 min refresh (typical).
    • Caching: DID Doc and status lists cached with ETag; maximum age 5 min.

⸻

16. Error Codes (Examples)
    • PDTF-TRUST-001 Issuer not in Trust Registry.
    • PDTF-TXDID-002 Hub not authorized in Transaction DID.
    • PDTF-VC-003 VC schema/type invalid for endpoint.
    • PDTF-STATUS-004 VC revoked/unknown status.
    • PDTF-SCOPE-005 Insufficient scope for operation.

⸻

17. JSON Schemas (Informative excerpts)
    • ParticipantVC minimal schema: { credentialSubject: { txDid: string, role: enum }, issuer: DID, credentialStatus: {...} }

⸻

18. Versioning & Governance
    • This spec version is carried in RS /.well-known/pdtf metadata and MUST be compatible across hubs within a major version.
    • Transaction DID updates SHOULD be recorded in a signed change log for audit.

⸻

## 19. Appendix: Sample Authorization Request (OIDC)

```http
GET /oidc/authorize?response_type=code&client_id=abc&redirect_uri=https%3A%2F%2Fclient.example%2Fcb&scope=openid&authorization_details=%5B...%5D&presentation_definition=%7B...%7D&nonce=N&state=S
```

**AS verifies:**
• Presentation (OID4VP) → Participant VC valid for txDid and issuer authorized.
• Maps Participant VC role to permitted scopes.
• Issues DPoP‑bound token with aud = RS base.

⸻

## 20. Appendix: Sample RS Response

```json
{
  "items": [
    {
      "type": ["VerifiableCredential", "TitleCredential"],
      "issuer": "did:web:landregistry.example",
      "validFrom": "2025-08-19T09:12:00Z",
      "credentialSubject": {
        "titleNumber": "AB123456", 
        "propertyAddress": "…"
      },
      "proof": {
        "type": "Ed25519Signature2020", 
        "created": "2025-08-19T09:12:01Z", 
        "proofPurpose": "assertionMethod", 
        "verificationMethod": "did:web:landregistry.example#key-1", 
        "jws": "eyJhbGciOi..."
      }
    }
  ],
  "txDid": "did:web:pdtf.example/tx/12345",
  "version": "v1"
}
```

⸻

21. Open Questions (for review)
    • Do we require multi‑sig control on Transaction DID changes?
    • Minimum wallet profile for OID4VP/SD‑JWT support?
    • Standardize permissions vocabulary beyond examples?
    • Should RS support signed receipt acknowledgements for POSTed VCs?

⸻
