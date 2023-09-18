# @stoplight/spectral-cli [6.11.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-6.10.1...@stoplight/spectral-cli-6.11.0) (2023-09-15)


### Features

* **cli:** add sarif formatter ([#2532](https://github.com/stoplightio/spectral/issues/2532)) ([959a86a](https://github.com/stoplightio/spectral/commit/959a86aedbc0bfe2533212dcaa4e28784fc1e384))

## @stoplight/spectral-cli [6.10.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-6.10.0...@stoplight/spectral-cli-6.10.1) (2023-08-04)


### Bug Fixes

* **cli:** choose proxy agent based on requester protocol ([#2521](https://github.com/stoplightio/spectral/issues/2521)) ([056f2e1](https://github.com/stoplightio/spectral/commit/056f2e1eef966b807734fb00aae071411feabe75))

# @stoplight/spectral-cli [6.10.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-6.9.0...@stoplight/spectral-cli-6.10.0) (2023-07-26)


### Features

* **cli:** require newer version of all Spectral dependencies ([10ddd97](https://github.com/stoplightio/spectral/commit/10ddd97b6609a58c3542dccf4019488095b38064))

# @stoplight/spectral-cli [6.9.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.8.0...@stoplight/spectral-cli-6.9.0) (2023-07-25)


### Features

* **cli:** use hpagent ([#2513](https://github.com/stoplightio/spectral/issues/2513)) ([9b2d347](https://github.com/stoplightio/spectral/commit/9b2d3476996f7763c035380beffd2bf46c6051f9))

# [6.8.0](https://github.com/stoplightio/spectral/compare/v6.7.0...v6.8.0) (2023-05-23)

No new changes.

# [6.7.0](https://github.com/stoplightio/spectral/compare/v6.6.0...v6.7.0) (2023-05-23)

### Bug Fixes

- **core:** improve deep ruleset inheritance ([#2326](https://github.com/stoplightio/spectral/issues/2326)) ([378b4b8](https://github.com/stoplightio/spectral/commit/378b4b89769635e8b45d5325c15cfa00881b70bd))
- **core:** more accurate ruleset error paths ([66b3ca7](https://github.com/stoplightio/spectral/commit/66b3ca704136d5d8a34211e72e2d8a2c522261e4))
- **core:** reset path in fn context ([#2389](https://github.com/stoplightio/spectral/issues/2389)) ([3d47ec4](https://github.com/stoplightio/spectral/commit/3d47ec432fde46d9d1e59d00c1173d924b6a39a1))
- **ref-resolver:** bump @stoplight/json-ref-resolver from ~3.1.4 to ~3.1.5 ([#3635](https://github.com/stoplightio/spectral/issues/3635)) ([215ae93](https://github.com/stoplightio/spectral/commit/215ae93a3b06d73cc10a07b6c43c718450a2a2fd))
- **ruleset-bundler:** defaults should be last one ([#2403](https://github.com/stoplightio/spectral/issues/2403)) ([8780cfa](https://github.com/stoplightio/spectral/commit/8780cfac20cfa70b8ca8208f1b15955ca2111746))
- **ruleset-bundler:** remove extraneous 'external dependency' warnings ([#2475](https://github.com/stoplightio/spectral/issues/2475)) ([e791534](https://github.com/stoplightio/spectral/commit/e7915342cb434ea871394e969d166f8987083642))
- **ruleset-migrator:** avoid positive lookbehinds ([#2349](https://github.com/stoplightio/spectral/issues/2349)) ([455c324](https://github.com/stoplightio/spectral/commit/455c32487b6f25465c1204186006e2c830f48eb3))
- **ruleset-migrator:** transform functions under overrides ([#2459](https://github.com/stoplightio/spectral/issues/2459)) ([45e817f](https://github.com/stoplightio/spectral/commit/45e817ffb9b682779c8e20153405879d9205454d))
- **ruleset-migrator:** use module for require.resolve ([#2405](https://github.com/stoplightio/spectral/issues/2405)) ([d7c0fa4](https://github.com/stoplightio/spectral/commit/d7c0fa44c506f8f724129c31ee51701fb9699bef))
- **rulesets:** avoid false errors from ajv ([#2408](https://github.com/stoplightio/spectral/issues/2408)) ([92dab78](https://github.com/stoplightio/spectral/commit/92dab78d0c07e6919c0485cadbe5aa2391a53e8b))
- **rulesets:** length.min said "must not be longer than" ([#2355](https://github.com/stoplightio/spectral/issues/2355)) ([df3b6f9](https://github.com/stoplightio/spectral/commit/df3b6f917cf46456f698445ed67fabbb4306eb4c))

### Features

- **core:** relax formats validation ([#2151](https://github.com/stoplightio/spectral/issues/2151)) ([de16b4c](https://github.com/stoplightio/spectral/commit/de16b4cbd56cd9836609ab79487a6e3e06df964d))
- **core:** support end-user extensions in the rule definitions ([#2345](https://github.com/stoplightio/spectral/issues/2345)) ([365fced](https://github.com/stoplightio/spectral/commit/365fcedb7c140946767ed28a92a120b3adb08e47))
- **core:** support x- extensions in the ruleset ([#2440](https://github.com/stoplightio/spectral/issues/2440)) ([964151e](https://github.com/stoplightio/spectral/commit/964151e73b6cc3c0b7c960eac3711ffbeac690ae))
- **formats:** support AsyncAPI 2.6.0 ([#2391](https://github.com/stoplightio/spectral/issues/2391)) ([b8e51b4](https://github.com/stoplightio/spectral/commit/b8e51b487e0667908d8148b818007026722cacb7))
- **formatters:** move formatters to a separate package ([#2468](https://github.com/stoplightio/spectral/issues/2468)) ([664e259](https://github.com/stoplightio/spectral/commit/664e25927f31ca24beebecf78ac373668328de23))
- **rulesets:** add traits array path to headers rule ([#2460](https://github.com/stoplightio/spectral/issues/2460)) ([9ceabca](https://github.com/stoplightio/spectral/commit/9ceabca80969885c240349d6ebba15c09a4f8697))
- **rulesets:** support AsyncAPI 2.6.0 ([#2391](https://github.com/stoplightio/spectral/issues/2391)) ([94a7801](https://github.com/stoplightio/spectral/commit/94a7801c558948aed085cd9cd1856019681d1c9b))

# [@stoplight/spectral-cli-v6.6.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.5.1...@stoplight/spectral-cli-v6.6.0) (2022-10-24)

### Bug Fixes

- **cli:** peer dependency incorrectly met ([#2268](https://github.com/stoplightio/spectral/issues/2268)) ([1b70398](https://github.com/stoplightio/spectral/commit/1b70398c8ff1d033ba971c9f41f3694203ff7b29))

### Features

- **cli:** use Content-Type header to detect ruleset format ([#2272](https://github.com/stoplightio/spectral/issues/2272)) ([b4c3c11](https://github.com/stoplightio/spectral/commit/b4c3c113abe155dc7537432741bbe1a1641d694a))

# [@stoplight/spectral-cli-v6.5.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.5.0...@stoplight/spectral-cli-v6.5.1) (2022-08-24)

### Bug Fixes

- **cli:** missing line break ([#2251](https://github.com/stoplightio/spectral/issues/2251)) ([d16bf9a](https://github.com/stoplightio/spectral/commit/d16bf9a2d7bb28932f0ea0ef58b786dc8f471ff1))

# [@stoplight/spectral-cli-v6.5.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.4.2...@stoplight/spectral-cli-v6.5.0) (2022-08-03)

### Features

- **core:** improve validation ([#2026](https://github.com/stoplightio/spectral/issues/2026)) ([8315162](https://github.com/stoplightio/spectral/commit/83151628824592117d842a8965c9557841966b1a))

# [@stoplight/spectral-cli-v6.4.2](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.4.1...@stoplight/spectral-cli-v6.4.2) (2022-07-21)

### Bug Fixes

- **core:** fix 'resolved vs unresolved' json path mapping ([#2202](https://github.com/stoplightio/spectral/issues/2202)) ([157ec59](https://github.com/stoplightio/spectral/commit/157ec592d8b3276094284fead7a08541b3f46f61))

# [@stoplight/spectral-cli-v6.4.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.4.0...@stoplight/spectral-cli-v6.4.1) (2022-06-01)

### Bug Fixes

- **cli:** do not show 'or higher' if severity equals error ([#2172](https://github.com/stoplightio/spectral/issues/2172)) ([f31ec63](https://github.com/stoplightio/spectral/commit/f31ec636c912f3c9a53672e87a13ad724921b902))

# [@stoplight/spectral-cli-v6.4.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.3.0...@stoplight/spectral-cli-v6.4.0) (2022-05-12)

### Features

- **cli:** sort linting results alphabetically ([#2147](https://github.com/stoplightio/spectral/issues/2147)) ([84d48cf](https://github.com/stoplightio/spectral/commit/84d48cf5e02780f0cbb9ae9074c03a618c2bc462))

# [@stoplight/spectral-cli-v6.3.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.2.1...@stoplight/spectral-cli-v6.3.0) (2022-03-03)

### Features

- **cli:** improve error logging ([#2071](https://github.com/stoplightio/spectral/issues/2071)) ([b194368](https://github.com/stoplightio/spectral/commit/b194368164d92dce31b7ceba84ccc94fbe51f979))

# [@stoplight/spectral-cli-v6.2.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.2.0...@stoplight/spectral-cli-v6.2.1) (2022-02-08)

### Bug Fixes

- output to stdout not working with multiple output formatters ([#2044](https://github.com/stoplightio/spectral/issues/2044)) ([77dfe3b](https://github.com/stoplightio/spectral/commit/77dfe3b5237a25928febfcf5696eaea5b1edc54f))

# [@stoplight/spectral-cli-v6.2.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.1.1...@stoplight/spectral-cli-v6.2.0) (2022-01-28)

### Features

- support multiple formats and outputs at once ([#2037](https://github.com/stoplightio/spectral/issues/2037)) ([e7b5816](https://github.com/stoplightio/spectral/commit/e7b5816e6cfa28814f7cadeeb0c834d43758485e))

# [@stoplight/spectral-cli-v6.1.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.1.0...@stoplight/spectral-cli-v6.1.1) (2022-01-21)

### Bug Fixes

- add path to JUnit testcase name ([#2029](https://github.com/stoplightio/spectral/issues/2029)) ([062ae0c](https://github.com/stoplightio/spectral/commit/062ae0c8b48534c554ac41a23edafb0fbe6aa1b3))
- correctly handle special characters in JUnit failure details ([#2028](https://github.com/stoplightio/spectral/issues/2028)) ([cabd2a9](https://github.com/stoplightio/spectral/commit/cabd2a9a7e81057c3006558add071fd80662827c))

# [@stoplight/spectral-cli-v6.1.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.0.1...@stoplight/spectral-cli-v6.1.0) (2021-10-07)

### Features

- integrate ruleset-bundler ([#1824](https://github.com/stoplightio/spectral/issues/1824)) ([26284c7](https://github.com/stoplightio/spectral/commit/26284c7004d3b1d7c3ec2bd59910b66bfb3bd414))

# [@stoplight/spectral-cli-v6.0.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v6.0.0...@stoplight/spectral-cli-v6.0.1) (2021-10-05)

### Bug Fixes

- update all prod dependencies ([963a162](https://github.com/stoplightio/spectral/commit/963a16251ed9d85032f6452d72f5cf5370bb34e0))

# [@stoplight/spectral-cli-v1.2.1](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v1.2.0...@stoplight/spectral-cli-v1.2.1) (2021-07-09)

### Bug Fixes

- relax deps ([ca55521](https://github.com/stoplightio/spectral/commit/ca555210b7c50229c6f8cd0ae9e4e83dedb15083))

# [@stoplight/spectral-cli-v1.2.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v1.1.0...@stoplight/spectral-cli-v1.2.0) (2021-07-09)

### Features

- **parsers:** initial release ([#1739](https://github.com/stoplightio/spectral/issues/1739)) ([42064b0](https://github.com/stoplightio/spectral/commit/42064b04887616e863f2da27cd19b4cdcc35c0a3))

# [@stoplight/spectral-cli-v1.1.0](https://github.com/stoplightio/spectral/compare/@stoplight/spectral-cli-v1.0.0...@stoplight/spectral-cli-v1.1.0) (2021-07-09)

### Features

- **core:** use double quotes in errors reported by Ajv ([#1718](https://github.com/stoplightio/spectral/issues/1718)) ([dd2a166](https://github.com/stoplightio/spectral/commit/dd2a166eff5e11c830d44f33bfc928e06a5c33f7))
- **rulesets:** more consistent messages in OAS ruleset ([#1713](https://github.com/stoplightio/spectral/issues/1713)) ([2899777](https://github.com/stoplightio/spectral/commit/2899777c2bfb2eb0bbfacfa9bea7a0fcbe144be9))

# @stoplight/spectral-cli-v1.0.0 (2021-07-07)

### Features

- **cli:** demand some ruleset to be present ([#1699](https://github.com/stoplightio/spectral/issues/1699)) ([3baba29](https://github.com/stoplightio/spectral/commit/3baba292bd4f318b88299d6de9b75d021b508ace))
- **cli:** implement --stdin-filepath flag ([#1712](https://github.com/stoplightio/spectral/issues/1712)) ([45b15a2](https://github.com/stoplightio/spectral/commit/45b15a2c81561adb8db755b569360ccdf825c97e))
- **core:** support overrides in rulesets ([#1684](https://github.com/stoplightio/spectral/issues/1684)) ([153d685](https://github.com/stoplightio/spectral/commit/153d68557da4bcffd6d2ed2261bcdb6a8324cdb5))
- **ruleset-migrator:** implement ruleset migrator ([#1698](https://github.com/stoplightio/spectral/issues/1698)) ([efa5c50](https://github.com/stoplightio/spectral/commit/efa5c50ace565df089707a5196643d52cc82bad6))
- **ruleset-migrator:** inline external rulesets & support exceptions ([#1711](https://github.com/stoplightio/spectral/issues/1711)) ([2a1d2d3](https://github.com/stoplightio/spectral/commit/2a1d2d3696b54bc009ec7f020185a88c32391c56))
