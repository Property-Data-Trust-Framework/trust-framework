# Join the Trust Framework Preview

So you want to join the trust framework. At the moment we have a single "preview" environment,  joining the preview is rather easy.

1. Create a did for your organisation
2. (optional but recommended) create and host a well-known did configuration to link your web domain with your did
3. Add yourself as a member by opening a PR
4. Wait for the PR to be merged and a new version of trust framework package to be published.

## Intro
Every member of the trust framework must have a decentralised identifier (DID). 
A DID lets us unambiguously identify an organisation so that the 
PDTF itself can make assertions about its membership status, other members recognise each other, 
and users can recognise the organisations they interact with.

DIDs do not rely on any infrastructure operated by the PDTF itself, and have cryptographic properties that make them useful for the construction and verification of verifiable credentials (VCs). 
Thus, they are well suited to support an open network for the exchange of property data expressed as verifiable credentials.


## Setting up an Agent

Generally, we call the thing that lets us manage DIDs, and perform credential exchanges, an "Agent".
Your Agent will be your gateway into the world of credential exchange, so we'll want to set one up.

Agents are quite complicated, most critically they handle the private keys that support your DID(s).
You will certainly want to use a library, or product, or service to take care of the hard bits.


There's roughly two levels of sophistication of agent that you can use:
1. A "local" Agent, typically controlled through a CLI. 
This would be suitable for generating DIDs for the purpose of joining the preview environment, 
but would be unlikely to allow for proper credential exchanges with other members. 
2. Host a "standalone" Agent, and expose it (/ part of it) to the public internet. 
Typically, it would be controlled via an API and/or CLI.
This would be suitable for performing PDTF credential exchanges and should scale to production workloads.

