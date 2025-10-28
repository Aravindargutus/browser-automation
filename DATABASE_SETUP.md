# Database Setup Guide

This guide will help you set up PostgreSQL database for the Browser Automation Agent.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Install PostgreSQL](#install-postgresql)
3. [Create Database](#create-database)
4. [Configure Environment Variables](#configure-environment-variables)
5. [Run Migrations](#run-migrations)
6. [Verify Setup](#verify-setup)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- PostgreSQL 12+ (will be installed in this guide)

---

## Install PostgreSQL

### On macOS (using Homebrew)

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify installation
psql --version
```

### On Ubuntu/Debian

```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify installation
psql --version
```

### On Windows

1. Download PostgreSQL installer from: https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Add PostgreSQL bin directory to PATH (usually `C:\Program Files\PostgreSQL\15\bin`)

### Using Docker (Recommended for Development)

```bash
# Pull PostgreSQL image
docker pull postgres:15-alpine

# Run PostgreSQL container
docker run --name browser-automation-db \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=browser_automation \
  -p 5432:5432 \
  -d postgres:15-alpine

# Verify container is running
docker ps | grep browser-automation-db
```

---

## Create Database

### Option 1: Using psql Command Line

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# Inside psql, create database
CREATE DATABASE browser_automation;

# Create a dedicated user (optional but recommended)
CREATE USER automation_user WITH PASSWORD 'secure_password_here';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE browser_automation TO automation_user;

# Exit psql
\q
```

### Option 2: Using Docker

If you used the Docker command above, the database is already created.

---

## Configure Environment Variables

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Edit the `.env` file and update the DATABASE_URL:**

```env
# For local PostgreSQL installation
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/browser_automation?schema=public

# OR for custom user
DATABASE_URL=postgresql://automation_user:secure_password_here@localhost:5432/browser_automation?schema=public

# OR for Docker
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/browser_automation?schema=public
```

**DATABASE_URL Format:**
```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]?schema=public
```

- `USER`: PostgreSQL username (default: `postgres`)
- `PASSWORD`: PostgreSQL password
- `HOST`: Database host (default: `localhost`)
- `PORT`: Database port (default: `5432`)
- `DATABASE`: Database name (we use: `browser_automation`)

---

## Run Migrations

Prisma migrations will create all the necessary tables in your database.

### Step 1: Generate Prisma Client

```bash
npx prisma generate
```

This command generates the Prisma Client based on your schema.

### Step 2: Run Migrations

```bash
# Create and apply migration
npx prisma migrate dev --name init

# OR if you get engine download errors, use:
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev --name init
```

**Expected Output:**
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "browser_automation"

PostgreSQL database browser_automation created at localhost:5432

Applying migration `20231027000000_init`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20231027000000_init/
    └─ migration.sql

✔ Generated Prisma Client
```

### Step 3: Verify Tables Were Created

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a web interface at `http://localhost:5555` where you can browse your database tables.

**Alternatively, using psql:**

```bash
psql -U postgres -d browser_automation

# List all tables
\dt

# Expected tables:
# - users
# - workflows
# - executions
# - schedules

# View table structure
\d users
\d workflows
\d executions
\d schedules

# Exit
\q
```

---

## Verify Setup

### 1. Check Database Connection

Create a test script `test-db.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful!');

    // Test query
    const result = await prisma.$queryRaw`SELECT version()`;
    console.log('PostgreSQL version:', result[0].version);

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

test();
```

Run it:

```bash
node test-db.js
```

### 2. Start the Server

```bash
# Start backend
node server/server.js

# Expected output should include:
# "✅ API authentication enabled"
# "Server running on port 3001"
```

### 3. Test API Endpoints

```bash
# Test health endpoint (includes database check)
curl http://localhost:3001/health

# Test workflows endpoint
curl -H "X-API-Key: your-api-key-here" http://localhost:3001/workflows

# Test executions endpoint
curl -H "X-API-Key: your-api-key-here" http://localhost:3001/executions
```

---

## Database Schema

The database includes 4 main tables:

### 1. **users**
Stores user accounts and API keys.
- `id` (UUID, Primary Key)
- `email` (String, Unique)
- `apiKey` (String, Unique)
- `role` (String, default: "user")
- `createdAt`, `updatedAt` (Timestamps)

### 2. **workflows**
Stores reusable automation workflows.
- `id` (UUID, Primary Key)
- `name` (String)
- `description` (String, Optional)
- `steps` (JSON) - Array of browser actions
- `tags` (String Array)
- `isTemplate` (Boolean)
- `isActive` (Boolean)
- `userId` (Foreign Key → users.id)
- `createdAt`, `updatedAt` (Timestamps)

### 3. **executions**
Tracks each automation run.
- `id` (UUID, Primary Key)
- `workflowId` (Foreign Key → workflows.id, Optional)
- `userId` (Foreign Key → users.id)
- `prompt` (Text)
- `status` (String: pending, running, success, failed)
- `startTime`, `endTime` (Timestamps)
- `steps` (JSON) - Executed steps
- `results` (JSON) - Execution results
- `errorLog` (Text)
- `screenshot`, `videoUrl` (Strings)
- `triggeredBy` (String: manual, schedule, webhook)

### 4. **schedules**
Manages scheduled workflow executions.
- `id` (UUID, Primary Key)
- `workflowId` (Foreign Key → workflows.id)
- `name` (String, Optional)
- `cronExpression` (String)
- `timezone` (String, default: "UTC")
- `enabled` (Boolean)
- `lastRun`, `nextRun` (Timestamps)
- `runCount`, `failureCount` (Integers)
- `createdAt`, `updatedAt` (Timestamps)

---

## API Endpoints

### Workflows

```bash
# Get all workflows
GET /workflows

# Get workflow by ID
GET /workflows/:id

# Create workflow
POST /workflows
Body: { "name": "...", "description": "...", "steps": [...] }

# Update workflow
PUT /workflows/:id
Body: { "name": "...", "isActive": true }

# Delete workflow
DELETE /workflows/:id

# Execute workflow
POST /workflows/:id/execute
```

### Executions

```bash
# Get all executions
GET /executions

# Get execution by ID
GET /executions/:id

# Get execution statistics
GET /executions/stats/summary

# Execute prompt (creates execution)
POST /execute-prompt
Body: { "prompt": "...", "workflowId": "..." }
```

---

## Troubleshooting

### Issue: "Environment variable not found: DATABASE_URL"

**Solution:**
```bash
# Make sure .env file exists in project root
ls -la .env

# If not, copy from example
cp .env.example .env

# Edit .env and set DATABASE_URL
nano .env
```

### Issue: "Can't reach database server at `localhost:5432`"

**Solution:**
```bash
# Check if PostgreSQL is running
# macOS:
brew services list | grep postgresql

# Linux:
sudo systemctl status postgresql

# Docker:
docker ps | grep postgres

# Start if not running
brew services start postgresql@15  # macOS
sudo systemctl start postgresql    # Linux
docker start browser-automation-db # Docker
```

### Issue: "password authentication failed for user"

**Solution:**
```bash
# Reset PostgreSQL password
# For local installation:
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
\q

# Update .env file with new password
DATABASE_URL=postgresql://postgres:new_password@localhost:5432/browser_automation
```

### Issue: "Prisma engine download fails"

**Solution:**
```bash
# Use environment variable to skip checksum validation
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma generate
PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1 npx prisma migrate dev
```

### Issue: "Migration fails with existing data"

**Solution:**
```bash
# Reset database (WARNING: Deletes all data)
npx prisma migrate reset

# Then run migrations again
npx prisma migrate dev
```

---

## Useful Commands

```bash
# View current database schema
npx prisma db pull

# Generate Prisma Client
npx prisma generate

# Open Prisma Studio (visual database editor)
npx prisma studio

# Format Prisma schema
npx prisma format

# Validate Prisma schema
npx prisma validate

# View migration status
npx prisma migrate status

# Create new migration
npx prisma migrate dev --name your_migration_name

# Apply pending migrations (production)
npx prisma migrate deploy

# Reset database (deletes all data)
npx prisma migrate reset
```

---

## Next Steps

After setting up the database:

1. ✅ **Test the API endpoints** - Use curl or Postman to test workflow/execution endpoints
2. ✅ **Create a workflow** - Save your first reusable automation workflow
3. ✅ **View execution history** - Check the `/executions` endpoint
4. ✅ **Build the frontend** - Connect React UI to new endpoints
5. ✅ **Add user authentication** - Replace 'anonymous' userId with real user accounts

---

## Production Deployment

For production environments:

1. **Use a managed PostgreSQL service:**
   - AWS RDS
   - Google Cloud SQL
   - DigitalOcean Managed Databases
   - Heroku Postgres
   - Supabase

2. **Update DATABASE_URL in production:**
```env
DATABASE_URL=postgresql://user:password@production-host:5432/browser_automation?sslmode=require
```

3. **Run migrations in production:**
```bash
npx prisma migrate deploy
```

4. **Set up database backups:**
   - Daily automated backups
   - Point-in-time recovery
   - Backup retention policy

5. **Monitor database performance:**
   - Connection pool size
   - Query performance
   - Disk usage
   - Connection limits

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Prisma documentation: https://www.prisma.io/docs
3. Check PostgreSQL logs: `tail -f /usr/local/var/log/postgres.log` (macOS)
4. Open an issue in the repository

---

**Congratulations!** 🎉 Your database is now set up and ready to use.
