# 🐕 DogMate - Dog Breeding Platform

A modern, full-stack web application connecting dog owners and breeders. Find the perfect breeding match for your dog with our intelligent matching algorithm, real-time messaging, and interactive map features.

![PawMatch Banner](./docs/images/banner.png)

## 🌟 Overview

DogMate is a comprehensive platform designed to help dog owners find suitable breeding partners for their pets. The application features advanced search filters, AI-powered matching suggestions, real-time chat, and location-based discovery.

### Key Features

- 🔐 **Secure Authentication** - JWT-based auth with secure session management
- 🐕 **Dog Profiles** - Detailed listings with photos, health info, and pedigree
- 🔍 **Smart Search** - Filter by breed, age, gender, location, and more
- 💕 **Intelligent Matching** - Algorithm-based breeding match suggestions
- 🗺️ **Map Discovery** - Find dogs near you with interactive maps
- 💬 **Real-time Chat** - Instant messaging between dog owners
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

## 📁 Project Structure

```text
dogMate/
├── frontend/          # Next.js 14 React application
├── backend/           # Node.js Express API server
├── docs/              # Documentation and assets
│   ├── images/        # Screenshots and diagrams
│   ├── api/           # API documentation
│   └── guides/        # User and developer guides
├── docker-compose.yml # Full-stack Docker configuration
├── .gitignore         # Git ignore rules
├── LICENSE            # MIT License
└── README.md          # This file
```

| Directory | Description |
| ---------- | ------------ |
| frontend/ | Next.js 14 application with TypeScript, Tailwind CSS, and Zustand |
| backend/ | Express.js API with TypeScript, Prisma ORM, and PostgreSQL |
| docs/ | Project documentation, diagrams, and guides |

## 🛠️ Tech Stack

### Frontend

Next.js 14 (App Router)
TypeScript
Tailwind CSS
Zustand (State Management)
Socket.io Client
Leaflet (Maps)
React Hook Form + Zod

### Backend

Node.js + Express
TypeScript
Prisma ORM
PostgreSQL
Socket.io
JWT Authentication
Multer (File Uploads)

### Infrastructure

Docker + Docker Compose
Nginx (Production)
GitHub Actions (CI/CD)

## 🚀 Quick Start

### Prerequisites

Node.js >= 18.0.0
npm >= 9.0.0
PostgreSQL >= 14.0
Docker (optional)

## Option 1: Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/pawmatch.git
cd pawmatch

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# Start all services
docker-compose up -d

# Run database migrations
docker-compose exec backend npx prisma migrate deploy

# Seed the database (optional)
docker-compose exec backend npx prisma db seed
```

The application will be available at:

Frontend: <http://localhost:3000>
Backend API: <http://localhost:5000>
API Documentation: <http://localhost:5000/api/docs>

## Option 2: Manual Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/pawmatch.git
cd pawmatch

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Backend (```bash backend/.env```):

```bash
env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/pawmatch"
JWT_SECRET=your-secret-key
CORS_ORIGIN=http://localhost:3000
```

Frontend (```bash frontend/.env.local```):

```bash
env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

### 3. Set Up Database

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

## 📚 Documentation

| Document | Description |
| ---------- | ------------ |
| Frontend README | Frontend setup, components, and architecture |
| Backend README | API documentation, database schema, and endpoints |
| API Reference | Complete API endpoint documentation |
| Deployment Guide | Production deployment instructions |
| Contributing Guide | Guidelines for contributors |

## 🏗️ Architecture

```text
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│    Frontend     │────▶│    Backend      │────▶│   PostgreSQL    │
│    (Next.js)    │     │    (Express)    │     │    Database     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │
        │                       │
        ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│   Socket.io     │◀───▶│  File Storage   │
│   (Real-time)   │     │   (Uploads)     │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
```

## Data Flow

1. User Interface - Next.js frontend handles user interactions
2. API Layer - Express backend processes requests and business logic
3. Database - PostgreSQL stores all persistent data via Prisma ORM
4. Real-time - Socket.io enables instant messaging and notifications
5. Storage - Local/cloud storage for user uploads and images

## 🐳 Docker Configuration

### Development

```bash
yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:5000/api
    depends_on:
      - backend

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/pawmatch
    depends_on:
      - db

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=pawmatch
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
  ```

## Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Access database
docker-compose exec db psql -U postgres -d pawmatch
```

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm run test          # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

### End-to-End Tests

```bash
# Run Cypress E2E tests
npm run test:e2e

# Open Cypress UI
npm run cypress:open
```

## 📦 Deployment

### Production Build

```bash
# Build frontend
cd frontend
npm run build

# Build backend
cd backend
npm run build
```

### Environment Variables (Production)

Backend:

```bash
env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@host:5432/pawmatch
JWT_SECRET=your-production-secret
CORS_ORIGIN=https://yourdomain.com
```

Frontend:

```bash
env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_SOCKET_URL=https://api.yourdomain.com
```

## Deployment Options

| Platform | Frontend | Backend |
| Vercel | ✅ Recommended | ❌ |
| Railway | ✅| ✅ Recommended |
| Render | ✅| ✅ |
| AWS | ✅| ✅ |
| DigitalOcean | ✅ | ✅ |
| Docker | ✅| ✅ |

## 🤝 Contributing

We welcome contributions! Please see our Contributing Guide for details.

## Development Workflow

1. Fork the repository
2. Create a feature branch (git checkout -b feature/amazing-feature)
3. Make your changes
4. Run tests (npm test)
5. Commit your changes (git commit -m 'Add amazing feature')
6. Push to the branch (git push origin feature/amazing-feature)
7. Open a Pull Request

### Code Style

Use TypeScript for all new code
Follow ESLint and Prettier configurations
Write meaningful commit messages
Add tests for new features
Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

Next.js - React framework
Tailwind CSS - CSS framework
Prisma - Database ORM
Socket.io - Real-time communication
Leaflet - Interactive maps

## 📞 Support

📧 Email: <support@pawmatch.com>
🐛 Issues: GitHub Issues
💬 Discussions: GitHub Discussions

## 📊 Project Status

Build Status

License

Version

Made with ❤️ by the PawMatch Team

Website • Documentation • Twitter
