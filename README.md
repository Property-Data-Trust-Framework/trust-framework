# Property Data Trust Framework

This repository serves as the central source for the **Property Data Trust Framework (PDTF)**, providing:

- **Specification Documents**: Technical standards and protocols for property data exchange
- **Implementation Guides**: Step-by-step guides for participants and developers
- **Verifiable Data Registry**: Registry for property transaction credentials based on [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- **Utilities & Example Code**: Reference implementations and tools for framework participants

## 📋 Key Components

### 1. Specifications & Documentation

- Framework specifications defining data standards and protocols
- Governance documentation for trust framework operations
- Implementation and usage guides for participants

### 2. Verifiable Data Registry

- Uses **`did:web`** for interoperability
- Stores registry content (schemas, credential status, issuers) in **Git** for auditability
- Deployed as a static site using **GitHub Pages** and **GitHub Actions**

### 3. Tools & Utilities

- Example code for credential issuance and verification
- Reference implementations for common use cases
- Testing utilities for framework compliance

---

## 🔍 Why This Registry?

Property transactions involve multiple parties and require verifiable data such as:

- Transaction information
- Property data
- Participant / Person credentials
- Property Title/Ownership information

This registry serves as a **trusted source of truth** for:

- Credential Schemas
- Credential Status (valid/revoked)
- Trusted Issuer metadata
- Terms of issuance

---

## ✅ Features

- **did:web Identifier**
  ```
  did:web:registry.moverly.com
  ```
- **Immutable & Auditable**
  - All updates tracked in Git
  - Commit history provides transparent version control
- **Publicly Verifiable**
  - Anyone can verify registry contents via HTTPS and Git commits

---

## 📂 Directory Structure

```
.
├── docs/                      # Specifications and guides (source)
│   ├── governance.md          # Trust framework governance
│   ├── *.md                   # Implementation guides & specs
├── public/                    # Static site content & registry
│   ├── .well-known/
│   │   └── did.json          # DID document
│   ├── schemas/              # Credential schemas
│   │   └── epc-certificate.jsonld
│   ├── status/               # Bitstring revocation lists
│   │   └── test-2024-revocation-list.json
│   ├── trusted-issuers-registry.json    # Trusted issuer registry
│   └── web/                  # Auto-generated HTML documentation
│       ├── index.html        # Documentation home page
│       ├── governance.html   # HTML version of docs
│       └── *.html            # Other documentation pages
├── examples/                  # Example code and utilities
└── .github/workflows/         # CI/CD workflows
    └── build-docs.yml        # Auto-builds HTML from markdown
```

---

## 📦 NPM Package

### Installation

```bash
npm install @pdtf/trust-framework
```

### Usage

```javascript
const { validateCredential } = require("@pdtf/trust-framework");

// Validate a credential against a schema
const result = await validateCredential(credential, "epc-certificate");

if (result.valid) {
  console.log("Credential is valid");
} else {
  console.log("Validation errors:", result.errors);
}
```

### Exports

- **validateCredential** - Validates credentials against PDTF schemas
- **PDTF_REGISTRY_URL** - The trust framework registry URL
- **PDTF_DID** - The trust framework DID identifier

---

## 🧠 Getting Started

### For Framework Participants

1. Review the governance documentation in `/docs/governance.md`
2. Follow the implementation guides for your use case
3. Use the example code to integrate with your systems

### For Developers

1. Explore the specification documents in `/docs/`
2. Check example implementations in `/examples/`
3. Test your integration using the provided utilities

### For Contributors

1. Read the contribution guidelines
2. Submit issues for bugs or feature requests
3. Create pull requests for improvements

---

## 📚 Resources

- [Development Plan](docs/plan.md) - Comprehensive roadmap for building the trust framework
- [W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model/)
- [DID Web Specification](https://w3c-ccg.github.io/did-method-web/)
- [Property Data Trust Framework Documentation](/docs/)
