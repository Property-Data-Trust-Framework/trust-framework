# Property Data Trust Framework 2 Specification

v0.3 Jul 2025

[**Introduction	2**](#introduction)

[**Core Technologies	3**](#core-technologies)

[**Entities	5**](#entities)

[**PDTF Verifiable Credentials	7**](#pdtf-verifiable-credentials)

[**Trust Model	9**](#trust-model)

[**Security Model	10**](#security-model)

[**Interoperability	11**](#interoperability)

[**Implementation	13**](#implementation)

[**Examples	14**](#examples)

# 

# 

# Introduction {#introduction}

This specification sets out the requirements for Property Data Trust Framework (PDTF) participants to generate, exchange and verify property-related information in a secure and trusted manner.

The current focus of the PDTF is to support residential property transactions in the UK, specifically to reduce friction in the conveyancing and lending processes, which are characterised by significant re-keying of data and duplicated collection.

It is however envisaged that it will evolve to cover the full lifecycle of property and to extend to commercial property as well.

This version of the framework is an evolution of v1.0, which is already in production use across a range of industry participants, and reflects the lessons learned over the last two years of deployments. Although the existing single data schema will be split up into its component parts to model each of the entities described below, the intention is that the data will remain largely backwards-compatible with v1.0, only the provenance wrapper and exchange mechanisms being significantly different.

This  spec builds on a range of existing technologies including

* [W3C Verifiable Credentials Data Model v2.0](https://www.w3.org/TR/vc-data-model-2.0/)

* [W3C Decentralized Identifiers (DIDs) v1.0](https://www.w3.org/TR/did-1.0/)

* [W3C JSON-LD v1.1](https://www.w3.org/TR/json-ld/)

* [W3C Verifiable Credential Data Integrity v1.0](https://www.w3.org/TR/vc-data-integrity/)

* [W3C Bitstring Status List v1.1](https://w3c.github.io/vc-bitstring-status-list/)

* Draft [did:key](https://w3c-ccg.github.io/did-key-spec/) and [did:web](https://w3c-ccg.github.io/did-method-web/) DID Method Specifications

* [Bitstring Status List](https://www.w3.org/TR/vc-bitstring-status-list/)

Our intention around the use of these existing standards is to ensure resources and tools are available for a range of implementations and to only invent new mechanisms where necessary to meet the requirements of our property and identity data use cases. 

This spec should be read alongside those listed above, which contain the underlying detail to fully implement a PDTF-compliant system.

# 

# 

# Core Technologies {#core-technologies}

## **Verifiable Credentials**

The PDTF v2.0 uses the W3C Verifiable Credentials (VC) model to encapsulate all claims made about these entities (or relationships between them) along with human-readable evidence to support those claims, digital signatures to allow machine verification of the source of the claims and terms of use which allow access to be restricted to certain participant roles.

PDTF VCs use JSON-LD serialization to support a simpler, more human-readable syntax and to lower implementation barriers.

## **Uniform Resource Names**

In most cases we use PDTF-namespaced Uniform Resource Name schemes that are also natural identifiers for Property (of the form **urn:pdtf:uprn:12343556**) or Titles (of the form **urn:pdtf:title:XX1234**). 

However in the case of e.g. new build properties (where UPRNs may not have been allocated) or Unregistered land (which has not been allocated a title number) we can use synthetic identifiers **urn:pdtf:property:ABCDE123456** or **urn:pdtf:unregisteredTitle:89034ABCDE** where in each case a base58-encoded UUID is used.

Or possibly **urn:pdtf:property:7N22wRSnPuVwqsPkyFzY2r** or **urn:pdtf:propertyWithUprn:12342**

And **urn:pdtf:title:7N22wRSnPuVwqsPkyFzY2r** or **urn:pdtf:titleWithNumber:XX213**

## **Decentralized Identifiers**

All participant subjects are identified using DIDs, generated and controlled by the PDTF-compliant platform through which they are accessing the property data and associated with the user accounts on that platform. So for example a conveyancer would login to an account in their PDTF-compliant Case Management System (CMS) and that system would generate for them a DID which can be associated with the transaction as a participant.

A key benefit of this model is that identity verification performed on an individual and associated with their participant DID strongly binds the DID to that real-world identity and allows us to robustly underpin the assertions a participant makes. In practice this is likely to apply initially only to Sellers and Buyers, but the ability to bind real-world identity (and qualifications) to Conveyancers, Estate Agents etc can further enhance the robustness of the transaction.

In the future we expect to support Verifiable Legal Entity Identifiers (vLEIs) to allow organisations and their employees to assert their identities.

We also use DIDs for Transactions which allow us to verify the nexus of the transaction data (where it is being aggregated) and to support the specification of service endpoints to access it.

Importantly, the Trust Framework repository itself embeds a set of DIDs that form the roots of trust for the ecosystem. These will comprise DIDs for primary sources of data (such as, in the future, HMLR) and also trustied proxies that can be relied on to connect to non-compliant sources of data and accurately issue them as VCs into the ecosystem.

In this way all VCs can be signed and verified as having been issued by either a trusted primary source, a trusted proxy or an individual or organization which in turn can prove its real-world identity.

In practice, PDTF DIDs will normally use the **did:key** method (for simple participant DIDs) or **did:web** method (for more flexible participant DIDs or for transactions, which need to describe service endpoints). However implementers should support universal DID resolution to ensure other methods are handled.

# 

# Entities {#entities}

The PDTF incorporates a number of Entity models whose relationships connect all of the relevant aspects of the transaction.

![][image1]

## **Person**

A natural person who is a participant in the transaction, who might be a Seller, Buyer, Estate Agent, Seller’s Conveyancer etc. A Person’s attributes would include their name, date of birth, residential address, email etc, and also, in respect of a Seller, the capacity in which they are selling the property (as a Legal Owner, on behalf of a deceased person etc).

All persons in the transaction participate via user accounts generated for PDTF-compliant software that act on their behalf and manage their identifiers.

The PDTF identifier for a Person is a Decentralized Identifier (DID) as described below, using for example **did:key** or **did:web** methods depending on the platform hosting their account, for example:

did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH

## **Organisation**

An organisation who is a participant in the transaction, with any of the roles and capacities in which a Person might act. Like persons, organisations participate via user accounts (which might have multiple users per organisation) managed by PDTF-compliant software systems.

Like Person identifiers, Organisation identifiers are DIDs generated and managed by the platform that provides them access to the transaction.

## **Property**

The property being transacted, against which we wish to record relevant attributes such as its address, Energy Performance Certificate rating, Council Tax band etc. 

Property identifiers are URNs of the form 

urn:pdtf:uprn:365456

## **Title**

A verifiable ownership of a property by one or more Legal Owners (Persons or Organisations) whether or not registered at HM Land Registry. Multiple titles may be transferred during a single transaction.

All titles are related to HMLR Title Numbers, and are of the form:

urn:pdtf:title:XX123

## **Transaction**

A Transaction represents an “intent to sell” a property (transferring one or more titles) at a given price. Relationships between the transaction and other entities forms the PDTF Graph modelling the sale and purchase of the property:

* Transaction-\>Person relationships identify the participants  
* Transaction-\>Property relationships identify the property that is for sale according to the Seller’s intent.  
* Transaction-\>Title relationships identify those Titles which are to be transferred on sale, according to the Seller’s intent

Transaction identifiers are of the form:

urn:pdtf:transaction:BsGLeLrkFdtKaMA2DphXVX

\[Alternatively\]Transaction identifiers must be DIDs that are resolvable to a DID document that defines a service endpoint for a service of type **pdtfService** and with a **serviceEndpoint** property that points to the API endpoint for making standard API calls. For example this DID

did:web:movetopia.com:transactions:BsGLeLrkFdtKaMA2DphXVX

Which resolves to a DID document at

https://movetopia.com/transactions/BsGLeLrkFdtKaMA2DphXVX/.well-known/did.json

Contains the following fragment:

“service”: \[  
		{  
		“id”: “did:web:movetopia.com:transactions:BsGLeLrkFdtKaMA2DphXVX\#pdtService”  
		“type”: “PdtfService”,  
		“serviceEndpoint”: “https://api.movetopia.com/transactions/BsGLeLrkFdtKaMA2DphXVX  
		}  
	\]

A system who is aware of this transaction DID can then identify where to make API calls to retrieve VCs.

The ‘relationship graph’ formed by the connections between these entities allows us to model the entirety of the process.

# 

# PDTF Verifiable Credentials {#pdtf-verifiable-credentials}

PDTF VCs use the following features to support our security and interoperability requirements

* The PDTF VC **context** defines the entity schemas and policies referenced in VCs  
* The **id** property is supplied as a URL to an accessible representation of the VC (subject to authorization controls)  
* The **type** property is supplied as VerifiableCredential plus a PDTF-specific type that defines the entity type being represented (PersonCredential, OrganizationCredential, TitleCredential, PropertyCredential, TransactionCredential).  
* The **issuer** property must contain the DID of the data source (trusted primary source, trusted proxy or participant.  
* The **validFrom** property which represents the date and time that the data was originally collected (not necessarily the credential issuance date).  
* An optional **validUntil** property which contains a natural expiry date for the claims. This is intended to model the real-world expiry of claims such as Energy Performance Certificates for example, rather than conventions around when data such as Searches are considered to be ‘acceptable’.  
* A **credentialSubject** property which contains an id property representing the subject of the claims, together with either  
  * Patch paths: One or more key-value pairs representing path:value claims where the path is relative to the root of the relevant schema and which is normally used for deeply-nested Property attributes. The value object must be valid against the subschema at the supplied path and is intended to replace any existing data in a previously aggregated state at that path.  
  * Merge object: An object which is a valid JSON representation of the claim data in accordance with the top-level entity schema and should be merged with data in a previously aggregated state.  
* VCs containing multiple **credentialSubject**s expressed as an array are supported, but where the sources, permissions or evidence of attributes varies, multiple credentials should be issued..  
* A **credentialSchema** property that references the PDTF schema to validate against.  
* A **proof** property that represents an embedded proof (digital signature) in accordance with the VC Data Integrity spec, of **type** **DataIntegrityProof** and **proofPurpose** of **assertionMethod**.  
* A **termsOfUse** property that encapsulates access permissions for the VC and which is described in more detail below.  
* An **evidence** property containing an array of evidence objects, as described below.

## **Evidence**

While ideally relying parties should accept the embedded proofs supplied as sufficient evidence for the validity of the claims, in practice most parties will also need to be able to manually review underlying evidence, if only for audit purposes.

The PDTF supports Hyperlink and Vouch evidence, where:

* Hyperlinks should point to a network-accessible copy of the evidence, which may be a PDF or image, or a link to a web page from where the data was sourced. All links to web resources should be accompanied by a hashlink representation to allow verifiers to ascertain that the resource has not changed. For non-public resources, resource access should be protected by the same DID-Auth mechanism as the VCs themselves. \[alternatively should be protected by OAuth authentication allowing access using the accompanying token.\]   
* Vouch evidence contains the name and participant role of the voucher \- the human who has supplied the claims. This provides a human-readable representation of that individual and supplements the fact that the voucher is also the issuer of the credential and so has their DID represented as the **issuer** attribute.

# 

# Trust Model {#trust-model}

The Framework takes a two-pronged approach to trust: VCs include machine-verifiable cryptographic proofs of the provenance of data alongside human-readable evidence.

Cryptographic proofs are contained within the VC proof property and use public-private key pairs referenced in the DIDs that underpin the issuers of those VCs, whether they be natural persons (where the DID can be bound to a digital identity VC) or an organisation (where in future a vLEI can fulfil the same purpose). In this way proofs can be constructed for this wide range of participants without any centralised effort.

In the case of electronic data sources, trust is underpinned by a small number of DIDs being managed by the Trust Framework itself. These represent either the official Trusted Issuers (primary sources) of data where they are able to issue VCs themselves, or one of a number of Trusted Proxies that can accurately transform primary source data into the required format and sign those VCs themselves.

Trusted DIDs are managed by framework administrators as a simple list in the secure PDTF Trust Framework github repository.

Data consumers can then always discover the necessary public keys to verify the proofs by resolving either from the DID registry exposed by the Trust Framework or directly from the participants' DIDs themselves.

Additionally, where permissions allow, trusted participants can access the verified digital identities for e.g. Sellers and Buyers (also supplied as VCs and with the participant DID as its **Subject**) and make that connection into real world identity for the data supplied by them.

# 

# Security Model {#security-model}

The PDTF uses a dynamic permissions model whereby access to VCs is restricted to those participants who can prove they control their respective DIDs.

These transaction-participant relationships are themselves defined as VCs, issued initially by the participant initiating the transaction (normally the Estate Agent or a Seller) and each representing the consent of a participant to share with another.

## **Specifying visibility**

The VC **termsOfUse** property represents the visibility of its contained claims with:

* A **type** of **TrustFrameworkPolicy**  
* A **trustFramework** property of **PropertyDataTrustFramework**,  
* A **confidentialityLevel** of **Public**, **Restricted** or **Confidential**,where **Public** access does not require authentication, **Restricted** access is limited to all of the transaction’s verified participants (see below) and **Confidential** is limited to participants associated with a specific subset of roles.  
* A **requiredCredentials** property detailing the credentials with the required roles associated with them. \[we might also allow specific participant DIDs to be listed here \-we don’t want to share with all Conveyancers, just this one?\]  
* A PII property that flags whether the claims contain Personally Identifiable Information.

# 

# Interoperability {#interoperability}

## **Transaction nexus**

The existing PDTF data exchange mechanisms are based on simple HTTP API calls and as such are easy to understand and implement.

The PDTF 2.0 model also follows this model, albeit with necessary enhancements to support the use of VCs and access controls.

In practical terms, any given transaction is hosted at a single nexus, or hub, but this might be at one of any number of PDTF-compliant servers. That nexus has the responsibility to store the relevant VCs, manage participants (expressed as relationship VCs) and control access accordingly. The API endpoint for the nominated hub is represented in the service endpoint defined in the transaction DID.

\[Alternatively\]

\[hosting revocation lists?\]

## **Enforcing access controls**

This model necessarily requires that platforms sharing VCs have complete access to the Transaction VCs that specify the participant relationships in order to enforce access controls.

A proposed specification for a DID Auth based OAuth2 mechanism is [here](https://docs.google.com/document/d/1YxEhyLzcC0czBOLJWSh34WB5nohX0JR6iivSfSXJCmE/edit?tab=t.0#heading=h.fulu7xl3nxov).

Given the authorisation process scopes the issued token to the transaction and the participants role, VCs that are returned from a /claims request can be filtered to only those that are visible to the requesting party.

By definition, access to publicly-visible VCs should be allowed even without authorisation.

In respect of new VCs being issued (POSTed) to the server, we restrict access to those DIDs that identify participants (and only accept VCs issued by those DIDs) or DIDs that are available through the Trust Framework that represent primary sources and trusted proxies (again requiring the issuer of that VC to match).

To support a peer-to-peer model it may be permissible to set up unrestricted access to receive and post VCs where we wish to replicate the VC collection between trusted systems.

To ensure consumers retain control of access to their data, peers in the network must ensure they hold a complete copy of all VCs, in particular those representing the relationships between the transaction and its participants, so that when these change the resulting authorisation changes are propagated.

Equally, non-peers (pure consumers of VCs) must not durably persist VCs beyond a minimum necessary period.

\[Proposed\] PDTF servers may also expose an OAuth Authorization Code endpoint where a user can demonstrate control of \[either/both\] an existing participant’s email address (by clicking on a verification link sent to that address) \[and/or\] mobile phone number (by entering a verification code sent to that number via SMS). 

## **Credential revocation**

…especially in relation to participant relationship credentials, so that the seller or buyer can control access to the data. Get vendors managing user access and relationship credentials to support e.g. VC Bitstring Status list revocation.

# 

# Implementation {#implementation}

## **PDTF Servers**

A PDTF-compliant server must implement the following endpoints \[TODO link to OpenAPI spec\] using a base URL as specified in the transaction DID document service endpoint:

**GET /verifiableCredentials**

Returns all authorised VCs in the transaction graph

**GET /state**

Returns an aggregated state formed from the authorised VCs in the transaction graph, with Property, Participant and Title entities represented as top level property, participant and title properties.

**POST /verifiableCredentials**

Adds a VC to the collection, requiring the VC issuer to match the DID presented on authorisation.

**POST /subscribe**

Subscribes to changes in authorised VCs in relation to the DID presented.

**DELETE /subscribe**

Unsubscribes from changes.

## **Managing participants**

Relationship vouches

## **Data sources: issuing credentials**

## **Data consumers: verifying credentials**

## **Trusted issuers and proxies**

### Requirements and accreditation

### Onboarding

# Examples {#examples}

[image1]: <data:image/png;base64,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>