FROM xmartlabs/android AS android

FROM ruby:alpine

COPY --from=android ${ANDROID_HOME} ${ANDROID_HOME}
COPY --from=android /usr/lib/jvm/java-8-oracle /usr/lib/jvm/java-8-oracle
COPY --from=android /usr/bin/gradle /usr/bin/gradle

ENV ANDROID_HOME /opt/android-sdk-linux
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle
ENV PATH ${PATH}:${ANDROID_HOME}/tools:${ANDROID_HOME}/platform-tools

RUN apk add --update g++ make bash
RUN gem install fastlane

RUN mkdir -p /root/build_tools
RUN printf 'export LC_ALL=en_US.UTF-8\nexport LANG=en_US.UTF-8\n' > ~/.bashrc

WORKDIR /root/build_tools
ENTRYPOINT [ "tail", "-f", "/dev/null" ]