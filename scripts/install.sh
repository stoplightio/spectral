#!/bin/sh


VERSION=${1:-latest};

install () {

set -eu

KERNEL=$(uname -s)
ARCH=$(uname -m)
if [ "$KERNEL" != "Linux" ] && [ "$KERNEL" != "Darwin" ] ; then
  echo "Sorry, KERNEL/Architecture not supported: ${KERNEL}/${ARCH}. Download binary from https://github.com/stoplightio/spectral/releases"
  exit 1
fi

if [ "$ARCH" != "aarch64" ] && [ "$ARCH" != "arm64" ] && [ "$ARCH" != "x86_64" ] ; then
  echo "Sorry, KERNEL/Architecture not supported: ${KERNEL}/${ARCH}. Download binary from https://github.com/stoplightio/spectral/releases"
  exit 1
fi

if [ "$ARCH" = "x86_64" ] ; then
  ARCH="x64"
fi

if [ "$ARCH" = "aarch64" ] ; then
  ARCH="arm64"
fi

OS="macos"
if [ "$KERNEL" = "Linux" ] ; then
  OS="linux"
  if [ -f /etc/os-release ]; then
    # extract the value for KEY named "NAME"
    DISTRO=$(sed -n -e 's/^NAME="\?\([^"]*\)"\?$/\1/p' /etc/os-release)
    if [ "$DISTRO" = "Alpine Linux" ]; then
      echo "Installing on Alpine Linux."
      OS="alpine"
    fi
  fi
fi

FILENAME="spectral-${OS}-${ARCH}"
if [ "$VERSION" = "latest" ] ; then
  URL="https://github.com/stoplightio/spectral/releases/latest/download/${FILENAME}"
else
  URL="https://github.com/stoplightio/spectral/releases/download/v${VERSION}/${FILENAME}"
fi

SRC="$(pwd)/${FILENAME}"
DEST=/usr/local/bin/spectral

STATUS=$(curl -sL -w %{http_code} -o "$SRC" "$URL")
if [ $STATUS -ge 200 ] & [ $STATUS -le 308 ]; then
  mv "$SRC" "$DEST"
  chmod +x "$DEST"
  echo "Spectral was installed to: ${DEST}"
else
  rm "$SRC"
  echo "Error requesting. Download binary from ${URL}"
  exit 1
fi
}

install
