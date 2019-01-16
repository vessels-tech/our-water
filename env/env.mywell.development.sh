
# Start with newline
export REACT_APP_ORG_ID="mywell"
export REACT_APP_FB_AUTH_DOMAIN="our-water.firebaseapp.com"
export REACT_APP_FB_DATABASE_URL="https://our-water.firebaseio.com"
export REACT_APP_FB_PROJECT_ID="our-water"
export REACT_APP_FB_STORAGE_BUCKET="our-water.appspot.com"
export REACT_APP_BASE_URL="https://us-central1-our-water.cloudfunctions.net"

#config timeout is in seconds
export REACT_APP_REMOTE_CONFIG_TIMEOUT=10
export REMOTE_CONFIG_DEVELOPER_MODE=true
export ENABLE_LOGGING='true'
export ENABLE_RENDER_LOGGING='true'
export ENABLE_REDUX_LOGGING='false'
export ENABLE_CACHE='false'

#Remote config setup
export SHOULD_USE_LOCAL_CONFIG='true'

#Just for now, as we are still sorting this out.
export CONFIG_TYPE='MyWellDevConfig'

export APP_NAME="MyWell Dev"
export PACKAGE_NAME_PREFIX="com.vesselstech"
export PACKAGE_NAME_SUFFIX="mywell.debug"
export KEYSTORE_PATH="/Users/ldaly/.android/debug.keystore"
export KEYSTORE_ALIAS="androiddebugkey"