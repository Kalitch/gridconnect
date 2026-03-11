# GridConnect - Windows Development with Docker PostgreSQL

You can run **PostgreSQL in Docker** while developing Python backend and React frontend **locally** on Windows.

This is perfect for Windows development because:
- ✅ PostgreSQL runs in Docker (easiest to manage)
- ✅ Python backend runs locally (auto-reload, debugging)
- ✅ React frontend runs locally (hot-reload)
- ✅ All editable source code in your editor
- ✅ No Docker overhead for development code

---

## Prerequisites (Windows)

Install these once:

1. **Docker Desktop** → https://www.docker.com/products/docker-desktop
   - Includes Docker and Docker Compose
   - Must have WSL2 (Windows Subsystem for Linux 2)
   
2. **Python 3.11+** → https://www.python.org/downloads/
   - Check "Add Python to PATH" during installation
   
3. **Node.js 18+** → https://nodejs.org/

---

## Step 1: Start PostgreSQL in Docker

Create a file called `docker-compose-postgres-only.yml` in your `gridconnect` folder:

```yaml
version: '3.8'

services:
  postgres:
    image: postgis/postgis:16-3.4
    container_name: gridconnect-postgres
    environment:
      POSTGRES_USER: gridconnect
      POSTGRES_PASSWORD: gridconnect_password
      POSTGRES_DB: gridconnect_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U gridconnect"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

Or use the file from GridConnect.zip and modify it (comment out the api and frontend services).

### Start PostgreSQL:

```bash
docker-compose -f docker-compose-postgres-only.yml up -d
```

Wait for it to be healthy:
```bash
docker-compose -f docker-compose-postgres-only.yml logs postgres
# Wait for: "database system is ready to accept connections"
```

Test connection:
```bash
docker-compose -f docker-compose-postgres-only.yml exec postgres psql -U gridconnect -d gridconnect_db -c "SELECT 1"
```

---

## Step 2: Setup Python Backend (Local)

Open PowerShell/Command Prompt in your `gridconnect` folder:

```bash
# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate.bat

# Install dependencies
pip install -r requirements.txt

# Verify database connection
python -c "import sqlalchemy; print('✅ SQLAlchemy installed')"
```

---

## Step 3: Setup React Frontend (Local)

Open another PowerShell/Command Prompt:

```bash
cd gridconnect\frontend

# Install dependencies
npm install
```

---

## Step 4: Run Everything

You now have 3 things running:

### Terminal 1: PostgreSQL (Docker)
```bash
docker-compose -f docker-compose-postgres-only.yml up
# Keep this running, shows PostgreSQL logs
```

### Terminal 2: Python Backend (Local)
```bash
cd gridconnect
venv\Scripts\activate.bat

python -m uvicorn app.api:app --reload
# Output: "Uvicorn running on http://127.0.0.1:8000"
```

### Terminal 3: React Frontend (Local)
```bash
cd gridconnect\frontend
npm start
# Opens http://localhost:3000 automatically
```

---

## Access Your App

| What | Where |
|------|-------|
| Frontend | http://localhost:3000 |
| API Docs | http://localhost:8000/docs |
| Database | localhost:5432 (from localhost:5432) |
| Health | http://localhost:8000/health |

---

## Development Workflow

### Edit Backend Code
1. Edit `app/api.py` or `app/analyzer.py`
2. Save file
3. Terminal 2 shows auto-reload
4. Test in http://localhost:8000/docs

### Edit Frontend Code
1. Edit `frontend/src/App.js` or components
2. Save file
3. Browser at http://localhost:3000 auto-refreshes
4. See changes immediately

### Modify Database
1. Edit `init-db.sql`
2. Recreate Docker container:
   ```bash
   docker-compose -f docker-compose-postgres-only.yml down
   docker-compose -f docker-compose-postgres-only.yml up -d
   ```

---

## Connection String

When you need the database URL:

```
postgresql://gridconnect:gridconnect_password@localhost:5432/gridconnect_db
```

---

## Add Python Packages

```bash
# With venv activated
pip install package-name
pip freeze > requirements.txt
```

---

## Add JavaScript Packages

```bash
cd gridconnect\frontend
npm install package-name
```

---

## Stop Everything

```bash
# Stop PostgreSQL (keep data)
docker-compose -f docker-compose-postgres-only.yml stop

# Stop PostgreSQL (delete data)
docker-compose -f docker-compose-postgres-only.yml down

# Stop with Ctrl+C in other terminals
```

---

## Debugging

### Backend
```python
# Add to your code
print("DEBUG:", variable)

