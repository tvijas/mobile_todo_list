# First stage, build the custom JRE
FROM amazoncorretto:23-alpine3.21-jdk AS jre-builder

RUN mkdir /opt/app
COPY src /opt/app
COPY pom.xml /opt/app

WORKDIR /opt/app

ENV MAVEN_VERSION=3.9.9
ENV MAVEN_HOME=/usr/lib/mvn
ENV PATH=$MAVEN_HOME/bin:$PATH

RUN apk update && \
    apk add --no-cache tar binutils

RUN wget http://archive.apache.org/dist/maven/maven-3/$MAVEN_VERSION/binaries/apache-maven-$MAVEN_VERSION-bin.tar.gz && \
  tar -zxvf apache-maven-$MAVEN_VERSION-bin.tar.gz && \
  rm apache-maven-$MAVEN_VERSION-bin.tar.gz && \
  mv apache-maven-$MAVEN_VERSION /usr/lib/mvn

RUN mvn package -DskipTests
RUN jar xvf target/kuby-0.0.1-SNAPSHOT.jar
RUN jdeps --ignore-missing-deps -q  \
    --recursive  \
    --multi-release 23  \
    --print-module-deps  \
    --class-path 'BOOT-INF/lib/*'  \
    target/kuby-0.0.1-SNAPSHOT.jar > modules.txt

# Build small JRE image
RUN $JAVA_HOME/bin/jlink \
         --verbose \
         --add-modules $(cat modules.txt) \
         --strip-debug \
         --no-man-pages \
         --no-header-files \
         --compress=2 \
         --output /optimized-jdk-23

# Second stage, Use the custom JRE and build the app image
FROM alpine:latest
ENV JAVA_HOME=/opt/jdk/jdk-23
ENV PATH="${JAVA_HOME}/bin:${PATH}"

# copy JRE from the base image
COPY --from=jre-builder /optimized-jdk-23 $JAVA_HOME

# Add app user
ARG APPLICATION_USER=spring

# Create a user to run the application, don't run as root
RUN addgroup --system $APPLICATION_USER &&  adduser --system $APPLICATION_USER --ingroup $APPLICATION_USER

# Create the application directory
RUN mkdir /app && chown -R $APPLICATION_USER /app

# Copy the JAR from the builder stage instead of from the host
COPY --from=jre-builder --chown=$APPLICATION_USER:$APPLICATION_USER /opt/app/target/kuby-0.0.1-SNAPSHOT.jar /app/app.jar

WORKDIR /app

USER $APPLICATION_USER

EXPOSE 80
ENTRYPOINT [ "java", "-jar", "/app/app.jar" ]