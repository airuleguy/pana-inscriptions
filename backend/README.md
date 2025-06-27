# Panamerican Aerobic Gymnastics Tournament - Backend API

NestJS backend API for the tournament registration system with PostgreSQL database and FIG API integration.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Environment Setup

Create a `.env` file in the backend directory:

```env
# Database Configuration
DATABASE_URL=postgresql://pana-inscriptions-rw:SuperSecretOMG@localhost:5432/pana_inscriptions

# Application Settings
NODE_ENV=development
PORT=3001

# FIG API Configuration
FIG_API_URL=https://www.gymnastics.sport/api/athletes.php

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Configuration (if authentication is added later)
JWT_SECRET=your-super-secret-jwt-key-change-in-production
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Run tests
npm test

# Build for production
npm run build
```

## 📚 API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:3001/api
- **Health Check**: http://localhost:3001/health

## 🏗️ Architecture

### Database Schema
- **Gymnasts**: FIG athlete data with caching
- **Choreographies**: Tournament registrations with business rules
- **Many-to-Many**: Gymnasts ↔ Choreographies relationship

### Key Features
- ✅ FIG API integration with caching
- ✅ Business rule validation (4 max per country/category)
- ✅ PostgreSQL with TypeORM
- ✅ Swagger documentation
- ✅ Error handling & logging
- ✅ Health monitoring

### API Endpoints

#### Choreographies
- `GET /api/v1/choreographies` - List all choreographies
- `GET /api/v1/choreographies?country=USA` - Filter by country  
- `POST /api/v1/choreographies` - Create new choreography
- `GET /api/v1/choreographies/:id` - Get specific choreography
- `PATCH /api/v1/choreographies/:id` - Update choreography
- `DELETE /api/v1/choreographies/:id` - Delete choreography
- `GET /api/v1/choreographies/stats/:country` - Country statistics

#### Gymnasts (FIG API Proxy)
- `GET /api/v1/gymnasts` - List all licensed gymnasts
- `GET /api/v1/gymnasts?country=USA` - Filter by country
- `GET /api/v1/gymnasts/:figId` - Get specific gymnast
- `DELETE /api/v1/gymnasts/cache` - Clear cache

#### Health
- `GET /health` - Health check

## 🔧 Configuration

### Database
- Uses PostgreSQL with TypeORM
- Auto-sync in development
- SSL enabled for production
- Connection pooling & retries

### Caching
- FIG API responses cached for 1 hour
- In-memory caching with cache-manager
- Configurable TTL and max items

### Validation
- Global validation pipe with class-validator
- DTO-based request validation
- Business rule enforcement

## 🐳 Docker Support

```bash
# Build image
docker build -t pana-inscriptions-backend .

# Run with docker-compose (recommended)
docker-compose up backend
``` 