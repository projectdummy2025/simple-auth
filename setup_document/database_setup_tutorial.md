# TUTORIAL: Phase 2 - Database Setup (Docker-Native)

This tutorial explains how to complete Phase 2 of the development plan: Database Setup (Docker-Native).

## Tasks to Complete:
1. Test PostgreSQL container connectivity
2. Configure database schema for user authentication
3. Test database persistence with Docker volumes

## STEP 1: BUILD AND START THE POSTGRESQL CONTAINER

To test PostgreSQL container connectivity, you'll need to use the docker compose.yml file that was already created in Phase 1. The PostgreSQL service is defined with the following properties from your `.env` file:

- Image: postgres:15-alpine
- Port mapping: `${POSTGRES_PORT:-5432}:5432` (typically 5432)
- Database Name: `${DB_NAME}` (set to `simple_auth_db` in .env)
- Database User: `${DB_USER}` (set to `auth_user` in .env)
- Database Password: `${DB_PASSWORD}` (set to `auth_password` in .env)
- Connection URL: `${DB_URL}` (set to `postgresql://auth_user:auth_password@postgres:5432/simple_auth_db` in .env)
- Persistent volume: postgres_data for data persistence
- Initialization script: init.sql mounted at /docker-entrypoint-initdb.d/init.sql
- Healthcheck to verify the database is ready

From your project root directory (`/home/fedora/projects/simple-auth`), run:
```
docker compose up --build postgres
```

This will start only the PostgreSQL database service. The `--build` flag ensures the latest configuration is used.

## STEP 2: VERIFY CONNECTION TO DATABASE

Open another terminal and verify that the database is running and accessible:

Check if the container is running:
```
docker ps
```

Connect to the PostgreSQL container using:
```
docker exec -it simple-auth-postgres-1 psql -U ${DB_USER} -d ${DB_NAME}
```

Or using the database client of your choice with these credentials from your .env file:
- Host: localhost (when accessing from outside container)
- Port: ${POSTGRES_PORT:-5432} (or whatever POSTGRES_PORT is set to)
- Database: ${DB_NAME}
- Username: ${DB_USER}
- Password: ${DB_PASSWORD}

## STEP 3: VERIFY DATABASE SCHEMA

Once connected to the database, verify that the schema was created correctly by running:

```sql
-- List tables
\dt

-- Describe the users table
\d users;

-- Check if the trigger exists
\df

-- Query the users table (should be empty unless you inserted test data)
SELECT * FROM users;
```

You should see:
- A "users" table with columns: id, username, email, password_hash, created_at, updated_at
- An index on username and email columns
- A trigger named "update_users_updated_at"

## STEP 4: TEST DATABASE PERSISTENCE

To test database persistence:

1. Insert a test record:
```sql
INSERT INTO users (username, email, password_hash) VALUES ('testuser', 'testuser@example.com', 'hash_of_test_password');
```

2. Stop the container:
```
Ctrl+C in the docker compose terminal
```

3. Restart the container:
```
docker compose up postgres
```

4. Connect again and verify that the test record still exists:
```sql
SELECT * FROM users WHERE username = 'testuser';
```

If the record persists after stopping and starting the container, the volume persistence is working correctly.

## STEP 5: CONFIGURATION VERIFICATION

Verify that all configuration files are correctly set up:

1. Check your `.env` file contains the database configuration:
```
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=simple_auth_db
DB_USER=admin
DB_PASSWORD=admin0123
DB_URL=postgresql://admin:admin0123@postgres:5432/simple_auth_db
```

2. Verify docker compose.yml has the postgres service configured with:
- Environment variables mapping to the .env values
- Volume mount for postgres_data
- Mount for init.sql at /docker-entrypoint-initdb.d/init.sql
    
3. Confirm the init.sql file creates the proper schema as defined in the previous steps.

## STEP 6: PREPARATION FOR NEXT PHASE

Once you've verified all of the above, the database is ready for the backend development phase. The backend service will be able to connect to the database using:
- Hostname: "postgres" (the service name in docker compose)
- Database: ${DB_NAME}
- User: ${DB_USER}
- Password: ${DB_PASSWORD}

All these values will be provided to the backend container through environment variables as defined in the docker compose.yml file.

## SUCCESS CRITERIA:
- PostgreSQL container starts without errors
- Can connect to the database externally (from host) and internally (between containers)
- Schema exists as defined in init.sql
- Data persists between container restarts
- Database is accessible to the backend service (hostname: postgres)