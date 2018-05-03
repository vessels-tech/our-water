#!/usr/bin/env bash

cd ~/Library/Android/sdk/tools/bin/
./avdmanager list avd

#look for name: Nexus_5X_API_P

cd ../../emulator
./emulator -avd Nexus_5X_API_P