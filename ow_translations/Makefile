#
# OW Translations
# OW Translation manager
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)


all: build parse

build:
	yarn run build

parse:
	node ./lib/parser.js

.PHONY: build parse