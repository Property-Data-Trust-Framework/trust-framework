# Trust Framework

This repository holds the technical half of the property data trust framework, which consists of:
* The [pdtf interop profile](./docs/pdtf-interop-profile.md), which participants of the PDTF must implement.
* A TrustBench model that is built into a Trust Framework Package.

The interop profile is designed to enable the exchange of data 
useful to a UK property transaction.  

A Trust Framework Package is designed to:
* Help a holder / user:
    * Discover credentials and services that are available from PDTF members. (todo)
    * Determine whether they are interacting with a PDTF member
    * Determine what a PDTF member is permitted to do regarding the issuance and verification of PDTF credentials according to the trust framework.
* Help an issuer construct valid PDTF Credentials
* Help a verifier:
    * Request valid PDTF credentials from a holder
    * Determine whether a given VC or VP is a valid PDTF credential / presentation.
    * Direct a holder to obtain any VCs that they are missing
  
## Anatomy of a Trust Framework Package
A trust framework package consists of:
* An [index file](https://propdata.org.uk/trustframework/) 
* A [trust establishment document](https://propdata.org.uk/trustframework/pdtf.json)
* Resources that the trust establishment document references, such as topic schemas and credential schemas.
* Optional [discovery api](https://propdata.org.uk/trustframework/api/)

### Index File
Outlines where the components of the package are hosted and how the trust establishment document can be interpreted.

### Trust Establishment Document
The source of truth for the trust frameworks credential schemas, members and roles.

### Resources
Resources that the trust establishment document references:
* Topic schemas
* Json schemas for trust framework credentials


### Discovery API
A representation of the Trust Establishment Document optimised for the discovery of trust framework members and credential schemas. It is organised like an HTTP JSON API, but it's static and readonly. 
Under the hood its simply a tree of static files.

The api has two collections: `api/schemas` and `api/members`. At the root `/api` is an aggregated view of everything.


A credential schema can be looked up by its `type` using `/schemas/{type}` to find out:
* it's associated json schema
* members that are permitted to issue it
* members that are permitted to verify it

A member can be looked up by their `did` using `members/{did}` to find out:
* their membership information
* their roles (what can they issue and/or verify)

See interactive [API Spec](https://propdata.org.uk/api/#/operations/getDiscoveryDocument).
## Using the Trust Framework 
Currently, we have one live preview environment. 
The package is hosted [here](https://propdata.org.uk/pdtf.json), 
and available for download as a release artifact in this repo. It can be used in a few ways:


**Use the [discovery API](https://propdata.org.uk/api/#/operations/getDiscoveryDocument)**

**Use TrustBench**

TrustBench comes with some utilities to work with a trust framework package. 
It can be installed with node and npm.

```bash
npm install -g trustbench
```

Create a verifiable credential outline from a schema type:

```bash
trustbench tf credential ExampleCredential {} --tfPath https://propdata.org.uk/trustframework
```

Will return

```json
{
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "type": [
    "VerifiableCredential",
    "ExampleCredential"
  ],
  "issuanceDate": "2024-01-30T14:56:26.259Z",
  "issuer": "",
  "credentialSubject": {},
  "credentialSchema": {
    "id": "https://propdata.org.uk/trustframework/schemas/example.json",
    "type": "JsonSchema"
  }
}
```

This functionality will be expanded, for example to add the generation of a presentation request outline


**Create your own tools / integrate into your own software**

The package is just static files, so it's quite easy to work with.

It's recommended to download the package and work with your own version.
But the PDTF hosted package can also be used.

## Building the Trust Framework


The trust framework is authored as a  [TrustBench](https://github.com/ed-curran/TrustBox/blob/main/packages/trustbench/README.md) [model](./model) which gets built into the publishable trust framework using the trustbench cli. 
This layer of indirection helps with a couple of things:
1. Can use a more authorship friendly representation to define it in. 
2. Can build trust framework for different environments (i.e. live environment, test environments etc)


Once built we get a directory of files, most importantly a Trust Establishment document, that can be hosted on a webserver.
Currently, we just have one live preview environment, for which published framework is available [here](https://propdata.org.uk/pdtf.json).

Install trustbench globally with
```bash
npm install -g trustbench
```

### Live Environment
The live environment is committed in this repo, but can only be built if you have the right secret key. 
In which case you can do.

```bash
trustbench build --secret=<SECRET>
```

### Build your own environment
If you want to build you own environment for local dev you can do:

```bash
trustbench init local --template environment.json
```

Then you can change the url in the generated `local.environment.json` to match your local setup. Then run:
```bash
trustbench build local
```
This will put the built trust framework files into `./dist/local`

You can replace `local` with whatever you want to call your environment.

## How to join the trust framework
Right now this is just a preview, so just contact a maintainer or make a github issue in this repo and provide your did. 
And we'll add you as a member.