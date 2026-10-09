# Stage 1: Build the Spring Boot backend application using Maven and OpenJDK 21
FROM maven:3.9.6-eclipse-temurin-21-alpine AS build
WORKDIR /app

# Copy backend pom.xml and source code
COPY backend/pom.xml .
COPY backend/src ./src

# Package the application (skip tests for faster deployment)
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime environment
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the compiled JAR artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Dynamic port handled via application.properties ${PORT:8080}
EXPOSE 8080

# Run the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
