# Property Data Trust Framework Governance

## 1. Governance Principles

- **Transparency:** All rules, schemas, and onboarding processes are publicly documented.
- **Interoperability:** Use W3C VC Data Model, DID-based identifiers, and OID4VC for interoperability.
- **Privacy by Design:** Data minimization and selective disclosure enforced.
- **Compliance:** Adherence to local property and data protection regulations (e.g., GDPR).

---

## 2. Governance Layers

### A. Business Layer

Defines **who participates** and **under what rules**.

#### Key Roles

- **Governance Authority (GA):**
  - Maintains the trust framework.
  - Defines compliance requirements.
  - Approves schemas for property data (e.g., property title, energy efficiency).
- **Accredited Issuer:**
  - Verified organizations (e.g., land registries, surveyors) allowed to issue property VCs.
  - Must pass onboarding and legal agreements.
- **Holder:**
  - Property owners, brokers, or platforms storing VCs in wallets.
- **Verifier:**
  - Real estate portals, banks, insurers, or government agencies verifying VCs before transactions.
- **Trust Registry Operator:**
  - Publishes list of approved Issuers and their DIDs.
  - Maintains active/revoked status.

#### Onboarding Policies

- **Issuer Onboarding:**
  - KYC/KYB verification of the entity.
  - Signed legal agreement.
  - DID registration in Trust Registry.
- **Verifier Onboarding:**
  - Optional accreditation for higher-assurance verification.

---

### B. Technical Layer

Defines **how trust is implemented**.

- **Identifiers:** DIDs (e.g., did:key, did:web, or did:ion).
- **Credentials:** W3C Verifiable Credentials using property schemas.
- **Proof Mechanism:** Linked Data Proofs or JSON Web Signatures.
- **Presentation Exchange:** OID4VP for verification flows.
- **Revocation:** Status List 2021 or equivalent.

---

### C. Legal Layer

Defines enforceable agreements and liability.

- **Terms of Use:**
  - GA → Issuers: Compliance obligations, liability for false data.
  - GA → Verifiers: Conditions for VC acceptance and risk allocation.
  - Issuers → Holders: Data ownership and consent.
- **Dispute Resolution:**
  - Arbitration and compliance escalation defined in governance documents.

---

## 3. Trust Registry

- **Purpose:** Provides verifiers with authoritative list of accredited issuers.
- **Format:** Public JSON-LD document containing:
  - Issuer DID
  - Organization legal name
  - Status (active/revoked)
  - Credential types authorized
- **Mechanism:** Signed by Governance Authority for authenticity.

---

## 4. Credential Schema Governance

- **Schema Approval Process:**
  - GA defines review board for schema proposals.
  - Open consultation for new property-related schemas.
- **Example Schemas:**
  - `PropertyTitleCredential`
  - `EnergyPerformanceCredential`
  - `ValuationReportCredential`

---

## 5. Assurance Levels

- **AL1:** Self-asserted data (low trust, no issuer accreditation).
- **AL2:** Issued by accredited property professionals (medium trust).
- **AL2:** Issued by trusted proxy on behalf of an offical primary authority (medium trust).
- **AL4:** Issued by official primary authority (high trust, legal validity).

---

## Next Steps

### **1. Create Visual Diagram**

- **Goal:** Show the interaction between GA, Issuers, Holders, Verifiers, and Trust Registry.
- **Deliverable:** SVG/PNG diagram for documentation and presentations.
- **Owner:** [Assign team member]

### **2. Draft Governance Document Template**

- **Goal:** A JSON-LD or YAML template for describing the governance policies in machine-readable format.
- **Includes:** Roles, onboarding rules, trust registry URL, schema references.
- **Owner:** [Assign team member]

### **3. Develop Terms of Use & Onboarding Policies**

- **Goal:** Draft legal text for:
  - Issuer onboarding requirements
  - Verifier conditions
  - Liability and compliance
- **Owner:** [Assign team member]

### **4. Build Trust Registry Prototype**

- **Goal:** Implement a public registry (API + signed JSON-LD document) listing accredited issuers.
- **Owner:** [Assign team member]

### **5. Define Credential Schemas**

- **Goal:** Create JSON-LD schemas for:
  - TransactionCredential
  - PropertyCredential
  - ParticipantCredential
  - TitleCredential
- **Owner:** [Assign team member]

### **6. Decide on DID Method**

- **Goal:** Choose DID method (did:web, did:ion, etc.) for governance authority and issuers.
- **Owner:** [Assign team member]

### **7. Revocation & Status Mechanism**

- **Goal:** Implement Status List 2021 or alternative for credential revocation.
- **Owner:** [Assign team member]

---

## References

- [W3C VC Data Model](https://www.w3.org/TR/vc-data-model/)
- [Trust over IP Foundation](https://trustoverip.org/)
- [EBSI Trust Framework](https://ec.europa.eu/digital-strategy/our-policies/european-blockchain-services-infrastructure_en)
- [OpenID for Verifiable Credentials](https://openid.net/specs/openid-4-verifiable-presentations-1_0.html)
