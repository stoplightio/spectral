# How to contribute to Spectral

First of all, thanks for considering contributing to Spectral! It's people like you that make tools like Spectral awesome.  

At Stoplight, we want contributing to Spectral to be an enjoyable and educational project for anyone to contribute to. Contributions go beyond commits in pull requests. We are excited to recieve contributions in the form of:
- TODO: content
- TODO: ideas
- TODO: sharing
- TODO: triaging issues
- TODO: reviewing pull requests
- TODO: much more

If you are new to contributing to open source, GitHub has created a helpful guide with lots of resources [here](https://opensource.guide/how-to-contribute/). If you want more help, post in our [forum]() or send us an email to [support@stoplight.io](mailto:support@stoplight.io). We are happy to help you out there. 

Also, to help create an environment where anyone could potentially be welcome to contribute, we have a Code of Conduct that applies to the project and adjacent spaces related to Spectral. 

## Stoplight Community Code of Conduct

The Stoplight Community is dedicated to providing a safe, inclusive, welcoming, and harassment-free space and experience for all community participants, regardless of gender identity and expression, sexual orientation, disability, physical appearance, socioeconomic status, body size, ethnicity, nationality, level of experience, age, religion (or lack thereof), or other identity markers. 

Our Code of Conduct exists because of that dedication, and we do not tolerate harassment in any form. See our reporting guidelines [here](https://github.com/stoplightio/code-of-conduct/blob/master/incident-reporting.md). Our full Code of Conduct can be found at this [link](https://github.com/stoplightio/code-of-conduct/blob/master/long-form-code-of-conduct.md#long-form-code-of-conduct).

## Development

Yarn is a package manager for your code, similar to npm. While you can use npm to use Spectral in your own project, we use yarn for development of Spectral.

1. Install the [yarn](https://yarnpkg.com/lang/en/docs/install/), if you don't already have it on your machine.
2. Fork the [https://github.com/stoplightio/spectral](https://github.com/stoplightio/spectral) repo.
3. Git clone your fork (i.e. git clone https://github.com/<your-username>/spectral.git) to your machine.
4. Run `yarn` to install dependencies and setup the project.
5. Run `git checkout -b [name_of_your_new_branch]` to create a new branch for your work. To help build nicer changelogs, we have a convention for branch names. Please start your branch with either `feature/{branch-name}`, `chore/{branch-name}`, or `fix/{branch-name}`. For example, if I was adding a CLI, I would make my branch name: `feature/add-cli`. 
6. Make changes, write tests, commit, etc. 
7. Run `yarn test.prod` to test your changes.
8. If you have passed existing tests and added tests for new features or fixes, you are ready to make a pull request to the Stoplight repo!

If this is your first Pull Request on GitHub, here's some [help](https://egghead.io/lessons/javascript-how-to-create-a-pull-request-on-github). 

We try to respond to all pull requests and issues within 7 days. 

## Filing an issue

## Support