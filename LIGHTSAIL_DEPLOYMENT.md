# AWS Lightsail Container Service Deployment Guide

This guide walks you through deploying the Pana Inscriptions application to AWS Lightsail using Docker images from Docker Hub.

## Prerequisites

- **Docker Hub Account**: Create account at [hub.docker.com](https://hub.docker.com)
- **AWS Account**: With Lightsail access
- **Docker Desktop**: Installed and running on your local machine
- **AWS CLI** (optional): For command-line deployment

## Step 1: Prepare Docker Images

### 1.1 Set Your Docker Hub Username

```bash
export DOCKER_USERNAME=your-docker-hub-username
```

### 1.2 Build and Push Images

Run the deployment script:

```bash
./deploy.sh
```

This script will:
- Build optimized production Docker images
- Push them to Docker Hub
- Generate Lightsail configuration file

**Manual Alternative:**

```bash
# Build backend
docker build -t your-username/pana-inscriptions-backend:latest ./backend
docker push your-username/pana-inscriptions-backend:latest

# Build frontend  
docker build -t your-username/pana-inscriptions-frontend:latest ./frontend
docker push your-username/pana-inscriptions-frontend:latest
```

## Step 2: Create PostgreSQL Database in Lightsail

1. Go to [AWS Lightsail Console](https://lightsail.aws.amazon.com/)
2. Click **"Create database"**
3. Choose **PostgreSQL**
4. Select plan (Micro $15/month recommended for development)
5. Database name: `pana_inscriptions`
6. Master username: `pana_admin` (or your choice)
7. Create a strong master password
8. **Important**: Note down the endpoint, username, and password

## Step 3: Create Container Service

1. In Lightsail Console, click **"Create container service"**
2. Choose capacity:
   - **Nano ($7/month)**: 512 MB RAM, 0.25 vCPUs - Good for testing
   - **Micro ($10/month)**: 1 GB RAM, 0.5 vCPUs - Recommended for production
3. Service name: `pana-inscriptions`

## Step 4: Configure Container Service

### Option A: Using Lightsail Console (Recommended)

1. In your container service, click **"Create your first deployment"**
2. Choose **"Specify a custom deployment"**

**Backend Container:**
- Container name: `backend`
- Image: `your-username/pana-inscriptions-backend:latest`
- Open ports: `3001` → `HTTP`
- Environment variables:
  ```
  NODE_ENV=production
  PORT=3001
  POSTGRES_HOST=ls-abc123.region.rds.amazonaws.com
  POSTGRES_PORT=5432
  POSTGRES_USER=pana_admin
  POSTGRES_PASSWORD=your-database-password
  POSTGRES_DB=pana_inscriptions
  JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
  FIG_API_URL=https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=
  ```

**Frontend Container:**
- Container name: `frontend`
- Image: `your-username/pana-inscriptions-frontend:latest`
- Open ports: `3000` → `HTTP`
- Environment variables:
  ```
  NODE_ENV=production
  NEXT_PUBLIC_API_URL=https://pana-inscriptions.region.cs.amazonlightsail.com
  NEXT_PUBLIC_FIG_API_URL=https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=
  ```

**Public Endpoint:**
- Container: `frontend`
- Port: `3000`
- Health check path: `/`

### Option B: Using AWS CLI

1. Update `lightsail-container-config.json` with your values
2. Deploy:

```bash
aws lightsail create-container-service-deployment \
  --service-name pana-inscriptions \
  --cli-input-json file://lightsail-container-config.json
```

## Step 5: Update Environment Variables

After deployment, you'll need to update the frontend's `NEXT_PUBLIC_API_URL` to point to your actual backend endpoint.

1. Get your container service URL (e.g., `https://pana-inscriptions.us-east-1.cs.amazonlightsail.com`)
2. Update frontend environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://pana-inscriptions.us-east-1.cs.amazonlightsail.com
   ```
3. Redeploy the frontend container

## Step 6: Verify Deployment

1. **Check Container Logs**: Monitor deployment in Lightsail console
2. **Test Backend Health**: Visit `https://your-service.cs.amazonlightsail.com/health`
3. **Test Frontend**: Visit your main service URL
4. **Database Connection**: Check backend logs for successful DB connection

## Step 7: Configure Custom Domain (Optional)

1. In Lightsail console, go to your container service
2. Click **"Custom domains"** tab
3. Add your domain and configure DNS
4. SSL certificate is automatically provided

## Troubleshooting

### Common Issues

**Backend Not Starting:**
- Check environment variables are set correctly
- Verify database endpoint and credentials
- Check container logs for specific errors

**Frontend Can't Connect to Backend:**
- Ensure `NEXT_PUBLIC_API_URL` points to correct backend endpoint
- Verify backend is accessible at `/health` endpoint

**Database Connection Failed:**
- Check `POSTGRES_HOST` matches your Lightsail database endpoint
- Verify database user has correct permissions
- Ensure database and container service are in same region

**Container Build Failures:**
- Verify Docker images were pushed successfully to Docker Hub
- Check Dockerfile syntax and build locally first
- Ensure image names match exactly in configuration

### Logs and Monitoring

Access logs in Lightsail Console:
1. Go to Container service
2. Click on "Deployments" or "Logs" tab
3. Select container to view logs

## Security Best Practices

1. **Strong Passwords**: Use complex database and JWT passwords
2. **Environment Variables**: Never commit secrets to version control
3. **Database Access**: Database is only accessible from container service
4. **HTTPS**: All traffic is encrypted via Lightsail's SSL
5. **Regular Updates**: Keep Docker images updated with security patches

## Cost Optimization

**Estimated Monthly Costs:**
- Container Service (Micro): $10/month
- PostgreSQL Database (Micro): $15/month  
- Data Transfer: ~$1-2/month for light usage
- **Total**: ~$26-27/month

**Cost Reduction Tips:**
- Use Nano container service ($7/month) for development
- Monitor data transfer usage
- Consider Lightsail load balancer only if needed

## Updating Your Application

To deploy updates:

1. **Build and Push New Images:**
   ```bash
   ./deploy.sh
   ```

2. **Update Deployment:**
   - In Lightsail console, create new deployment
   - Or use AWS CLI with updated configuration

3. **Zero-Downtime Updates:**
   - Lightsail performs rolling updates automatically
   - Old containers stay running until new ones are healthy

## Backup and Recovery

1. **Database Backups**: Lightsail provides automatic daily backups
2. **Container Images**: Stored in Docker Hub
3. **Manual Backup**: Create database snapshot before major updates
4. **Recovery**: Restore from snapshot or redeploy from Docker images

## Next Steps

1. Set up monitoring and alerting
2. Configure automated deployments with GitHub Actions
3. Implement proper database migrations
4. Add application performance monitoring
5. Set up log aggregation for better debugging

## Support Resources

- [AWS Lightsail Documentation](https://docs.aws.amazon.com/lightsail/)
- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [NestJS Production Guide](https://docs.nestjs.com/) 