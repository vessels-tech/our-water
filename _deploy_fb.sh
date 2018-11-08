#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"/ow_firebase/functions/

##TODO: set separate project
source "$DIR/env/.env.test.sh"

# set the firebase env variables
firebase functions:config:set \
  config.mywell_legacy_access_token=$MYWELL_LEGACY_ACCESS_TOKEN \
  config.outbound_email_address=$outbound_email_address \
  config.outbound_email_password=$outbound_email_password \
  config.should_send_emails=$should_send_emails \
  config.test_email_whitelist=$test_email_whitelist

# deploy
firebase deploy --only functions


# TODO: GCP components? Ref:
# https://firebase.googleblog.com/2017/03/how-to-schedule-cron-jobs-with-cloud.html

#this might help: https://cloud.google.com/community/tutorials/managing-gcp-projects-with-terraform

#cd functions-cron/appengine
#pip install -t lib -r requirements.txt
#gcloud app deploy app.yaml cron.yaml

## Get any remote firebase config
firebase functions:config:get > "$DIR"/ow_firebase/functions/.runtimeconfig.json