# Output appears in Terminal 2 (uvicorn)
```

### Frontend
- Press F12 in browser
- Console tab shows errors
- Add `console.log()` to JavaScript

### Database
```bash
# Connect to database
docker-compose -f docker-compose-postgres-only.yml exec postgres psql -U gridconnect -d gridconnect_db

# View data
SELECT COUNT(*) FROM substations;
\q
```

---

## Import OSM Data (Optional)

When ready to test with real UK grid data:

```bash
# With venv activated
python importer.py united-kingdom-latest.osm.pbf
# Takes 5-15 minutes
```

---

## Troubleshooting

### "docker: command not found"
Docker not installed or not in PATH
→ Install Docker Desktop: https://www.docker.com/products/docker-desktop

### "Port 5432 already in use"
Another database running on port 5432
→ Either stop it, or change port in docker-compose (5433:5432)

### "Cannot connect to database"
```bash
# Check if PostgreSQL is running
docker ps | findstr postgres

# Check logs
docker-compose -f docker-compose-postgres-only.yml logs postgres

# Restart
docker-compose -f docker-compose-postgres-only.yml restart postgres
```

### "ModuleNotFoundError: fastapi"
Dependencies not installed
→ Run: `pip install -r requirements.txt` (with venv activated)

### "Port 8000 already in use"
Use different port:
```bash
python -m uvicorn app.api:app --reload --port 8001
```

### "Port 3000 already in use"
Use different port:
```bash
set PORT=3001 && npm start
```

---

## Full Architecture

```
Your Windows Machine
├── Docker Desktop
│   └── PostgreSQL Container
│       └── Listening on localhost:5432
│
├── PowerShell/CMD Terminal 1
│   └── PostgreSQL running
│
├── PowerShell/CMD Terminal 2
│   └── Python venv
│       └── FastAPI (auto-reload)
│           └── Listening on localhost:8000
│
└── PowerShell/CMD Terminal 3
    └── Node.js
        └── React dev server (hot-reload)
            └── Listening on localhost:3000
```

All code is **locally editable** in your editor.
All servers have **auto-reload/hot-reload**.
Full **debugging capabilities**.

---

## Quick Checklist

- [ ] Docker Desktop installed
- [ ] Python 3.11+ installed
- [ ] Node.js 18+ installed
- [ ] Created `docker-compose-postgres-only.yml` (or use existing docker-compose.yml)
- [ ] Started PostgreSQL: `docker-compose up -d`
- [ ] Created venv: `python -m venv venv`
- [ ] Activated venv: `venv\Scripts\activate.bat`
- [ ] Installed Python deps: `pip install -r requirements.txt`
- [ ] Installed Node deps: `cd frontend && npm install`
- [ ] Terminal 1: `docker-compose up` (PostgreSQL logs)
- [ ] Terminal 2: `python -m uvicorn app.api:app --reload` (Backend)
- [ ] Terminal 3: `cd frontend && npm start` (Frontend)
- [ ] Open http://localhost:3000 ✅

---

## Windows Quick Commands

```bash
# Create venv
python -m venv venv

# Activate venv
venv\Scripts\activate.bat

# Start PostgreSQL
docker-compose -f docker-compose-postgres-only.yml up -d

# Start backend
python -m uvicorn app.api:app --reload

# Start frontend
cd frontend && npm start

# Stop PostgreSQL
docker-compose -f docker-compose-postgres-only.yml stop

# View PostgreSQL logs
docker-compose -f docker-compose-postgres-only.yml logs postgres

# Connect to database
docker-compose -f docker-compose-postgres-only.yml exec postgres psql -U gridconnect -d gridconnect_db
```

---

## This Gives You

✅ Easy PostgreSQL management (Docker)
✅ Full local development (Python/Node.js)
✅ Auto-reload on backend changes
✅ Hot-reload on frontend changes
✅ Full debugging capabilities
✅ Easy code editing
✅ Fast iteration
✅ No complex Docker networking
✅ Windows-friendly setup

---

## Next Steps

1. Install Docker Desktop
2. Create `docker-compose-postgres-only.yml` (above)
3. Start PostgreSQL: `docker-compose -f docker-compose-postgres-only.yml up -d`
4. Setup Python venv: `python -m venv venv && venv\Scripts\activate.bat`
5. Install Python deps: `pip install -r requirements.txt`
6. Setup Node.js: `cd frontend && npm install`
7. Open 3 terminals and run the servers
8. Start developing at http://localhost:3000

**Perfect for Windows development!** 🚀
