# Build stage
FROM eclipse-temurin:24-jdk-alpine AS build

WORKDIR /app

# Installer dos2unix pour convertir les fins de ligne
RUN apk add --no-cache dos2unix

# Copier les fichiers Maven
COPY mvnw .
COPY pom.xml .
COPY .mvn .mvn

# Convertir les fins de ligne et rendre exécutable
RUN dos2unix mvnw && chmod +x mvnw

# Télécharger les dépendances
RUN ./mvnw dependency:go-offline -B

# Copier le code source
COPY src src

# Build
RUN ./mvnw clean package -DskipTests

# Runtime stage (image plus légère)
FROM eclipse-temurin:24-jre-alpine

WORKDIR /app

COPY --from=build /app/target/demo-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8081

CMD ["java", "-jar", "app.jar"]