#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

STAGE="ggmn_dev"

##TODO: change this depending on the stage
cat "$DIR"/../env/.env."$STAGE".sh "$DIR"/../env/"$STAGE".env.sh > /tmp/"$STAGE"
export ENVFILE=/tmp/"$STAGE"

#TODO: clean up images

# react-native bundle --platform android --dev false --entry-file ./src/index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ || exit 1

cd "$DIR"/android/
./gradlew assembleDebug

cd "$DIR"/android/app/build/outputs/apk/debug/
adb install app-debug.apk