I've only tested out a set up using level 1 so far, so the rest of the guide will focus on this. 
Once I've evaluated which libraries would be suitable for credential exchange and got something working I will update this.
### Picking an Agent
In this guide we will be using Veramo via TrustBench. 
[Veramo](https://veramo.io/) is a library looked after by [DIF](https://identity.foundation/), offering a modular set of APIs for working with verifiable data and SSI. 
[TrustBench](https://github.com/lemontreeran/TrustBox/tree/main/packages/trustbench) 
is a tool I made to allow an SSI set-up to be defined more declaratively. 
For this guide it helps us generate a well-known did configuration. 

TrustBench runs locally, controlled by the filesystem and through a CLI. 
Veramo can be run locally, or hosted as a server. 
This guide will assume it's being used locally, but I'm hoping this feature will allow us to transition from level 1 to level 2 later.

Here are some other options to evaluate:

Open Source
* [credo-js](https://credo.js.org/) (FKA Aries Framework JS)
* [waltid-identity](https://github.com/walt-id/waltid-identity/tree/main)
* Veramo with [Spehereon SSI-SDK](https://github.com/Sphereon-Opensource) plugins for OpenID4VC



## Creating a DID with TrustBench

### Installation
First install TrustBench globally. This requires node > v18 which can be installed [here](https://nodejs.org/en/download).

```bash
npm i TrustBench -g
```

You may need to restart your terminal so that it picks up TrustBench correctly in your PATH.

Make a directory to hold your local Agent. Inside this directory, initialise a new TrustBench environment

```bash
trustbench init
```

This will create a file `environment.json`. It will contain a randomly generated `kmsSecretKey`. 
This secret key is important, it's used to encrypt the key material in your Agent's storage such a private keys. 
If you lose it, you will also lose access to the DIDs managed by your agent. 
If an attacker gets a hold of the secret AND the (encrypted) storage of your Agent, they will be able to use your DIDs and impersonate you. This is bad.

### Define an Entity
Lets define an entity to represent our organisation. 
We can do this by adding an entity entry to our `envionment.json`, so that it looks like this:

```json
{
  "kmsSecretKey": "<YOUR_SECRET>",
  "entities": {
    "acme": {
      "didMethod": "did:jwk",
      "origin": "www.acme.com",
      "didConfiguration": {
        "json-ld": false,
        "vc-jwt": true
      }
    }
  }
}
```
Here we've defined an entity named `acme` and configured it with:
* A did using the [did-jwk](https://github.com/quartzjer/did-jwk) did method.
* An origin (will be used in the did configuration)
* A well-known did configuration using a vc-jwt linked did credential (did-jwk doesn't support json-ld)

You can of course replace acme with the name of your organisation.

### Build your environment
Now that we've defined our entity, we can get TrustBench to build it for us.

```bash
trustbench build
```

Your project directory should now look like this:
```
dist/
├─ default/
│  ├─ acme/
│  │  ├─ .well-known/
│  │  │  ├─ did-configuration.json
database.sqlite
environment.json
environment-lock.json
```

On build TrustBench will:
* Construct each entity defined in the `environment.json` configuration by using Veramo as an Agent. Veramo uses `database.sqlite` for storage.
* Remember important things about each entity for subsequent builds (such as its DID) in the `environment-lock.json`. 
* Publish useful web resources for each entity to an environment folder under the `dist` directory. Because we didn't 
explicitly set an environment name, ours is called `default`

### Find your did
There's a couple of ways to find the DID generated for your entity. 
Let's use this opportunity to show how the Veramo CLI can be used for this.

First install the veramo cli globally

```bash
npm i @veramo/cli -g
```

We can tell the veramo CLI how to talk our agent using:

```bash
trustbench switch
```

This will create an `agent.yml` file that the veramo CLI will look for. 
If you have multiple environments, then each environment will have its own agent. `switch` can be used to switch between them.

Now we can use the Veramo CLI to find the DIDs managed by our Agent.

```bash
veramo did
```

Will display a table like this:


```bash
┌──────────┬───────┬────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ provider │ alias │                                                                                                                                                                                                                        did │
├──────────┼───────┼────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  did:jwk │  acme │ did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJTWGJRNVRza1pRM3V6QUo4T2tGaXFFNE0zVlZSbkswenJVdG0zZUY4OEtnIiwieSI6IllMR1d6dmQ0WW5ib3JJVDJlYlFGTlE0TGpsOEVBYnppV010YWEtaU5mYU0ifQ │
└──────────┴───────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

For each entity, TrustBench will have created a DID with an alias matching the name of the entity.

The Veramo CLI can be used for a bunch of things. A list of available commands can be displayed by running 

```bash
veramo
```

Or have a look at the [docs](https://veramo.io/docs/veramo_agent/cli_tool)




### Host your well-known did configuration
A [Well Known DID Configuration](https://identity.foundation/.well-known/resources/did-configuration/) is used to link a did to an origin (e.g. the domain of your organisations website).

TrustBench makes this easy by creating a did-configuration for you.

The contents of the `dist/default/acme` (or replace `acme` with your entity name) directory
is designed to be dropped straight into a webserver. 

If you set the `origin` of your entity as the domain name of your website, 
then host the contents of the `dist/default/acme` in the root of your website (e.g. in the `public` folder) you should be good to go. 

You can test this by installing [TrustSight](https://chromewebstore.google.com/detail/trustsight/gkodecajacijdbagcleeadfpbbdloblc) and opening it up on your website.
If you see a colourful avatar then its working, you can hover over the avatar to see your did.

## Create a PR
Now that you have a DID for your organisation, 
that DID (and therefore your organisation) can be inducted as a member of the PDTF. 
This will allow organisations and users to verify that your organisation is a member of the PDTF.

This repository holds a trust model that keeps track of members and their roles (as well as credential types and schemas).

In reality, there would be an official governance process to follow which would conclude with the PDTF admins
adding your organisation to the model with the correct roles.

However since we're currently just using a preview environment, this section will explain how you can add yourself to the model.


### Fork the repository
Fork the repository on github and clone it to your machine.

### Add your organisation as an entity
The `environment.json` file keeps track of the configuration of entities used in the model. 
You can add your organisation as an entity under the `entities` object, like this 

```json
    "acme": {
      "did": "did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJTWGJRNVRza1pRM3V6QUo4T2tGaXFFNE0zVlZSbkswenJVdG0zZUY4OEtnIiwieSI6IllMR1d6dmQ0WW5ib3JJVDJlYlFGTlE0TGpsOEVBYnppV010YWEtaU5mYU0ifQ"
    }
```

Replacing `acme` with the name of your organisation, and using the did you generated for your org earlier.

So `environment.json` will look like

```json
{
  "entities": {
    //this is the entity of the pdtf itself, please don't touch.
    "pdtf": {
      "didType": "did:key",
      "origin": "https://propdata.org.uk",
      "didConfiguration": true
    },
    
    ///////////////////////////////////
    // bunch of member entities here //
    ////// please don't touch /////////
    ///////////////////////////////////
    
    //entity for your org here
    "acme": {
      "did": "did:jwk:eyJhbGciOiJFUzI1NksiLCJjcnYiOiJzZWNwMjU2azEiLCJrdHkiOiJFQyIsInVzZSI6InNpZyIsIngiOiJTWGJRNVRza1pRM3V6QUo4T2tGaXFFNE0zVlZSbkswenJVdG0zZUY4OEtnIiwieSI6IllMR1d6dmQ0WW5ib3JJVDJlYlFGTlE0TGpsOEVBYnppV010YWEtaU5mYU0ifQ"
    }
  }
}
```

### Add your organisation as a member of the trust framework
Members of the trust framework are defined in the trust model at `model/trustframework/members`. 
Each member has a `subject` entry which defines their membership and roles. 
The term `subject` is used because the member is the subject of various assertions made by the PDTF about their membership status and roles.

Create a file for your subject following this format

`<ENTITY_NAME>.subject.json`

Replace `<ENTITY_NAME>` with the name of the entity you used for your organisation in the previous step.


Add a membership role to the subject. By updating the file to look like this:
```json
{
  "pdtfParticipant": {
    "name": "Acme",
    "description": "Acme is an example organisation for this guide"
  }
}
```
`pdtfParticipant` is the name of the basic membership role (i've been switched between calling it member or participant).
You should provide a name and description appropriate to your organisation.

### Add credential exchange roles for your organisation
There are two roles related to the exchange or credentials.
`pdtfIssuer` and `pdtfVerifier`. 
These can be used to assert the type of PDTF credentials a member is permitted to issue or verify.

For example this entry says that the member can issue the PDTF credential of type `ExampleCredential`.

```json
  "pdtfIssuer": {
    "credentials": [{"type": "ExampleCredential"}]
  }
```

And this says the member can verify PDTF credentials of type `ExampleCredential`

```json
  "pdtfVerifier": {
    "credentials": [{"type": "ExampleCredential"}]
  }
```

The pdtf credentials are defined at `model/pdtf/trustframework/pdtf.subject.json`.

Include the roles you desire in your subject entry.


### Make the PR
Commit your changes to the model with a commit message like: `feat: add member <ENTITY_NAME>`.
Push the changes to your fork, then in github create a PR into the original repository.


## Now wait for the PR to be merged
The PR will now need to be merged by a maintainer, and then a new version of the package published. 
This is quite manual for now, will work on automating it as demand grows. 
Also need to write a guide for this step


## Now What

Once published, an entry for your organisation should be visible in the [discovery API](https://propdata.org.uk/api/#/operations/getMember).
And members can pull and start using the updated trust framework package.

If you set up a Wellknown Did Configuration, the membership of your organisation should also be visible to users using TrustSight.
* Install [TrustSight](https://chromewebstore.google.com/detail/trustsight/gkodecajacijdbagcleeadfpbbdloblc) (chrome only)
* Visit https://propdata.org.uk and open up the TrustSight extension, import the PDTF trust doc from the import tab.
* Visit the website you used as the origin for your Did Configuration. Open TrustSight and you should see the PDTFs role assertions for your organisation.