text

---

# Backend README.md

```markdown
# 🐕 PawMatch - Dog Breeding Platform (Backend)

RESTful API backend for PawMatch - a platform connecting dog owners and breeders. Built with Node.js, Express, TypeScript, and Prisma.

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [API Documentation](#-api-documentation)
- [Authentication](#-authentication)
- [File Uploads](#-file-uploads)
- [Real-time Features](#-real-time-features)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication with refresh tokens
- 👤 **User Management** - Registration, login, profile management
- 🐕 **Dog CRUD** - Full dog listing management
- 🔍 **Advanced Search** - Filter and search with pagination
- 📍 **Geocoding** - Automatic address to coordinates conversion
- 💬 **Real-time Messaging** - Socket.io powered chat
- 💕 **Matching Algorithm** - Intelligent breeding match suggestions
- 📁 **File Uploads** - Image upload with validation
- 🛡️ **Security** - Rate limiting, CORS, helmet protection

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| [Node.js](https://nodejs.org/) | JavaScript runtime |
| [Express](https://expressjs.com/) | Web framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript |
| [Prisma](https://www.prisma.io/) | ORM and database toolkit |
| [PostgreSQL](https://www.postgresql.org/) | Primary database |
| [Socket.io](https://socket.io/) | Real-time communication |
| [JWT](https://jwt.io/) | Authentication tokens |
| [Multer](https://github.com/expressjs/multer) | File uploads |
| [Zod](https://zod.dev/) | Schema validation |
| [bcryptjs](https://github.com/dcodeIO/bcrypt.js) | Password hashing |

## 📦 Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **PostgreSQL** >= 14.0
- **Redis** (optional, for caching)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/pawmatch-backend.git
cd pawmatch-backend
2. Install dependencies
bash
npm install
3. Set up environment variables
bash
cp .env.example .env
Edit .env with your configuration (see Environment Variables).

4. Set up the database
bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
5. Run the development server
bash
npm run dev
Server will start at http://localhost:5000.

📁 Project Structure
text
pawmatch-backend/
├── prisma/                       # Prisma ORM
│   ├── migrations/               # Database migrations
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Database seeder
├── src/
│   ├── config/                   # Configuration files
│   │   ├── database.ts           # Prisma client instance
│   │   ├── cors.ts               # CORS configuration
│   │   └── socket.ts             # Socket.io configuration
│   ├── controllers/              # Route controllers
│   │   ├── authController.ts     # Authentication logic
│   │   ├── dogController.ts      # Dog CRUD operations
│   │   ├── matchingController.ts # Matching algorithm
│   │   ├── messageController.ts  # Messaging logic
│   │   └── reviewController.ts   # Review management
│   ├── middleware/               # Express middleware
│   │   ├── auth.ts               # JWT authentication
│   │   ├── errorHandler.ts       # Global error handler
│   │   ├── rateLimiter.ts        # Rate limiting
│   │   ├── upload.ts             # File upload config
│   │   └── validate.ts           # Request validation
│   ├── routes/                   # API routes
│   │   ├── authRoutes.ts         # /api/auth/*
│   │   ├── dogRoutes.ts          # /api/dogs/*
│   │   ├── matchingRoutes.ts     # /api/matching/*
│   │   ├── messageRoutes.ts      # /api/messages/*
│   │   └── index.ts              # Route aggregator
│   ├── services/                 # Business logic
│   │   ├── authService.ts        # Auth operations
│   │   ├── matchingService.ts    # Matching algorithm
│   │   └── emailService.ts       # Email sending
│   ├── utils/                    # Utility functions
│   │   ├── geocoding.ts          # Address geocoding
│   │   ├── helpers.ts            # Helper functions
│   │   └── validators.ts         # Validation schemas
│   ├── types/                    # TypeScript types
│   │   └── index.ts              # Type definitions
│   ├── app.ts                    # Express app setup
│   └── server.ts                 # Server entry point
├── uploads/                      # Uploaded files (git ignored)
├── logs/                         # Application logs (git ignored)
├── scripts/                      # Utility scripts
│   └── backfillCoordinates.ts    # Geocode existing dogs
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── setup.ts                  # Test configuration
├── .env.example                  # Example environment variables
├── .env                          # Environment variables (git ignored)
├── .eslintrc.json                # ESLint configuration
├── .gitignore                    # Git ignore rules
├── Dockerfile                    # Docker configuration
├── docker-compose.yml            # Docker Compose config
├── nodemon.json                  # Nodemon configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # This file
🔐 Environment Variables
Create a .env file in the root directory:

env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pawmatch?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# File Uploads
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880  # 5MB in bytes
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/webp

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@pawmatch.com

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Geocoding
GEOCODING_ENABLED=true
GEOCODING_RATE_LIMIT=1000  # ms between requests

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
Variable	Description	Required	Default
NODE_ENV	Environment mode	No	development
PORT	Server port	No	5000
DATABASE_URL	PostgreSQL connection string	Yes	-
JWT_SECRET	JWT signing secret	Yes	-
JWT_EXPIRES_IN	JWT expiration time	No	7d
CORS_ORIGIN	Allowed CORS origin	No	*
UPLOAD_DIR	File upload directory	No	uploads
MAX_FILE_SIZE	Max upload size in bytes	No	5242880
🗄️ Database Setup
Prisma Schema
prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  firstName String
  lastName  String
  role      Role     @default(USER)
  phone     String?
  avatar    String?
  verified  Boolean  @default(false)
  
  address   String?
  city      String?
  county    String?
  postcode  String?
  country   String   @default("UK")
  
  dogs      Dog[]
  sentMessages      Message[] @relation("SentMessages")
  receivedMessages  Message[] @relation("ReceivedMessages")
  reviews   Review[]
  conversations Conversation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}

model Dog {
  id          String   @id @default(cuid())
  name        String
  breed       String
  gender      Gender
  dateOfBirth DateTime
  age         Int
  weight      Float
  color       String
  description String   @db.Text
  images      String[]
  mainImage   String?
  
  // Health Info
  vaccinated      Boolean  @default(false)
  neutered        Boolean  @default(false)
  vetName         String?
  vetContact      String?
  medicalHistory  String?  @db.Text
  
  // Pedigree
  registered          Boolean  @default(false)
  registrationNumber  String?
  registry            String?
  sire                String?
  dam                 String?
  
  // Breeding
  available           Boolean  @default(true)
  studFee             Float?
  studFeeNegotiable   Boolean  @default(false)
  previousLitters     Int      @default(0)
  temperament         String[]
  
  // Location
  address   String?
  city      String
  county    String
  postcode  String?
  country   String   @default("UK")
  latitude  Float?
  longitude Float?
  
  status    Status   @default(PENDING)
  views     Int      @default(0)
  favorites Int      @default(0)
  
  owner     User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
  ownerId   String
  
  reviews   Review[]
  conversations Conversation[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("dogs")
}

enum Role {
  USER
  ADMIN
}

enum Gender {
  MALE
  FEMALE
}

enum Status {
  ACTIVE
  INACTIVE
  PENDING
}
Database Commands
bash
# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name your_migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database
npx prisma migrate reset

# Open Prisma Studio (GUI)
npx prisma studio

# Seed database
npx prisma db seed
📚 API Documentation
Base URL
text
http://localhost:5000/api
Authentication Endpoints
Method	Endpoint	Description	Auth Required
POST	/auth/register	Register new user	No
POST	/auth/login	User login	No
GET	/auth/me	Get current user	Yes
PUT	/auth/profile	Update profile	Yes
POST	/auth/upload-avatar	Upload avatar	Yes
POST	/auth/refresh-token	Refresh JWT	No
POST	/auth/logout	Logout user	Yes
Register User
http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+44 20 1234 5678"
}
Response:

json
{
  "success": true,
  "user": {
    "id": "clj1234567890",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
Login
http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
Dog Endpoints
Method	Endpoint	Description	Auth Required
GET	/dogs	Get all dogs (paginated)	No
GET	/dogs/my-dogs	Get user's dogs	Yes
GET	/dogs/:id	Get dog by ID	No
POST	/dogs	Create new dog	Yes
PUT	/dogs/:id	Update dog	Yes
DELETE	/dogs/:id	Delete dog	Yes
POST	/dogs/:id/images	Upload images	Yes
Get All Dogs
http
GET /api/dogs?page=1&limit=12&breed=labrador&gender=male&city=london
Query Parameters:

Parameter	Type	Description
page	number	Page number (default: 1)
limit	number	Items per page (default: 12)
breed	string	Filter by breed
gender	string	Filter by gender (male/female)
minAge	number	Minimum age
maxAge	number	Maximum age
city	string	Filter by city
county	string	Filter by county
available	boolean	Filter by breeding availability
Response:

json
{
  "success": true,
  "dogs": [
    {
      "id": "clj1234567890",
      "name": "Max",
      "breed": "Golden Retriever",
      "gender": "MALE",
      "age": 3,
      "city": "London",
      "county": "Greater London",
      "available": true,
      "owner": {
        "id": "clj0987654321",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "total": 50,
  "page": 1,
  "totalPages": 5
}
Create Dog
http
POST /api/dogs
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Max",
  "breed": "Golden Retriever",
  "gender": "male",
  "dateOfBirth": "2021-06-15",
  "age": 3,
  "weight": 30.5,
  "color": "Golden",
  "description": "Friendly and well-trained golden retriever...",
  "city": "London",
  "county": "Greater London",
  "vaccinated": true,
  "neutered": false,
  "available": true,
  "studFee": 500,
  "temperament": ["Friendly", "Playful", "Good with kids"]
}
Matching Endpoints
Method	Endpoint	Description	Auth Required
GET	/matching/:dogId/matches	Get matches for dog	Yes
GET	/matching/:dogId/stats	Get matching stats	Yes
Get Matches
http
GET /api/matching/clj1234567890/matches?limit=20&minScore=50
Authorization: Bearer <token>
Response:

json
{
  "success": true,
  "matches": [
    {
      "dog": {
        "id": "clj0987654321",
        "name": "Bella",
        "breed": "Golden Retriever"
      },
      "score": 85,
      "breakdown": {
        "breedScore": 100,
        "ageScore": 80,
        "locationScore": 75,
        "healthScore": 85
      }
    }
  ],
  "total": 15
}
Message Endpoints
Method	Endpoint	Description	Auth Required
GET	/messages/conversations	Get all conversations	Yes
GET	/messages/conversations/:id	Get conversation messages	Yes
POST	/messages/conversations/:id	Send message	Yes
POST	/messages/conversations	Start new conversation	Yes
Error Responses
All endpoints return consistent error responses:

json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
Common HTTP Status Codes:

Code	Description
200	Success
201	Created
400	Bad Request
401	Unauthorized
403	Forbidden
404	Not Found
422	Validation Error
429	Too Many Requests
500	Internal Server Error
🔐 Authentication
JWT Token Flow
User logs in with credentials
Server validates and returns JWT token
Client stores token (localStorage/cookie)
Client sends token in Authorization header
Server validates token on protected routes
Middleware Usage
typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
📁 File Uploads
Multer Configuration
typescript
// middleware/upload.ts
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG and WebP allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
});

export default upload;
Usage in Routes
typescript
// routes/dogRoutes.ts
import upload from '../middleware/upload';

router.post(
  '/:id/images',
  protect,
  upload.array('images', 10),
  uploadDogImages
);
🔌 Real-time Features
Socket.io Setup
typescript
// config/socket.ts
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';

export const setupSocket = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join user's room
    socket.on('join', (userId: string) => {
      socket.join(userId);
      console.log(`User ${userId} joined their room`);
    });

    // Handle new message
    socket.on('sendMessage', (data: { receiverId: string; message: any }) => {
      io.to(data.receiverId).emit('newMessage', data.message);
    });

    // Handle typing indicator
    socket.on('typing', (data: { conversationId: string; userId: string }) => {
      socket.to(data.conversationId).emit('userTyping', data.userId);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};
Server Integration
typescript
// server.ts
import express from 'express';
import { createServer } from 'http';
import { setupSocket } from './config/socket';

const app = express();
const httpServer = createServer(app);
const io = setupSocket(httpServer);

// Make io available in routes
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
📜 Available Scripts
bash
# Development
npm run dev           # Start with nodemon (hot reload)
npm run dev:debug     # Start with debug mode

# Building
npm run build         # Compile TypeScript
npm run start         # Run compiled code

# Database
npm run db:generate   # Generate Prisma client
npm run db:migrate    # Run migrations
npm run db:push       # Push schema changes
npm run db:seed       # Seed database
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset database

# Code Quality
npm run lint          # Run ESLint
npm run lint:fix      # Fix ESLint errors
npm run type-check    # Run TypeScript compiler
npm run format        # Format with Prettier

# Testing
npm run test          # Run tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run with coverage

# Utilities
npm run clean         # Clean build artifacts
npm run backfill:coords # Backfill dog coordinates
🧪 Testing
Running Tests
bash
# Run all tests
npm run test

# Run with coverage
npm run test:coverage

# Run specific test file
npm run test -- --grep "Auth"
Example Test
typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import app from '../../src/app';
import prisma from '../../src/config/database';

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject duplicate email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'Test',
          lastName: 'User',
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already exists');
    });
  });
});
🚀 Deployment
Docker
dockerfile
# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
COPY . .
RUN npm run build
RUN npx prisma generate

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

RUN mkdir -p uploads logs

EXPOSE 5000
CMD ["npm", "start"]
Docker Compose
yaml
# docker-compose.yml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/pawmatch
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads
      - ./logs:/app/logs

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
Production Deployment
bash
# Build and deploy
docker-compose -f docker-compose.prod.yml up -d

# Run migrations
docker-compose exec api npx prisma migrate deploy

# View logs
docker-compose logs -f api
Railway/Render Deployment
Connect your GitHub repository
Set environment variables
Set build command: npm run build && npx prisma migrate deploy
Set start command: npm start
📊 Monitoring & Logging
Winston Logger Setup
typescript
// utils/logger.ts
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
🤝 Contributing
Fork the repository
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request
Code Style
Use TypeScript for all files
Follow ESLint configuration
Write tests for new features
Document API changes
📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

📞 Support
📧 Email: api-support@pawmatch.com
📖 API Docs: api.pawmatch.com/docs
💬 Discord: Join our community
Made with ❤️ by the PawMatch Team