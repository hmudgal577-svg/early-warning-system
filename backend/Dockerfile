# ─────────────────────────────────────────────────────────────────────────────
#  SIH 26001 — EWS-NER Backend Dockerfile
#  Multi-stage build: Maven + JDK 21 for compile, slim JRE 21 for runtime
# ─────────────────────────────────────────────────────────────────────────────

# Stage 1 — Build (Maven included in image — no wrapper needed)
FROM maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Cache Maven dependency layer separately from source code
# (invalidates only when pom.xml changes, not on every source change)
COPY pom.xml .
RUN mvn dependency:go-offline -B -q

# Copy sources and build
COPY src ./src
RUN mvn package -DskipTests -B -q

# Stage 2 — Runtime (slim JRE only, no compiler/Maven)
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# Security: run as non-root user
RUN addgroup -S ewsgroup && adduser -S ewsuser -G ewsgroup
USER ewsuser

# Copy the fat JAR from builder stage
COPY --from=builder /app/target/early-warning-system-*.jar app.jar

EXPOSE 8080

# Entropy fix for faster SecureRandom, container-aware JVM memory limits
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-jar", "app.jar"]
