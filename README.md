# Simple Authentication Project

This is a full Docker-based authentication system with separate frontend and backend services.

## Technology Stack
- Backend: Node.js (Express)
- Frontend: Vite (React)
- Database: PostgreSQL
- Containerization: Docker & Docker Compose

## Prerequisites
- Docker
- Docker Compose

## Setup Instructions
1. Clone the repository
2. Navigate to the project directory
3. Run `docker compose up --build` to start the application

## Services
- Frontend: Available at http://localhost:3000
- Backend: Available at http://localhost:8000
- Database: PostgreSQL on port 5432 (internal only)

## Development Workflow
- All development happens within containers
- Use `docker compose up` for development with hot-reload enabled
- Volume mappings allow real-time code updates

## API Endpoints
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Authenticate user
- `GET /auth/me` - Get current user info (requires valid JWT)