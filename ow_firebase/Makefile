#
# OW Firebase
#

PROJECT = "OW_FIREBASE"

dir = $(shell pwd)

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
	@cd ${dir}/../env/ && source .env.development.sh && cd ${dir}/functions/tools/ && node generate_token.js

rebuild:
	@echo 'rebuilding node'
	cd ${dir} && npm rebuild

deploy:
	@echo 'Deploying Firebase'
	cd ${dir}/../ && ./_deploy_fb.sh