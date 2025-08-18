# Draft: PDTF Participant DID Auth OAuth 2 Specification

## 1\. Overview

This specification describes a secure, decentralized authentication and authorization protocol for machine-to-machine (M2M) clients using Decentralized Identifiers (DIDs) and OAuth 2.0. The protocol scopes access tokens to specific transactions, allowing access control based on the role of the DID in a property transaction using the Property Data Trust Framework (PDTF).

## 2\. Use Case

A client in the PDTF ecosystem needs to access APIs related to a specific property transaction. The client holds a DID and proves control over it using DID Auth (challenge-response). The Authorization Server issues an access token scoped to the transaction, including the client's role (e.g., buyer, seller, solicitor).

## 3\. Protocol Components

- **Client**: A backend system that holds a DID and its associated private key.  
- **Authorization Server (AS)**: Issues challenges, verifies DID proofs, and issues access tokens.  
- **Resource Server (RS)**: Hosts protected APIs related to property transactions.

## 4\. Protocol Flow

### Step-by-Step

1. **Challenge Request**  
     
   - Endpoint: `POST /oauth/did/challenge`  
   - Request:

```javascript
{
  "client_did": "did:example:client1"
}
```

2. **Challenge Response**  
     
   - The AS generates and stores:  
     - `challenge` (nonce)  
     - `request_id`  
     - `expires_at`  
   - Response:

```javascript
{
  "challenge": "nonce-abc-123",
  "request_id": "req-789",
  "expires_at": "2025-03-26T12:00:00Z"
}
```

3. **Client Signs Challenge**  
     
   - The client signs the challenge using its private key.  
   - Payload:

```javascript
{
  "request_id": "req-789",
  "client_did": "did:example:client1",
  "proof": {
    "type": "Ed25519Signature2020",
    "created": "2025-03-26T11:58:00Z",
    "challenge": "nonce-abc-123",
    "proofPurpose": "authentication",
    "verificationMethod": "did:example:client1#key-1",
    "signature": "base64(signature)"
  }
}
```

4. **Token Issuance**  
     
   - The AS verifies:  
     - Challenge is valid, unexpired, and unused  
     - DID Document resolution and signature validity  
     - Client's role and transaction involvement  
   - Access token is issued (JWT):

```javascript
{
  "access_token": "eyJhbGciOi...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

## 5\. Decoded JWT Access Token Structure

```javascript
{
  "sub": "did:example:client1",
  "txn_id": "tx-456789",
  "role": "buyer",
  "iss": "https://auth.example.com",
  "aud": "https://api.example.com",
  "exp": 1711470600
}
```

## 6\. Authorization Logic (on Resource Server)

- Validate token signature and expiration  
- Extract `txn_id` and `role`  
- Match request context (e.g., route parameter `txn_id`) to token  
- Enforce access based on role

Example Pseudocode:

```javascript
if (token.txn_id !== request.txn_id) {
  return res.status(403).send("Invalid transaction context");
}

if (token.role === "buyer") {
  allow();
} else if (token.role === "seller") {
  allow();
} else {
  return res.status(403).send("Not permitted for role");
}
```

## 7\. Challenge Store

The AS temporarily stores challenge records:

| request\_id | nonce | client\_did | expires\_at | used |
| :---- | :---- | :---- | :---- | :---- |
| req-789 | nonce-abc-123 | did:example:client1 | 2025-03-26T12:00:00Z | false |

## 8\. Security Considerations

- Use short-lived challenges and tokens  
- Invalidate used challenges  
- Ensure DID Document resolution is secure and up-to-date  
- Optionally bind tokens to proof-of-possession keys (DPoP)

## 9\. Diagram

```
Client                         Authorization Server
  |                                     |
  | --(1) Request Challenge (DID)------>|
  |                                     |
  |<--(2) Challenge + Request ID--------|
  |                                     |
  | --(3) Signed Proof + Request ID--->|
  |                                     |
  |  [Verify Signature & Challenge]     |
  |  [Issue Transaction-Scoped Token]   |
  |<------------(4) Access Token--------|
  |                                     |
  |-- Use token to access txn APIs --> Resource Server
```

---

This specification provides a complete end-to-end flow for DID-based M2M authentication, with transaction-scoped authorization built into the access token itself, based entirely on role-based access control.  
