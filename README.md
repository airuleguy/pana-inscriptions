# Panamerican Aerobic Gymnastics Tournament Registration System

A full-stack TypeScript application for registering choreographies in the Panamerican Aerobic Gymnastics Championship.

## 🏆 Overview

This system allows country representatives to register choreographies for the tournament, with integration to the official FIG (Fédération Internationale de Gymnastique) athlete database.

### Key Features

- **✅ FIG API Integration**: Backend proxy with caching for FIG gymnast database
- **✅ Multi-Gymnast Choreographies**: Support for 1, 2, 3, 5, or 8 gymnasts per routine
- **✅ Category Management**: Auto-determined Youth, Junior, and Senior categories
- **✅ Registration Limits**: Maximum 4 choreographies per country per category validation
- **✅ Auto-naming**: Choreography names generated from gymnast surnames
- **✅ Persistent Storage**: PostgreSQL database for registered choreographies
- **✅ Business Rules**: Server-side validation of tournament rules
- **✅ API Documentation**: Full Swagger/OpenAPI documentation
- **✅ Real-time Registration**: Complete registration workflow with feedback

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **UI Library**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **State**: Session storage caching

### Backend
- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL with TypeORM
- **Validation**: class-validator
- **Documentation**: Swagger/OpenAPI

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Yarn package manager

### Installation

1. **Clone and setup**:
```bash
cd pana-inscriptions
```

2. **Database setup**:
```bash
# Start PostgreSQL database
docker-compose up database -d
```

3. **Backend setup**:
```bash
cd backend
npm install

# Create .env.local file with database configuration
cat > .env.local << EOF
# Local Development Environment Configuration
NODE_ENV=development

# Database Configuration (individual variables for AWS Lightsail compatibility)
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=pana-inscriptions-rw
POSTGRES_PASSWORD=SuperSecretOMG
POSTGRES_DB=pana-inscriptions-db

# Security Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Server Configuration
PORT=3001

# External APIs
FIG_API_URL=https://www.gymnastics.sport/api/athletes.php?function=searchLicenses&discipline=AER&country=&idlicense=&lastname=
EOF

# Start backend server
npm run start:dev
```

4. **Frontend setup**:
```bash
cd frontend
npm install
npm run dev
```

5. **Access the application**:
- **Frontend**: http://localhost:3000
- **Registration Page**: http://localhost:3000/register
- **Test Page**: http://localhost:3000/test
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api

## 📁 Project Structure

```
pana-inscriptions/
├── frontend/          # Next.js application
├── backend/           # NestJS API
├── docs/             # Documentation
└── docker-compose.yml # Local development setup
```

## 🌍 FIG API Integration

The system integrates with the official FIG athlete database:
- **Endpoint**: `https://www.gymnastics.sport/api/athletes.php`
- **Discipline**: Aerobic Gymnastics (AER)
- **Caching**: Backend in-memory caching (1 hour TTL)
- **Validation**: Real-time license verification
- **Proxy**: All FIG API calls go through the backend for rate limiting and caching

## ✅ What's Implemented

### Backend API (NestJS + PostgreSQL)
- ✅ **FIG API Service**: Proxy and cache FIG athlete data
- ✅ **Choreography CRUD**: Full create, read, update, delete operations
- ✅ **Business Rules**: Registration limits, gymnast validation
- ✅ **Database Schema**: PostgreSQL with TypeORM
- ✅ **API Documentation**: Swagger/OpenAPI at `/api`
- ✅ **Health Monitoring**: Health check endpoint
- ✅ **Error Handling**: Structured error responses
- ✅ **Validation**: Request/response validation with DTOs

### Frontend Application (Next.js + Shadcn/ui)
- ✅ **Gymnast Selector**: Search and select licensed gymnasts
- ✅ **Registration Form**: Complete choreography registration workflow
- ✅ **Real-time Validation**: Client-side form validation
- ✅ **API Integration**: Communicates with backend API
- ✅ **Responsive Design**: Mobile-friendly UI
- ✅ **Test Interface**: Test page for FIG API integration
- ✅ **Registration Interface**: Full registration page at `/register`

### Database & Infrastructure
- ✅ **PostgreSQL**: Persistent data storage
- ✅ **Docker Compose**: Development environment setup
- ✅ **TypeORM**: Database ORM with auto-migrations
- ✅ **Entity Relationships**: Gymnast ↔ Choreography many-to-many
- ✅ **UUID Primary Keys**: Scalable unique identifiers

## 📋 Business Rules

1. **Gymnast Selection**: Only licensed AER gymnasts from FIG database
2. **Team Composition**: 1, 2, 3, 5, or 8 gymnasts per choreography
3. **Category Assignment**: Based on oldest gymnast's age
4. **Registration Limits**: Up to 10 choreographies max per country per category (varies by tournament type)
5. **Naming Convention**: Surnames joined with hyphens (e.g., "SMITH-JONES-BROWN")

## 🏃‍♀️ Development

### Frontend Development
```bash
cd frontend
yarn dev          # Start development server
yarn build        # Production build
yarn lint         # Lint code
```

### Backend Development
```bash
cd backend
yarn start:dev    # Start development server
yarn test         # Run tests
yarn test:cov     # Test coverage
```

## 🌐 Environment Variables

The system uses individual environment variables for database configuration, making it compatible with AWS Lightsail and other cloud providers:

### Backend Environment Variables
- `NODE_ENV`: Application environment (development/production)
- `PORT`: Backend server port (default: 3001)
- `POSTGRES_HOST`: PostgreSQL database host
- `POSTGRES_PORT`: PostgreSQL database port (default: 5432)
- `POSTGRES_USER`: PostgreSQL database username
- `POSTGRES_PASSWORD`: PostgreSQL database password
- `POSTGRES_DB`: PostgreSQL database name
- `JWT_SECRET`: Secret key for JWT tokens
- `FIG_API_URL`: URL for the FIG API

### Frontend Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API URL
- `NEXT_PUBLIC_FIG_API_URL`: Frontend FIG API URL

### AWS Lightsail Deployment
For AWS Lightsail deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md).

## 📚 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api
- **API Docs**: http://localhost:3001/api-json

## 🤝 Contributing

1. Follow the existing code patterns
2. Ensure tests pass
3. Update documentation as needed
4. Follow conventional commit messages

## 📄 License

Private project for Panamerican Aerobic Gymnastics Championship. 