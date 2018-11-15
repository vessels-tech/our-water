#
# OW Types
# Common types for OW Projects
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)


all: parse build

build:
	yarn run build

clean:
	rm -rf ${dir}/src/common/*

lazy_build:
	yarn run lazy_build

.PHONY: build