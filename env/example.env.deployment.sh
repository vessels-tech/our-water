##These are environment variables required to build and deploy
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_DIR=$DIR


#name: ggmn_beta
export HOCKEY_APP_API_KEY= 

#TODO: move these elsewhere, but for now it's ok here
#only edit this one!
#TODO: How do we change independently for GGMN and MyWell? - just need to move it elsewhere
export publicVersionName=1.0.0
export versionCodeNumber=`node "$ENV_DIR"/versionCode.js "$publicVersionName"`
export buildNumber=`cat "$DIR"/buildnumber`

export versionName="$publicVersionName"."$buildNumber"
#3 digits for each + datetime
#eg. 1.0.1 -> 001 000 001
export versionCode="$versionCodeNumber""$buildNumber"

echo 'Version name is: '"$versionName"
echo 'Version Code is: '"$versionCode"
export betaTag='beta' #beta or empty string

#required for Hockeyapp
# export public_identifier="$beta_tag""$versionName"
# export bundle_short_version="$beta_tag""$versionName"
# export bundle_version="$beta_tag""$versionName"."$buildNumber"


# export APK_PATH="$DIR"/../ow_client/android/app/build/outputs/apk/debug/app-debug.apk
# export APK_PATH="$DIR"/../ow_client/android/app/build/outputs/apk/release/app-release-unsigned.apk
export APK_PATH="$DIR"/../ow_client/android/app/build/outputs/apk/release/app-release-signed-aligned.apk

