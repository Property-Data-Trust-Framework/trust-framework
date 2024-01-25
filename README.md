# Trust Framework

This repository holds:

* The [pdtf interop profile](./docs/pdtf-interop-profile.md), which participants of the PDTF must implement.
* The trust framework described as a trust model, which is built into a Trust Establishment Document using TrustBench

## Building the TrustFramework


The trust framework is expressed as a [model](./model) built using the [TrustBench](https://github.com/ed-curran/TrustBox/blob/main/packages/trustbench/README.md) cli, which requires node and npm. 
Once built we get a directory of files, most importantly a Trust Establishment document, that can be hosted on a webserver. The published framework is available [here](https://propdata.org.uk/pdtf.json).

TrustBench lets us build the trust framework for different environments, which means we can have a live environment, 
various test environments and local dev environments etc. Currently, we just have one [live](#live-environment) preview environment.

You can install trustbench globally with
```bash
npm install -g trustbench
```
Then you can just use `trustbench` instead of `npx trustbench` in the commands below (might need to restart your terminal).
### Live Environment
The live environment is committed in this repo, but can only be built if you have the right secret key. 
In which case you can do.

```bash
  npx trustbench build --secret=<SECRET>
```

### Build your own environment
If you want to build you own environment for local dev you can do:

```bash
npx trustbench init local --template environment.json
```

Then you can change the url in the generated `local.environment.json` to match your local setup. Then run:
```bash
npx trustbench build local
```
This will put the built trust framework files into `./dist/local`

You can replace `local` with whatever you want to call your environment.

## How to join the trust framework
Right now this is just a preview, so just contact a maintainer or make a github issue in this repo and provide your did. 
And we'll add you as a member.