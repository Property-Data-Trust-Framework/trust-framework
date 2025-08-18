# Bitstring Status Lists

This directory contains Bitstring Status List credentials for tracking the revocation status of verifiable credentials in the PDTF.

## Files

- `test-2024-revocation-list.json` - Test revocation status list for credentials issued in 2024
- `prod-2024-revocation-list.json` - Production revocation status list (when available)

## Bitstring Status List Specification

These files implement the [W3C Bitstring Status List](https://w3c-ccg.github.io/vc-bitstring-status-list/) specification for privacy-preserving credential status checking.

### Key Features

- **Privacy-preserving**: Verifiers cannot determine which specific credential they're checking
- **Efficient**: Single bit per credential status (revoked/not revoked, suspended/not suspended)
- **Scalable**: Each list can track millions of credentials
- **Compressed**: Uses gzip compression to reduce bandwidth
- **Standardized**: Based on the latest W3C specification

### Status Purpose

- **revocation**: Permanent invalidation of a credential

### Usage in Credentials

Credentials reference these status lists in their `credentialStatus` property:

```json
{
  "credentialStatus": {
    "id": "https://trust.propdata.org.uk/status/test-2024-revocation-list.json#94567",
    "type": "BitstringStatusListEntry",
    "statusPurpose": "revocation",
    "statusListIndex": "94567",
    "statusListCredential": "https://trust.propdata.org.uk/status/test-2024-revocation-list.json"
  }
}
```

### Implementation Notes

- The `encodedList` contains a gzipped bitstring where each bit represents one credential's status
- Index 0 is reserved and should not be used for actual credentials
- Lists should be rotated annually or when they approach capacity
- Each issuer may maintain their own status lists or use shared lists per the governance framework
- Status lists are themselves verifiable credentials signed by the issuer