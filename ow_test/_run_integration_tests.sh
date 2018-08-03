#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source "$DIR/../env/.env.sh"

export BASE_URL="http://localhost:5000/our-water/us-central1"
export MYWELL_LEGACY_BASE_URL="http://localhost:3000"
DATE=`date '+%Y%m%dT%H%M%S'`
# export ORG_ID="test_$DATE"
export ORG_ID="test_12345"

#TODO: change to a test project
export GOOGLE_CLOUD_PROJECT='our-water'
export SKIP_CLEANUP='true'

node SyncIntegrationTest.js