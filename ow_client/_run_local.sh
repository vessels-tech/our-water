#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

##TODO: change this depending on the stage
export ENVFILE="$DIR"/../env/.env.sh

#TODO: be less lazy
react-native run-android