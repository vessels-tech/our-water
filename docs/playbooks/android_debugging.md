# Android Debugging

A collection of snippets to help debugging Android

## Android react-native setup

```
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

remote debugger
https://stackoverflow.com/questions/40898934/unable-to-connect-with-remote-debugger



`I solved it doing adb reverse tcp:8081 tcp:8081 and then reload on my phone.`

point to our react-native-maps
"react-native-maps": "https://github.com/lewisdaly/react-native-maps.git#7142cc618bd8fcc5df24221cb2c1fb64d5880750",


## handy
```bash
#allow tunnel
adb reverse tcp:8081 tcp:8081

#present devtools menu
adb shell input keyevent 82
```

## launch avd from command line

```bash
cd ~/Library/Android/sdk/tools/bin/
./avdmanager list avd

#look for name: Nexus_5X_API_P

cd ../../emulator
./emulator -avd Nexus_5X_API_P

```

https://medium.com/@drorbiran/the-full-react-native-layout-cheat-sheet-a4147802405c
