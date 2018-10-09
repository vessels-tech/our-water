#!/usr/bin/env bash

#Run from fastline inside of docker
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_DIR="$DIR"/env

ORG="ggmn"
STAGE="development"

##TODO: change this depending on the stage
cat "$ENV_DIR"/.env."$ORG"."$STAGE".sh "$ENV_DIR"/.env."$ORG"."$STAGE".sh > /tmp/"$STAGE"
export ENVFILE=/tmp/"$STAGE"

#TODO: clean up images

# react-native bundle --platform android --dev false --entry-file ./src/index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ || exit 1

cd "$DIR"/android/
./gradlew assembleDebug

cd "$DIR"/android/app/build/outputs/apk/debug/
adb install app-debug.apk