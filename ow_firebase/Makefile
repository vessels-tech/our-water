#
# OW Firebase
#

PROJECT = "OW_FIREBASE"

dir = $(shell pwd)

update_translations:
	@echo 'pulling translations'
	cd ${dir}/../ow_translations && make 

	@echo 'installing latest packages'
	cd ${dir}/functions && npm install

	@make update_remote_config
	
update_remote_config:
	@echo 'deploying remote config'
	cd ${dir}/functions/tools && gulp deploy_remote_config

run_local:
	@echo 'running local firebase'	
	cd ${dir}/functions && NODE_ENV=local firebase functions:config:get > .runtimeconfig.json
	cd ${dir}/functions && yarn watch & firebase serve --only functions

rebuild:
	@echo 'rebuilding node'
	cd ${dir} && npm rebuild

deploy:
	@echo 'Deploying Firebase'
	cd ${dir}/../ && ./_deploy_fb.sh