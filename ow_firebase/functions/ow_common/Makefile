#
# OW Types
# Common types for OW Projects
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)
NPM_VERSION_NUMBER := $(shell node ./tools/getVersionNumber.js)


all: build publish update

install:
	yarn

switch-dev:
	cp ${dir}/src/test/.serviceAccountKey.development.json ${dir}/src/test/.serviceAccountKey.json

switch-prod:
	cp ${dir}/src/test/.serviceAccountKey.production.json ${dir}/src/test/.serviceAccountKey.json

build:
	@make test-unit
	yarn run build

type-check:
	yarn run type-check

build-watch:
	yarn run type-check:watch

test-unit:
	@make type-check
	yarn run unit

test-service:
	@make type-check
	yarn run service


publish:
	# TODO: look into using npm patch instead!
	@echo 'Publishing $(NPM_VERSION_NUMBER) to NPM!'
	npm publish
	git tag $(NPM_VERSION_NUMBER)
	git push origin $(NPM_VERSION_NUMBER)


update:
	cd ${dir}/../ow_client && yarn add ow_common
	cd ${dir}/../ow_firebase/functions && yarn add ow_common


.PHONY: build