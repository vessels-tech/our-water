FROM ruby:alpine

RUN mkdir -p /root/build_tools

RUN apk add --update g++ make bash
RUN gem install fastlane

WORKDIR /root/build_tools

ENTRYPOINT [ "tail", "-f", "/dev/null" ]