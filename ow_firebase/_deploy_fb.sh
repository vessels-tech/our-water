#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"/functions/

if [ ! -f /tmp/ow_firebase_env ]; then
    echo "Couldn't find /tmp/ow_firebase_env"
    echo "Make sure to run `make env` before deploying"
    exit 1
fi

source /tmp/ow_firebase_env


#DO NOT MERGE: temporarily disabled because of internet issues here...
# # set the firebase env variables
firebase functions:config:set \
  config.mywell_legacy_access_token=$MYWELL_LEGACY_ACCESS_TOKEN \
  config.outbound_email_address=$outbound_email_address \
  config.outbound_email_password=$outbound_email_password \
  config.should_send_emails=$should_send_emails \
  config.test_email_whitelist=$test_email_whitelist \
  config.backup_service_account_key_filename=$backup_service_account_key_filename \
  config.backup_bucket_name=$backup_bucket_name \
  config.temporary_admin_access_token=$temporary_admin_access_token \
  config.temporary_admin_user_id=$temporary_admin_user_id 


# deploy
firebase deploy --only functions


# TODO: GCP components? Ref:
# https://firebase.googleblog.com/2017/03/how-to-schedule-cron-jobs-with-cloud.html

#this might help: https://cloud.google.com/community/tutorials/managing-gcp-projects-with-terraform

#cd functions-cron/appengine
#pip install -t lib -r requirements.txt
#gcloud app deploy app.yaml cron.yaml

## Get any remote firebase config
firebase functions:config:get > "$DIR"/functions/.runtimeconfig.json