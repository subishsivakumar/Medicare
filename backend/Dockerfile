# Stage 1: Build the application using Maven and OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy project descriptor and source files
COPY pom.xml .
COPY src ./src

# Package the application (skip tests for faster deployment)
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime environment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the compiled JAR artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Spring Boot default port (Render dynamically provides $PORT)
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
