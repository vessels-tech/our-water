#
# OW Client
#

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
	watchman watch-del-all
	rm -rf /tmp/ow_env
	rm -rf node_modules
	rm -rf /tmp/metro-bundler-cache-*
	rm -rf /tmp/haste-map-react-native-packager-*

build:
	@make env
	@echo 'Building debug only'
	../env/increment_build.sh
	source ../env/.env.deployment.sh && cd ${dir}/android/ && ENVFILE=/tmp/ow_env ./gradlew assembleDebug

build-production:
	@make env
	# @echo 'Building production only'
	# ../env/increment_build.sh
	# source ../env/.env.deployment.sh && cd ${dir}/android/ && ENVFILE=/tmp/ow_env ./gradlew assembleRelease
	@echo 'signing with debug key'
	cd ${dir}/android/app/build/outputs/apk/release/ && jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ~/.android/debug.keystore  app-release-unsigned.apk -storepass android androiddebugkey

install-android:
	cd ${dir}/android/app/build/outputs/apk/debug/ && adb install app-debug.apk

install-android-production:
	cd ${dir}/android/app/build/outputs/apk/release/ && adb install app-release-unsigned.apk

build-and-install:
	@make build install-android

hockey:
	source ../env/.env.deployment.sh && \
		cd ${dir}/android/fastlane && \
		fastlane upload_hockey


.PHONY: server android clean 