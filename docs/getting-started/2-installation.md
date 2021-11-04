# Installation

For many, the easiest way to install Spectral is as a Node module.

```bash
npm install -g @stoplight/spectral-cli
```

If you are a Yarn user:

```bash
yarn global add @stoplight/spectral-cli
```

## Executable Binaries

For users without Node and/or NPM/Yarn, we provide standalone packages for [all major platforms](https://github.com/stoplightio/spectral/releases). The quickest way to install the appropriate package for your operating system is via this shell script:

```bash
curl -L https://raw.github.com/stoplightio/spectral/master/scripts/install.sh | sh
```

Note, the binaries do _not_ auto-update, so you will need to run it again to install new versions.

## Docker

Spectral is also available as a Docker image, which can be useful if you're contributing code to Spectral and want to integrate it into your CI build. If the file you want to lint is on your computer, you'll need to mount the directory where the file resides as a volume.

```bash
# make sure to update the value of `--ruleset` according to the actual location of your ruleset
docker run --rm -it -v $(pwd):/tmp stoplight/spectral lint --ruleset "/tmp/.spectral.js" "/tmp/file.yaml"
```

To use the docker image on GitLab you need to set `entrypoint` to `""`:

```yml
stages:
  - validate

validate_open-api:
  stage: validate
  image:
    name: stoplight/spectral
    entrypoint: [""]
  script:
    - spectral lint file.yaml
```

For more details about `entrypoint: [""]` see this issue on GitLab [here](https://gitlab.com/gitlab-org/gitlab-runner/-/issues/2692#note_50147081)
