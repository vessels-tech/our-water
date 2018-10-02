#!/usr/bin/env bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

STAGE="ggmn_dev"

##TODO: change this depending on the stage
cat "$DIR"/../env/.env."$STAGE".sh "$DIR"/../env/"$STAGE".env.sh > /tmp/"$STAGE"
export ENVFILE=/tmp/"$STAGE"


react-native run-android --config "$DIR"/rn-cli.config.js --no-packager