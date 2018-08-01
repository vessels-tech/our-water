#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"/ow_firebase/functions/

##TODO: set separate project
source "$DIR/env/.env.test.sh"

# set the firebase env variables
firebase functions:config:set config.mywell_legacy_access_token=$MYWELL_LEGACY_ACCESS_TOKEN

# deploy
firebase deploy --only functions