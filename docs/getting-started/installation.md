
# Installation

For many, the easiest way to install Spectral is as a node module. 

```bash
npm install -g @stoplight/spectral
```

If you are a Yarn user:

```bash
yarn global add @stoplight/spectral
```

## Executable binaries

For users without Node and/or NPM/Yarn, we provide standalone packages for [all major platforms](https://github.com/stoplightio/spectral/releases). The quickest way to install the appropriate package for your operating system is via this shell script:

```bash
curl -L https://raw.githack.com/stoplightio/spectral/master/install.sh | sh
```

Note, the binaries do _not_ auto-update, so you will need to run it again to install new versions.

## Docker

Spectral is also available as a Docker image, which can be handy for all sorts of things, like if you're contributing code to Spectral, want to integrate it into your CI build.

```bash
docker run --rm -it stoplight/spectral lint "${url}"`
```

If the file you want to lint is on your computer, you'll need to mount the directory where the file resides as a volume

```bash
docker run --rm -it -v $(pwd):/tmp stoplight/spectral lint "/tmp/file.yaml"
```
