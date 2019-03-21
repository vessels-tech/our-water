
# Start with newline
export REACT_APP_FB_AUTH_DOMAIN="our-water.firebaseapp.com"
export REACT_APP_FB_DATABASE_URL="https://our-water.firebaseio.com"
export REACT_APP_FB_PROJECT_ID="our-water"
export REACT_APP_FB_STORAGE_BUCKET="our-water.appspot.com"
export REACT_APP_ORG_ID="ggmn" 
export REACT_APP_BASE_URL="https://us-central1-our-water.cloudfunctions.net"
# export REACT_APP_BASE_URL="https://ourwater.localtunnel.me/our-water/us-central1"

#config timeout is in seconds
export REACT_APP_REMOTE_CONFIG_TIMEOUT=10
export REMOTE_CONFIG_DEVELOPER_MODE=true
export ENABLE_LOGGING='true'
export ENABLE_REDUX_LOGGING='false'
export ENABLE_CACHE='true'
export RESOURCE_CACHE_MAX_SIZE=500

export SHOULD_USE_LOCAL_CONFIG='false'
export CONFIG_TYPE='GGMNDevConfig'

export APP_NAME="GGMN Dev"
export PACKAGE_NAME_PREFIX="com.vesselstech"
export PACKAGE_NAME_SUFFIX="ggmn.debug"
export KEYSTORE_PATH="/Users/ldaly/.android/debug.keystore"
export KEYSTORE_ALIAS="androiddebugkey"
export versionCode=`date +%s` #for running locally only. This value is overriden in .env.deployment.sh