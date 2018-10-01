#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

##TODO: change this depending on the stage
export ENVFILE="$DIR"/../env/.env.sh

# react-native bundle --platform android --dev false --entry-file ./src/index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res/ || exit 1

cd "$DIR"/android/
./gradlew assembleDebug

cd "$DIR"/android/app/build/outputs/apk/debug/
adb install app-debug.apk