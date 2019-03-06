#!/usr/bin/env bash

#TODO: use make
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source /tmp/ow_firebase_env

export BASE_URL="http://localhost:5000/our-water/us-central1"
# export MYWELL_LEGACY_BASE_URL="http://localhost:3000"

export MYWELL_LEGACY_BASE_URL="https://mywell-server.vessels.tech"
# export BASE_URL="https://us-central1-our-water.cloudfunctions.net"
DATE=`date '+%Y%m%dT%H%M%S'`
# export ORG_ID="test_$DATE"
export ORG_ID="test_12348"
# export ORG_ID="mywell"
#TODO: change to a test project
export GOOGLE_CLOUD_PROJECT='our-water'
export SKIP_CLEANUP='true'

#make sure the server is up
curl "$BASE_URL"/org

if [ $? != 0 ];then
  echo "Could not find server at $BASE_URL."
  echo "Make sure it us up and running and try again."
  exit 1
fi

yarn run service