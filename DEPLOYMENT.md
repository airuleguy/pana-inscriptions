# AWS Lightsail Deployment Guide

This guide explains how to deploy the Pana Inscriptions system to AWS Lightsail.

## Prerequisites

- AWS Account with Lightsail access
- Domain name (optional, for custom domain)
- Basic knowledge of Docker and environment variables

## Environment Variables Configuration

The application now uses individual environment variables for database configuration, making it compatible with AWS Lightsail's managed database services.

**Backward Compatibility**: The system still supports the legacy `DATABASE_URL` format. If `DATABASE_URL` is provided, it takes precedence over individual PostgreSQL variables.

### Required Environment Variables

Create these environment variables in your Lightsail container service:

```bash
# Application Configuration
NODE_ENV=production
PORT=3001

# Database Configuration (AWS Lightsail PostgreSQL)
POSTGRES_HOST=your-postgres-endpoint.amazonaws.com
POSTGRES_PORT=5432
POSTGRES_USER=your-db-username
POSTGRES_PASSWORD=your-secure-db-password
POSTGRES_DB=pana_inscriptions

# Security Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here

# External APIs
FIG_API_URL=https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=

# Frontend Configuration (for Next.js)
NEXT_PUBLIC_API_URL=https://your-container-service.lightsail.aws.com
NEXT_PUBLIC_FIG_API_URL=https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=
```

## AWS Lightsail Setup Steps

### 1. Create PostgreSQL Database

1. Go to AWS Lightsail Console
2. Create a new Database instance
3. Choose PostgreSQL
4. Select appropriate plan (Micro $15/month for development)
5. Create database name: `pana_inscriptions`
6. Note down the endpoint, username, and password

### 2. Create Container Service

1. Create a new Container Service in Lightsail
2. Choose appropriate capacity (Nano $7/month for light usage)
3. Upload your container image or use public deployment

### 3. Configure Container Service

Set the following in your container service configuration:

```yaml
# Container configuration example
containers:
  backend:
    image: your-backend-image
    ports:
      "3001": HTTP
    environment:
      NODE_ENV: "production"
      POSTGRES_HOST: "your-db-endpoint.amazonaws.com"
      POSTGRES_PORT: "5432"
      POSTGRES_USER: "your-username"
      POSTGRES_PASSWORD: "your-password"
      POSTGRES_DB: "pana_inscriptions"
      JWT_SECRET: "your-jwt-secret"
      PORT: "3001"
      FIG_API_URL: "https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname="
  
  frontend:
    image: your-frontend-image
    ports:
      "3000": HTTP
    environment:
      NODE_ENV: "production"
      NEXT_PUBLIC_API_URL: "https://your-backend-service.amazonaws.com"
      NEXT_PUBLIC_FIG_API_URL: "https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname="

publicEndpoint:
  containerName: frontend
  containerPort: 3000
  healthCheck:
    healthyThreshold: 2
    unhealthyThreshold: 2
    timeoutSeconds: 5
    intervalSeconds: 30
    path: "/"
    successCodes: "200-499"
```

## Database Migration

The application will automatically create tables on first run due to TypeORM synchronization in production mode.

**Important Security Note**: In production, consider disabling `synchronize` and use proper database migrations.

## SSL/HTTPS Configuration

AWS Lightsail automatically provides SSL certificates for container services. Your application will be available at:
- `https://your-service-name.region.cs.amazonlightsail.com`

## Monitoring and Logs

- Use Lightsail container service logs for application monitoring
- Set up CloudWatch for advanced monitoring (optional)
- Consider implementing health checks for better reliability

## Cost Optimization

- **Database**: Micro instance (~$15/month)
- **Container Service**: Nano (~$7/month) 
- **Data Transfer**: Usually minimal for small applications
- **Total**: ~$22/month for a small production deployment

## Security Best Practices

1. **Environment Variables**: Never commit secrets to version control
2. **Database**: Use strong passwords and enable connection encryption
3. **JWT Secrets**: Use cryptographically secure random strings
4. **Network**: Lightsail containers are isolated by default
5. **Updates**: Regularly update container images with security patches

## Troubleshooting

### Database Connection Issues
- Verify POSTGRES_HOST points to your Lightsail database endpoint
- Check that database is in the same region as container service
- Ensure database allows connections from container service

### Application Not Starting
- Check container logs in Lightsail console
- Verify all required environment variables are set
- Ensure PORT environment variable matches container port configuration

### Performance Issues
- Monitor container resource usage
- Consider upgrading container service capacity
- Implement caching strategies for FIG API calls (already included)

## Backup Strategy

1. **Database**: Lightsail provides automatic backups
2. **Application**: Store container images in a registry
3. **Configuration**: Keep environment variables documented
4. **Data**: Consider periodic data exports for critical gymnast/choreography data 