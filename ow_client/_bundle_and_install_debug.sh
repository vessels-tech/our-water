#!/usr/bin/env/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd "$DIR"/android/
./gradlew assembleDebug

cd "$DIR"/android/app/build/outputs/apk/debug/
adb install app-debug.apk