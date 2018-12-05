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

	@echo 'deploying remote config'
	cd ${dir}/functions/tools && gulp deploy_remote_config
	