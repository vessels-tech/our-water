#
# OW Client
#
# SHELL := /bin/bash

PATH := node_modules/.bin:$(PATH)
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
	@make env
	yarn run start

#
# runs on an android device.
# Server must be running
#
android:
	@make env
	ENVFILE=/tmp/ow_env react-native run-android --config ${dir}/rn-cli.config.js --no-packager

clean:
	rm -rf /tmp/ow_env
	rm -rf node_modules


.PHONY: server android clean 