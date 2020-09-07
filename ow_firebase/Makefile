#
# OW Firebase
#
$(shell touch /tmp/ow_firebase_env)
PROJECT = "OW_FIREBASE"
include .ow_firebase_config
include /tmp/ow_firebase_env 
dir = $(shell pwd)


#
#	Env Setup
# ------------

env:
	cat ../env/.env.firebase.${stage}.sh ../env/env.firebase.${stage}.sh > /tmp/ow_firebase_env

switch:
	@echo switching to stage: ${stage}
	@echo 'export stage=${stage}\n' > .ow_firebase_config
	@make env
	firebase use ${stage}
	@echo 'copying remoteConfigConditions.js across'
	cp ${dir}/../env/remoteConfigConditions.${stage}.js ${dir}/functions/tools/remoteConfigConditions.js
	@echo 'copying .serviceAccountKey.js across'
	cp ${dir}/functions/src/common/.serviceAccountKey.${stage}.js ${dir}/functions/src/common/.serviceAccountKey.js
	@echo 'Getting remote .runtimeconfig.json'
	firebase functions:config:get > ${dir}/functions/.runtimeconfig.json


switch-dev:
	make switch stage="development"

switch-prod:
	make switch stage="production"

#
#	Remote Config
# ------------
	
update-remote-config:
	@echo 'deploying remote config'
	cd ${dir}/functions/tools && gulp deploy_remote_config

get-remote-config:
	@echo 'getting remote config to /tmp/config'
	cd ${dir}/functions/tools && gulp get_remote_config > /tmp/config

#
#	Development
# ------------

hacky_create_syncs:
	@cd ${dir}/../env/ && source .env.development.sh && cd ${dir}/functions/tools/ && gulp upload_readings_from_csv

test_create_reading:
	@cd ${dir}/../env/ && source .env.development.sh && cd ${dir}/functions/tools/ && gulp test_create_reading

migrate:
	@cd ${dir}/../env/ && source .env.development.sh && cd ${dir}/functions/tools/ && gulp run_migrations --migrationTag ${migrationTag}

run-local:
	@echo 'running local firebase'	
	# cd ${dir}/functions && NODE_ENV=local firebase functions:config:get > .runtimeconfig.json
	cd ${dir}/functions && yarn watch & firebase serve --only functions

function-shell:
	@echo running firebase shell
	# EG: 
	# mock wildcards in path, for example: if the path was input/{group}/{id}
	# > userAccountDefaults({'foo': 'bar'}, {params:{userId: 'a1'}})
	firebase functions:shell

watch:
	@cd ${dir}/functions && yarn run watch

run-lt:
	# @lt --subdomain ourwater --port 5000
	@lt --subdomain ourwater --port 5000

get-token:
	@source /tmp/ow_firebase_env && cd ${dir}/functions/tools/ && node generate_token.js

test-unit:
	#TODO: refactor!
	@cd ${dir}/functions; ./_unit_tests.sh

test-service:
	#TODO: refactor!
	@cd ${dir}/functions; ./_service_tests.sh

clean-node:
	@cd ${dir}/functions; rm -rf node_modules

install:
	@cd ${dir}/functions; yarn


#
# Deployment
# ------------

test-and-deploy:
	make test-unit test-service deploy

deploy:
	@echo 'Deploying Firebase'
	@./_deploy_fb.sh

deploy-public:
	@echo 'Deploying Hosting only'
	@firebase deploy --only hosting


deploy-with-tests: test-unit test-service deploy
