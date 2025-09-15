# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is the Property Data Trust Framework (PDTF) - a central repository providing specifications, verifiable data registry, and tools for property data exchange using W3C Verifiable Credentials.

## Key Development Commands

```bash
# Build HTML documentation from markdown
npm run build-docs
# or directly: ./examples/build-docs-local.sh

# TypeScript type checking
npm run typecheck

# Currently no tests or linting configured
```

## Repository Architecture

### Core Components

1. **NPM Package** (`@pdtf/trust-framework`)
   - Entry: `index.js` exports `validateCredential()` function (TODO: implementation)
   - TypeScript definitions in `index.d.ts`
   - Published to npm with scoped package name

2. **Verifiable Data Registry** (`/public/`)
   - `.well-known/did.json` - DID document for `did:web:trust.propdata.org.uk`
   - `test/` - Example schemas, issuers, and status lists
   - `live/` - Production registry data (currently empty)
   - `web/` - Auto-generated HTML documentation

3. **Documentation** (`/docs/`)
   - Governance policies, framework specifications, OAuth specs
   - Configured for Mintlify publishing via `docs.json`

### Deployment Pipeline

**Documentation:** Mintlify hosting (configured via `docs.json`)
**Registry:** GitHub Actions workflow deploys `/public/` directory to GitHub Pages

**Custom Domain:** `trust.propdata.org.uk` (configured in `/public/CNAME`)

### Key URLs When Deployed
- Registry: `https://trust.propdata.org.uk/`
- DID Document: `https://trust.propdata.org.uk/.well-known/did.json`
- Documentation: Mintlify hosted (see `docs.json` configuration)
- Schemas: `https://trust.propdata.org.uk/schemas/[schema-id]`

## Important Context

- Repository recently transformed from another project (removed TrustBench dependencies)
- Currently on branch `6-remove-dependencies-and-references-to-trustbench`
- Main validation function (`validateCredential`) needs implementation
- No tests or linting configured yet

## Registry Data Structure

The verifiable data registry follows this pattern:
- Schemas in JSON-LD format define credential structures
- Issuer metadata provides trust information
- Status lists track credential revocation
- All data is version-controlled in Git for auditability