#
# OW Client
#

$(shell touch /tmp/ow_env)
PATH := node_modules/.bin:$(PATH)
$(shell touch .ow_config; touch /tmp/ow_env )
PROJECT = "OW_CLIENT"
include .ow_config
include /tmp/ow_env
dir = $(shell pwd)
devBuildNumber = $(shell date +%s)
buildNumber= $(shell cat ${dir}/../env/buildnumber)


all: env server

install:
	yarn

#
#	Env Setup
# ------------
env:
	cat ../env/.env.${orgId}.${stage}.sh ../env/env.${orgId}.${stage}.sh > /tmp/ow_env


#update the buildNumber in the env file for RN
update-env-dev:
	echo "\nexport buildNumber=${devBuildNumber}\n" >> /tmp/ow_env

update-env-prod:
	echo "\nexport buildNumber=${buildNumber}\n" >> /tmp/ow_env

#
# eg. make switch orgId="ggmn" stage="development"
#
switch:
	@echo switching to org: ${orgId} for stage: ${stage}
	@echo 'export orgId=${orgId}\nexport stage=${stage}\n' > .ow_config
	@make env
	@echo 'Copying assets across'
	@cp -R ${dir}/src/assets/${orgId}/* ${dir}/android/app/src/main/res/
	@cp -R ${dir}/src/assets/${orgId}/Colors.ts ${dir}/src/utils/Colors.ts
	@cp -R ${dir}/src/assets/${orgId}/NewColors.ts ${dir}/src/utils/NewColors.ts
	@echo 'Copying google-services.json across'
	@cp ${dir}/../env/google-services.${stage}.json ${dir}/android/app/google-services.json


switch-ggmn-dev:
	make switch orgId="ggmn" stage="development"

switch-ggmn-prod:
	make switch orgId="ggmn" stage="production"

switch-mywell-dev:
	make switch orgId="mywell" stage="development"

switch-mywell-prod:
	make switch orgId="mywell" stage="production"


#
#	Development
# ------------

#
# runs the local bundler server
#
server:
	@make env
	# ENVFILE=/tmp/ow_env node node_modules/react-native/local-cli/cli.js start --root ./src/
	ENVFILE=/tmp/ow_env node node_modules/react-native/local-cli/cli.js start \
		--projectRoot ./src/ \
		--watchFolders `pwd` \
		--sourceExts js,ts,tsx,jsx

#
# runs on an android device.
# Server must be running
#
android:
	@make env
	@make update-env-dev
	source /tmp/ow_env && ENVFILE=/tmp/ow_env react-native run-android \
		--no-packager \
		--appIdSuffix ${PACKAGE_NAME_SUFFIX}

android-log:
	@react-native log-android

android-emulator:
	# @ cd ~/Library/Android/sdk/tools/bin/ && ./avdmanager list avd
	# @look for name: Nexus_5X_API_P
	@cd ~/Library/Android/sdk/emulator/ && ./emulator -avd Nexus_5X_API_P

reinstall-node:
	rm -rf node_modules; yarn

clean:
	watchman watch-del-all
	rm -rf /tmp/ow_env
	rm -rf node_modules
	rm -rf /tmp/metro-bundler-cache-*
	rm -rf /tmp/haste-map-react-native-packager-*
	rm -f ${dir}/android/app/src/assets/index.android.bundle
	rm -f ${dir}/android/app/src/assets/index.android.bundle.meta
	touch /tmp/ow_env

clean-android:
	rm -rf android/build
	rm -rf android/app/build

reset-gradle-cache:
	rm -rf ${HOME}/.gradle/caches/

bundle:
	@make env
	@make update-env-prod
	@echo 'Bundling react native'
	source /tmp/ow_env &&  ENVFILE=/tmp/ow_env react-native bundle \
		--platform android \
		--dev false \
		--minify true \
		--entry-file ./src/index.android.js \
		--bundle-output android/app/src/main/assets/index.android.bundle \
		--reset-cache \
		--assets-dest android/app/src/main/res/ \
		--assets-dest android/app/src/main/res/ \
		--sourcemap-output ./sourcemap.js \
		|| exit 1
	rm -f ${dir}/android/app/src/main/res/drawable-mdpi/src*
	rm -f ${dir}/android/app/src/main/res/drawable-mdpi/node*

# Builds without signing - useful for dev builds
build:
	../env/increment_build.sh
	@make env
	@make update-env-dev
	@echo 'Building debug only'
	source ../env/.env.deployment.sh && source /tmp/ow_env  && cd ${dir}/android/ && ENVFILE=/tmp/ow_env ./gradlew app:assembleDebug --stacktrace

# Builds and then signs the .apk
build-production:
	@make env
	@make update-env-prod
	@echo 'Building production only'
	../env/increment_build.sh
	source /tmp/ow_env && source ../env/.env.deployment.sh && cd ${dir}/android/ && ENVFILE=/tmp/ow_env ./gradlew app:assembleRelease --stacktrace
	@echo "signing with key: '${KEYSTORE_PATH}'"
	cd ${dir}/android/app/build/outputs/apk/release/ && jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore ${KEYSTORE_PATH} app-release-unsigned.apk -storepass ${KEYSTORE_PASSWORD} ${KEYSTORE_ALIAS}
	cd ${dir}/android/app/build/outputs/apk/release/ && $(ANDROID_HOME)/build-tools/27.0.3/zipalign -f -v 4 app-release-unsigned.apk app-release-signed-aligned.apk
	cd ${dir}/android/app/build/outputs/apk/release/ && $(ANDROID_HOME)/build-tools/27.0.3/zipalign -c -v 4 app-release-signed-aligned.apk

install-android:
	cd ${dir}/android/app/build/outputs/apk/debug/ && adb install -r app-debug.apk

install-android-production:
	cd ${dir}/android/app/build/outputs/apk/release/ && adb install -r app-release-signed-aligned.apk

build-and-install:
	@make bundle build install-android

build-and-install-production:
	@make bundle build-production install-android-production


get-sha1:
	@echo "alias: ${KEYSTORE_ALIAS} path: ${KEYSTORE_PATH}"
	@keytool -exportcert -list -v -alias ${KEYSTORE_ALIAS} -keystore ${KEYSTORE_PATH} -storepass ${KEYSTORE_PASSWORD}


#
#	Deployment
# ------------

upload-test:
	source ../env/.env.deployment.sh && \
		cd ${dir}/android/fastlane && \
		bundle exec fastlane upload_app_center


.PHONY: server android clean
