#
# OW Translations
# OW Translation manager
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)


all: build parse

build:
	yarn run build

clean:
	rm -rf ${dir}/src/common/*

lazy_build:
	yarn run lazy_build

parse:
	node ./lib/parser.js

.PHONY: build parse