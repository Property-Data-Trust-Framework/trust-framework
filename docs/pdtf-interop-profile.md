# PDTF Interoperability Profile

The Property Data Trust Framework consists of 4 main components

- **Credential Exchange**
- **Schemas**
- **Roles & Permissions**
- **Discovery**

## Credential Exchange

We target these two interoperability profiles based around OpenID 4 VCs, that enable the issuance and presentation of w3c VCs in VC-JWT format:

- [https://identity.foundation/jwt-vc-presentation-profile](https://identity.foundation/jwt-vc-presentation-profile/)
- [https://identity.foundation/jwt-vc-issuance-profile](https://identity.foundation/jwt-vc-issuance-profile/)

Each participant of the PDTF must control at least one DID of a supported method defined in these profiles, and must support the full presentation or issuance profile.

## Schemas

The PDTF will publish schemas of the following categories

**Property Credentials**

Credentials where the subject is a property. A property can be identified with a UPRN or an address.

**Person Credentials**

Credentials where the subject is a person. A person can be identified using a DID of a supported type defined in the Credential Exchange profiles.

**Title Extract Credentials**

Credentials where the subject is a title (extracted from the land registry). A title identified can be identified using ??? .

A schema is defined as a json schema (version?) and is associated with a single credential type. A PDTF credential must reference a PDTF schema in the `credentialSchema` field, with type `JsonSchemaValidator2018(???)` . i.e.

```
"credentialSchema": {
    "id": "https://https://propdata.org.uk/schemas/example.json",
    "type": "JsonSchemaValidator2018"
  }
```

And must include the associated PDTF credential type in the credential `type`

## Roles and Permissions

The PDTF will assign participants roles which are associated with certain permissions related to the exchange of PDTF credentials. Participants of the PDTF are expected to adhere to these permissions.

Role are assigned using a [Trust Establishment Document](https://identity.foundation/trust-establishment/) maintained by the PDTF. The PDTF will control and publicize a DID that it will use to make role assertions about participants. Each participant must declare a public did to the PDTF, that will be used as the subject of role assertions. Additionally a participant must declare an HTTPS domain (ideally this can be discovered using `serviceEndpoints` in the DID doc however not all did methods will be suitable for this) and a [Wellknown DID configuration](https://identity.foundation/.well-known/resources/did-configuration/) to link this domain with their declared DID.

## Discovery

The PDTF will maintain schemas, and roles in a public github repository. They will be published to an official PDTF web server and to an official PDTF artifact registry.

Additionally the PDTF will run a discovery service that offers an API and web interface capable of

- resolving a participant did to its associated permissions
- resolving a credential type to its associated schema and to participants that have permission to issue or verify credentials of that type.

The code for this service will be open source, and anyone can host it. Participants do not have to use it, they just have to be confident they adhere to the roles.

Generally, participants are recommended to take an offline approach to discovery. That is, roles and schemas should be treated like a software package / dependency of their larger application. It should be pulled and embedded into your application, and kept up to date using regular re-deployments.