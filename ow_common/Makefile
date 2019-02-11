#
# OW Types
# Common types for OW Projects
#

PATH := node_modules/.bin:$(PATH)
dir = $(shell pwd)


all: build update

build:
	yarn run build

clean:
	rm -rf ${dir}/src/common/*


update: 
	git commit -am "update types" ; git push ; git log | head -1

.PHONY: build