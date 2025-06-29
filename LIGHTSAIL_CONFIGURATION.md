# AWS Lightsail Configuration Guide

This guide explains how to configure the pana-inscriptions system for deployment on AWS Lightsail using environment variables for secure database configuration.

## Overview

The application has been refactored to follow the same configuration pattern as gymnastics-api, using:
- Centralized configuration in `src/config/config.ts`
- Environment variables for all sensitive data
- No hardcoded credentials in the source code

## Environment Variables

### Required Environment Variables

Set these environment variables in your Lightsail container configuration:

```bash
# Environment
NODE_ENV=production

# Database Configuration (from Lightsail Database)
POSTGRES_HOST=your-lightsail-database-endpoint.com
POSTGRES_PORT=5432
POSTGRES_USER=your-database-username
POSTGRES_PASSWORD=your-database-password
POSTGRES_DB=your-database-name

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=30d

# Application
PORT=3001

# FIG API Configuration
FIG_API_BASE_URL=https://www.gymnastics.sport/api
FIG_API_ATHLETES_ENDPOINT=/athletes.php
FIG_API_COACHES_ENDPOINT=/coaches.php
FIG_API_JUDGES_ENDPOINT=/judges.php
FIG_API_TIMEOUT=30000

# Cache Configuration
CACHE_TTL=3600
CACHE_MAX=100
```

## Lightsail Setup Steps

### 1. Create Lightsail Database

1. Go to AWS Lightsail console
2. Create a new database instance
3. Choose PostgreSQL
4. Select appropriate size for your needs
5. Note down the connection details (endpoint, port, username, password, database name)

### 2. Create Lightsail Container Service

1. Create a new container service in Lightsail
2. Choose appropriate power and scale settings
3. Configure the container with your Docker image

### 3. Configure Environment Variables

In your Lightsail container service configuration, add the environment variables:

```yaml
# Container configuration
containers:
  pana-inscriptions:
    image: your-registry/pana-inscriptions:latest
    ports:
      "3001": HTTP
    environment:
      NODE_ENV: production
      POSTGRES_HOST: your-lightsail-db-endpoint.amazonaws.com
      POSTGRES_PORT: "5432"
      POSTGRES_USER: your-db-username
      POSTGRES_PASSWORD: your-db-password
      POSTGRES_DB: your-db-name
      JWT_SECRET: your-super-secret-jwt-key
      JWT_EXPIRES_IN: 30d
      PORT: "3001"
      FIG_API_BASE_URL: https://www.gymnastics.sport/api
      FIG_API_ATHLETES_ENDPOINT: /athletes.php
      FIG_API_COACHES_ENDPOINT: /coaches.php
      FIG_API_JUDGES_ENDPOINT: /judges.php
      FIG_API_TIMEOUT: "30000"
      CACHE_TTL: "3600"
      CACHE_MAX: "100"
publicEndpoint:
  containerName: pana-inscriptions
  containerPort: 3001
  healthCheck:
    path: /health
```

## Security Considerations

### Database Security
- Database credentials are provided via environment variables
- SSL is automatically enabled in production mode
- Connection retries are configured for reliability

### JWT Security
- Use a strong, unique JWT secret
- JWT tokens expire after 30 days by default
- Secret is provided via environment variables

### API Security
- FIG API configuration is externalized
- Timeout values are configurable
- Rate limiting and error handling are implemented

## Configuration Architecture

The application uses a centralized configuration pattern:

1. **Central Config**: `src/config/config.ts` exports all configuration
2. **Database Config**: `src/config/database.config.ts` retrieves config from ConfigService
3. **Service Integration**: All services use ConfigService to access configuration
4. **Environment Loading**: ConfigModule loads the configuration function globally

## Benefits of This Approach

1. **Security**: No hardcoded credentials in source code
2. **Flexibility**: Easy to configure different environments
3. **Maintainability**: Centralized configuration management
4. **Scalability**: Configuration can be managed via container orchestration
5. **Compliance**: Follows AWS security best practices

## Troubleshooting

### Database Connection Issues
- Verify database endpoint and credentials
- Check security group settings
- Ensure database is accessible from container service

### Environment Variable Issues
- Verify all required variables are set
- Check for typos in variable names
- Ensure numeric values are properly formatted

### Application Startup Issues
- Check logs for configuration errors
- Verify JWT secret is set
- Confirm database migrations run successfully

## Monitoring and Logging

The application includes:
- Health check endpoint at `/health`
- Structured logging for all operations
- Error handling with appropriate HTTP status codes
- Cache metrics for FIG API operations

## Migration from Docker Compose

If migrating from local Docker Compose setup:
1. Export environment variables from docker-compose.yml
2. Update database connection details for Lightsail
3. Configure container service with new environment variables
4. Deploy and test connectivity 