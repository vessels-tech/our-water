#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#Run the mywell-ui container to finish the build step, and save to s3
BUILD_IMAGE_NAME="mywell-console"

if [ -z "$STAGE" ]; then
  STAGE=local
fi

source $DIR/../env/env$STAGE.sh
#sourcing seems to change the dir.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"


#build - use the overide file to ensure we build webpack
# rm -rf /tmp/www && mkdir /tmp/www
# docker-compose -f "$DIR"/../docker-compose.ui.yml up mywell-ui || exit 1

#we can't use docker-compose as we don't want to mount the volumes
mkdir -p /tmp/www
docker rm -f "$BUILD_IMAGE_NAME"
docker run --rm \
  -e SERVER_URL \
  -e VERSION_NUMBER \
  -e REACT_APP_GRAPHQL_ENDPOINT \
  -v /tmp/console:/usr/src/app/build \
  --name "$BUILD_IMAGE_NAME" mywell-console:local

ls -la /tmp/console

#if this fails, its ok - we can do it later on
aws s3 sync /tmp/console s3://"$CONSOLE_DOMAIN_NAME"

exit 0
