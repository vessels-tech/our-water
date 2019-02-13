#
# OW Firebase
#

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

switch-dev:
	make switch stage="development"

switch-prod:
	make switch stage="production"

#
#	Remote Config
# ------------

update_translations:
	@echo 'pulling translations'
	cd ${dir}/../ow_translations && make 

	@make install_translations
	@make update_remote_config

install_translations:
	@echo 'installing latest packages'
	cd ${dir}/functions && npm install
	
update_remote_config:
	@echo 'deploying remote config'
	cd ${dir}/functions/tools && gulp deploy_remote_config

#
#	Development
# ------------

hacky_create_syncs:
	@cd ${dir}/../env/ && source .env.development.sh && cd ${dir}/functions/tools/ && gulp upload_readings_from_csv

run_local:
	@echo 'running local firebase'	
	cd ${dir}/functions && NODE_ENV=local firebase functions:config:get > .runtimeconfig.json
	cd ${dir}/functions && yarn watch & firebase serve --only functions

function_shell:
	@echo running firebase shell
	# EG: 
	# mock wildcards in path, for example: if the path was input/{group}/{id}
	# > userAccountDefaults({'foo': 'bar'}, {params:{userId: 'a1'}})
	firebase functions:shell

watch:
	@cd ${dir}/functions && yarn run watch

run_lt:
	@lt --subdomain ourwater --port 5000

get_token:
	@source /tmp/ow_firebase_env && cd ${dir}/functions/tools/ && node generate_token.js

test-unit:
	#TODO: refactor!
	@cd ${dir}/functions; ./_unit_tests.sh

test-service:
	#TODO: refactor!
	@cd ${dir}/functions; ./_service_tests.sh


#
# Deployment
# ------------

deploy:
	@echo 'Deploying Firebase'
	cd ${dir}/../ && ./_deploy_fb.sh