#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

#set the env variables
source ../env/.env.sh
env | grep REACT_APP
#start the local server
yarn start

