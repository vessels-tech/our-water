#!/usr/bin/env bash

#TODO: use make
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/../../env/.env.mywell.development.sh"

export BASE_URL="http://localhost:5000/our-water/us-central1"
# export MYWELL_LEGACY_BASE_URL="http://localhost:3000"

export MYWELL_LEGACY_BASE_URL="https://mywell-server.vessels.tech"
# export BASE_URL="https://us-central1-our-water.cloudfunctions.net"
DATE=`date '+%Y%m%dT%H%M%S'`
# export ORG_ID="test_$DATE"
export ORG_ID="mywell"
# export ORG_ID="test_12346"
#TODO: change to a test project
export GOOGLE_CLOUD_PROJECT='our-water'
export SKIP_CLEANUP='true'

yarn run service