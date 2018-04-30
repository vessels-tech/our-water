#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

#This is the org id for mywell. I'm not sure if we will end up controlling it here or elsewhere,
#but this will do for now.
export REACT_APP_ORG_ID="YccAYRrMjdwa0VFuwjVi"

source $DIR/.env.sh