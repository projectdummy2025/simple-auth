# Simple Authentication Project

A full-stack authentication system built with a **Docker-first** philosophy, ensuring consistent development and deployment environments. This project features a Node.js/Express backend, a React/Vite frontend, and a PostgreSQL database, all orchestrated via Docker Compose.

## 🚀 Project Overview

The architecture consists of three main services:
1.  **Frontend**: A React application built with Vite, served via Nginx (production-ready build).
2.  **Backend**: A Node.js Express API handling authentication (JWT), user management, and database interactions.
3.  **Database**: A PostgreSQL instance for persistent data storage.

All services are containerized, meaning **no local dependencies** (like Node.js or PostgreSQL) are required on your host machine other than Docker itself.

## 🛠️ Technology Stack

*   **Backend**: Node.js v20 (Alpine), Express.js, `pg` (PostgreSQL client), `bcryptjs`, `jsonwebtoken`.
*   **Frontend**: React 18, Vite, Nginx (Alpine).
*   **Database**: PostgreSQL 15 (Alpine).
*   **Infrastructure**: Docker, Docker Compose.

## 📋 Prerequisites

Ensure you have the following installed on your machine:

*   **Docker Engine** (v20.10+)
*   **Docker Compose** (v2.0+)

*Note: You do NOT need Node.js, npm, or PostgreSQL installed locally.*

## ⚡ Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd simple-auth
    ```

2.  **Environment Configuration:**
    The project comes with a shared `.env` file. Ensure it exists and contains the necessary variables (see [Environment Variables](#-environment-variables) below).
    *   *Note: For this project, a default `.env` is provided for convenience.*

3.  **Start the Application:**
    Build and start all containers:
    ```bash
    docker compose up --build
    ```
    *   The `--build` flag ensures that any changes to Dockerfiles or dependencies are applied.
    *   To run in the background (detached mode), use `docker compose up -d --build`.

4.  **Access the Application:**
    *   **Frontend**: [http://localhost:3000](http://localhost:3000)
    *   **Backend API**: [http://localhost:8000](http://localhost:8000)

5.  **Stop the Application:**
    ```bash
    docker compose down
    ```
    *   To stop and remove volumes (reset database): `docker compose down -v`

## 🔧 Environment Variables

The `.env` file configures both the backend and database.

| Variable | Description | Default Value |
| :--- | :--- | :--- |
| `DB_HOST` | Hostname of the database service | `postgres` |
| `DB_PORT` | Database port | `5432` |
| `DB_NAME` | Database name | `simple_auth_db` |
| `DB_USER` | Database user | `admin` |
| `DB_PASSWORD` | Database password | `admin0123` |
| `JWT_SECRET` | Secret key for signing tokens | `supersecret_jwt_key` |
| `BACKEND_PORT` | Port mapped for Backend | `8000` |
| `FRONTEND_PORT` | Port mapped for Frontend | `3000` |

## 📡 API Endpoints

### Authentication

*   **POST** `/auth/register`
    *   Registers a new user.
    *   **Body**: `{ "username": "user1", "email": "test@test.com", "password": "password123" }`
*   **POST** `/auth/login`
    *   Authenticates a user and returns a JWT.
    *   **Body**: `{ "username": "user1", "password": "password123" }`
*   **GET** `/auth/me`
    *   Returns the currently authenticated user's profile.
    *   **Headers**: `Authorization: Bearer <token>`

## 🐛 Troubleshooting

Common issues and solutions (see `setup_document/error_recording.md` for full logs):

1.  **"Connection reset by peer" on Frontend (Port 3000)**
    *   **Cause**: Nginx configuration port mismatch.
    *   **Fix**: Ensure `nginx.conf` listens on port `80`, as Docker Compose maps host `3000` -> container `80`.

2.  **Backend Crash: "Cannot read properties of undefined (reading 'connect')"**
    *   **Cause**: Volume mount issue causing backend to run stale code.
    *   **Fix**: Ensure `docker-compose.yml` mounts `./backend/src:/app` (not `/app/src`).

3.  **Database Connection Failed**
    *   **Cause**: Missing `.env` variables or incorrect `DB_HOST`.
    *   **Fix**: `DB_HOST` must match the service name in `docker-compose.yml` (e.g., `postgres`), not `localhost`.

## 👨‍💻 Development Workflow

1.  **Making Changes**:
    *   **Backend**: Edit files in `backend/src`. The container volume mount (`./backend/src:/app`) ensures changes are reflected inside the container (requires `nodemon` for auto-restart, currently configured).
    *   **Frontend**: Edit files in `frontend/src`. *Note: Since the frontend is currently served via Nginx (production build), you must rebuild the container (`docker compose up --build`) to see changes.*

2.  **Rebuilding**:
    *   Always run `docker compose up --build` if you install new dependencies (`package.json`) or modify `Dockerfile`/`nginx.conf`.