
# Start with newline
export REACT_APP_ORG_ID="mywell"
export REACT_APP_FB_AUTH_DOMAIN="our-water-dev.firebaseapp.com"
export REACT_APP_FB_DATABASE_URL="https://our-water-dev.firebaseio.com"
export REACT_APP_FB_PROJECT_ID="our-water-dev"
export REACT_APP_FB_STORAGE_BUCKET="our-water-dev.appspot.com"
export REACT_APP_BASE_URL="https://us-central1-our-water-dev.cloudfunctions.net"

#config timeout is in seconds
export REACT_APP_REMOTE_CONFIG_TIMEOUT=10
export REMOTE_CONFIG_DEVELOPER_MODE=true
export ENABLE_LOGGING='true'
export ENABLE_RENDER_LOGGING='false'
export ENABLE_REDUX_LOGGING='false'
export ENABLE_CACHE='true'
export RESOURCE_CACHE_MAX_SIZE=350
export PLACE_API_BASE_URL="https://nominatim.openstreetmap.org/search"

#Remote config setup
export SHOULD_USE_LOCAL_CONFIG='true'

#Just for now, as we are still sorting this out.
export CONFIG_TYPE='MyWellDevConfig'

export APP_NAME="MyWell Dev"
export PACKAGE_NAME_PREFIX="com.vesselstech"
export PACKAGE_NAME_SUFFIX="mywell.debug" #TD change this back
export KEYSTORE_PATH="/Users/ldaly/.android/debug.keystore"
export KEYSTORE_ALIAS="androiddebugkey"
export SERVICE_ACCOUNT_KEY_FILENAME=".service_account.development.json"

export versionCode=`date +%s` #for running locally only. This value is overriden in .env.deployment.sh