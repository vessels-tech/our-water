#!/usr/bin/env bash

export BASE_URL="http://localhost:5000/our-water/us-central1"
# export BASE_URL="https://us-central1-our-water.cloudfunctions.net"
export ORG_ID="12345"
#TODO: change to a test project
export GOOGLE_CLOUD_PROJECT='our-water'

./node_modules/mocha/bin/mocha