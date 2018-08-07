#!/usr/bin/env bash
node --version

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR/ow_firebase/functions && npm rebuild
