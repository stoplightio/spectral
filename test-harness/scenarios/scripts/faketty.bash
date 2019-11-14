#!/bin/bash

script -qfec "$(printf "%q " "$@")" /dev/null
