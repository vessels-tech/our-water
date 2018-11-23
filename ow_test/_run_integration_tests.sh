#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/../env/.env.sh"

if [ "$1" == 'local' ]; then
  echo 'running integration tests against local environment'
  export BASE_URL="http://localhost:5000/our-water/us-central1"
  export MYWELL_LEGACY_BASE_URL="http://localhost:3000"
else 
  echo 'running integration tests against dev environment'
  # Settings for running against local MyWell, public OW
  export BASE_URL="https://us-central1-our-water.cloudfunctions.net"
  # export MYWELL_LEGACY_BASE_URL="https://legacymywell.localtunnel.me"
  export MYWELL_LEGACY_BASE_URL="https://mywell.vessels.tech"
fi

DATE=`date '+%Y%m%dT%H%M%S'`
# export ORG_ID="test_$DATE"
# export ORG_ID="test_12345"
export ORG_ID="mywell"

#TODO: change to a test project
export GOOGLE_CLOUD_PROJECT='our-water'
export SKIP_CLEANUP='true'

node SyncIntegrationTest.js