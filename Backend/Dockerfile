FROM maven:3.9.9-eclipse-temurin-17 AS builder
WORKDIR /workspace

COPY pom.xml ./
COPY registry ./registry
COPY gateway ./gateway
COPY user-service ./user-service
COPY course-service ./course-service
COPY order-service ./order-service
COPY assignment-service ./assignment-service
COPY community-service ./community-service

ARG MODULE
RUN mvn -pl ${MODULE} -am clean package -DskipTests \
    && JAR_FILE=$(find ${MODULE}/target -maxdepth 1 -type f -name "*.jar" ! -name "*original*.jar" | head -n 1) \
    && test -n "$JAR_FILE" \
    && cp "$JAR_FILE" /tmp/app.jar

FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=builder /tmp/app.jar /app/app.jar

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
