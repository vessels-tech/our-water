#
# OW Types
# Common types for OW Projects
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)


all: build

build:
	yarn run build

clean:
	rm -rf ${dir}/src/common/*

.PHONY: build