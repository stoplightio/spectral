# Versioning

As of June 2021, Spectral is no longer a single monolithic package, but consists of several smaller packages instead.
Each package has its own independent version, changelog, etc.
All packages, including the distributed binaries as well as our Docker images (which we'll refer to as standalone packages), are released on a workday basis - assuming there are any commits to be released.
However, one may still "mix" versions, if applicable, which might be crucial if you'd like to stick to a particular version of a ruleset.
It's worth noting that a breaking change of any dependant package doesn't imply the major release of the standalone package.
Only the breaking changes to the CLI itself will result in a major version change.
To learn more about rulesets versioning, please refer to [docs](./4-rulesets#Alternative-JS-Ruleset-Format).

To summarize - virtually nothing has changed. The only minor caveat is the slight change around semantic versioning in the context of standalone packages.
