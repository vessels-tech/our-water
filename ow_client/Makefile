#
# OW Client
#
# SHELL := /bin/bash

PROJECT = "OW_CLIENT"
include .ow_config
dir = $(shell pwd)

all: env server

install:
	yarn

#
# join together env files to set up the ENVFILE
# that react-native-env likes
#
env:
	cat ../env/.env.${orgId}.${stage}.sh ../env/env.${orgId}.${stage}.sh > /tmp/ow_env

#
# eg. make switch orgId="ggmn" stage="development"
#
switch:
	@echo switching to org: ${orgId} for stage: ${stage}
	@echo 'export orgId=${orgId}\nexport stage=${stage}\n' > .ow_config
	@make env


switch-ggmn-dev:
	make switch orgId="ggmn" stage="development"

switch-mywell-dev:
	make switch orgId="mywell" stage="development"

#
# runs the local bundler server
#
server: 
	# export ENVFILE = /tmp/ow_env
	yarn run start

#
# runs on an android device.
# Server must be running
#
android:
	ENVFILE=/tmp/ow_env react-native run-android --config ${dir}/rn-cli.config.js --no-packager

clean:
	rm -rf node_modules


.PHONY: server android clean 