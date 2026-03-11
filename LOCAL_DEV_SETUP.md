# GridConnect - Local Development Setup (No Docker)

This guide shows how to run GridConnect locally for development and debugging without Docker.

## Prerequisites

- **Python 3.11+** (https://www.python.org/downloads/)
- **Node.js 18+** (https://nodejs.org/)
- **PostgreSQL 16** with PostGIS extension
- **Git** (optional, for version control)

---

## Step 1: Install PostgreSQL + PostGIS

### macOS (using Homebrew)
```bash
brew install postgresql@16 postgis

# Start PostgreSQL
brew services start postgresql@16
```

### Ubuntu/Debian
```bash
sudo apt update
sudo apt install postgresql-16 postgresql-contrib-16 postgis postgresql-16-postgis-3

# Start PostgreSQL
sudo systemctl start postgresql
```

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run installer, select "PostGIS" during installation
3. Start the PostgreSQL service

### Verify PostgreSQL is Running
```bash
psql --version
# Should output: psql (PostgreSQL) 16.x
```

---

## Step 2: Create Database

```bash
# Connect to PostgreSQL (default user is 'postgres')
psql -U postgres

# Inside psql, create database and user:
CREATE USER gridconnect WITH PASSWORD 'gridconnect_password';
CREATE DATABASE gridconnect_db OWNER gridconnect;

# Enable PostGIS extension
\c gridconnect_db
CREATE EXTENSION postgis;
CREATE EXTENSION postgis_topology;

# Verify
SELECT postgis_version();
# Should output postgis version info

# Exit psql
\q
```

---

## Step 3: Initialize Database Schema

```bash
# From project root
cd gridconnect

# Connect and run schema
psql -U gridconnect -d gridconnect_db < init-db.sql

# Verify tables were created
psql -U gridconnect -d gridconnect_db -c "\dt"
# Should show: substations, power_lines, transformers, projects, etc.
```

---

## Step 4: Setup Python Backend

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi, sqlalchemy, geoalchemy2; print('✅ All dependencies installed')"
```

---

## Step 5: Import OSM Data (Optional but Recommended)

This step is optional. You can skip it and test the API with the empty database, then import data later.

```bash
# Make sure virtual environment is activated (see Step 4)

# Ensure you have the OSM file
# If not, you can download: https://download.geofabrik.de/europe/united-kingdom-latest.osm.pbf

# Run importer
python importer.py /path/to/united-kingdom-latest.osm.pbf

# This will take 5-15 minutes depending on file size
# You'll see progress like: "Processed 100 substations..."
```

---

## Step 6: Run Backend Development Server

```bash
# Make sure virtual environment is activated

# Set environment variables (optional, defaults work)
export DATABASE_URL="postgresql://gridconnect:gridconnect_password@localhost:5432/gridconnect_db"

# Start FastAPI with auto-reload
python -m uvicorn app.api:app --reload --host 0.0.0.0 --port 8000

# Output should show:
# INFO:     Uvicorn running on http://127.0.0.1:8000
# INFO:     Application startup complete
# Press CTRL+C to stop
```

The `--reload` flag enables hot-reload: changes to Python files will automatically restart the server.

---

## Step 7: Run Frontend Development Server (New Terminal)

```bash
# Open a NEW terminal window

cd gridconnect/frontend

# Install dependencies
npm install

# Start development server
npm start

# This will:
# - Install all dependencies
# - Start React dev server
# - Open http://localhost:3000 in your browser
# - Enable hot-reload on file changes
```

---

## Step 8: Test the Application

### Frontend
- Open http://localhost:3000 in your browser
- You should see the GridConnect interface

### Backend API
- Health check: http://localhost:8000/health
- API docs (Swagger): http://localhost:8000/docs
- Try it out in the Swagger UI

### Test Analysis
In the frontend, enter test coordinates and click "Analyze Connection":
```
Name: Test Project
Latitude: 54.5973
Longitude: -3.4360
Capacity: 10 MW
Technology: Solar
Voltage: 11kV
```

You should get results if you imported OSM data, or an empty analysis if not.

---

## Development Workflow

### Backend Development

**Making changes:**
1. Edit files in `app/` directory
2. Changes auto-reload (with `--reload` flag)
3. Test via Swagger UI or curl

**Useful tools:**
```bash
# Test API endpoint
curl http://localhost:8000/health

# Connect to database
psql -U gridconnect -d gridconnect_db

# View logs in terminal where you ran uvicorn
```

**Common edits:**
- `app/api.py` - Add/modify endpoints
- `app/analyzer.py` - Improve algorithms
- `app/models.py` - Change database schema
- `requirements.txt` - Add Python packages

After editing `models.py`, you may need to update the database schema in PostgreSQL.

---

### Frontend Development

**Making changes:**
1. Edit files in `frontend/src/` directory
2. Browser auto-refreshes (hot-reload enabled)
3. See changes immediately

**Useful tools:**
```bash
# Browser dev tools (F12) shows React errors
# Console tab shows JavaScript errors
# Network tab shows API calls
```

**Common edits:**
- `src/App.js` - Main layout
- `src/components/MapComponent.js` - Map functionality
- `src/components/ConnectionForm.js` - Input form
- `src/components/AnalysisPanel.js` - Results display
- `src/App.css` & component CSS files - Styling

**Add new packages:**
```bash
cd frontend
npm install new-package-name
# Restart npm start if needed
```

---

## Debugging

### Backend Debugging

**Using print statements:**
```python
# In app/api.py or app/analyzer.py
print(f"DEBUG: variable = {variable}")

# Output appears in the terminal where uvicorn is running
```

**Using Python debugger:**
```python
# In your code
import pdb; pdb.set_trace()

# Execution pauses, type commands in terminal:
# n - next line
# s - step into function
# c - continue
# p variable - print variable
# l - list code
# q - quit
```

**Using logging (better practice):**
```python
import logging
logger = logging.getLogger(__name__)

logger.info(f"Info message: {data}")
logger.error(f"Error message: {error}")
```

### Frontend Debugging

**Browser DevTools:**
- Press F12 (or Cmd+Option+I on Mac)
- Console tab shows JavaScript errors
- Network tab shows API calls
- Elements tab shows DOM
- React DevTools extension for React debugging

**Using console.log:**
```javascript
console.log("DEBUG:", variable);
console.error("ERROR:", error);
```

---

## Troubleshooting

### "psql: command not found"
PostgreSQL not in PATH. Add it:
- macOS: `brew install postgresql@16`
- Ubuntu: `sudo apt install postgresql-client`
- Windows: Add PostgreSQL bin to PATH

### "FATAL: Ident authentication failed"
PostgreSQL authentication issue:
```bash
# Try specifying password explicitly
psql -U gridconnect -d gridconnect_db
# When prompted, enter: gridconnect_password

# Or set password in .pgpass file
```

### "ModuleNotFoundError: No module named 'fastapi'"
Python dependencies not installed:
```bash
# Activate virtual environment first
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Then install
pip install -r requirements.txt
```

### "Cannot find module '@/components/ui/alert'"
Frontend dependencies not installed:
```bash
cd frontend
npm install
```

### "Port 8000 already in use"
Another process is using port 8000:
```bash
# Use different port
python -m uvicorn app.api:app --reload --port 8001
```

### "Port 3000 already in use"
Another process is using port 3000:
```bash
cd frontend
# Use different port
PORT=3001 npm start
```

### "No such table: substations"
OSM data not imported:
```bash
# Make sure you ran the importer
python importer.py /path/to/osm.pbf

# Or if you just want to test without data, it's fine
# The API will return empty results
```

### "connect() got an unexpected keyword argument 'timeout'"
SQLAlchemy version issue. Fix with:
```bash
pip install --upgrade SQLAlchemy sqlalchemy-utils
```

---

## Database Management

### View data
```bash
psql -U gridconnect -d gridconnect_db

# In psql:
SELECT COUNT(*) FROM substations;
SELECT * FROM substations LIMIT 5;
SELECT * FROM projects;
```

### Reset database
```bash
# Warning: This deletes all data!
psql -U gridconnect -d gridconnect_db

# In psql:
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
\q

# Reinitialize
psql -U gridconnect -d gridconnect_db < init-db.sql
```

### Backup database
```bash
pg_dump -U gridconnect gridconnect_db > backup.sql

# Restore from backup
psql -U gridconnect -d gridconnect_db < backup.sql
```

---

## Running Tests

(Add this section when you create tests)

```bash
# Backend tests
pytest

# Frontend tests
cd frontend
npm test
```

---

## Production Build

When you're ready to deploy:

### Build frontend
```bash
cd frontend
npm run build
# Creates optimized build in 'build/' folder
```

### Export Python requirements
```bash
pip freeze > requirements.txt
```

---

## Environment Variables

Create a `.env` file in the project root:

```
DATABASE_URL=postgresql://gridconnect:gridconnect_password@localhost:5432/gridconnect_db
REACT_APP_API_URL=http://localhost:8000
LOG_LEVEL=DEBUG
```

The backend will read from `DATABASE_URL`.
The frontend will read from `REACT_APP_API_URL` (must restart npm).

---

## Quick Reference

| Task | Command |
|------|---------|
| Activate Python env | `source venv/bin/activate` |
| Install Python deps | `pip install -r requirements.txt` |
| Start backend | `python -m uvicorn app.api:app --reload` |
| Start frontend | `cd frontend && npm start` |
| Access frontend | http://localhost:3000 |
| Access API docs | http://localhost:8000/docs |
| Connect to database | `psql -U gridconnect -d gridconnect_db` |
| Import OSM data | `python importer.py /path/to/osm.pbf` |
| View project data | `psql ... -c "SELECT * FROM projects;"` |

---

## Next Steps

1. ✅ Start both servers (backend + frontend)
2. ✅ Test the API in Swagger UI (http://localhost:8000/docs)
3. ✅ Test the frontend at http://localhost:3000
4. ✅ Import OSM data when ready
5. ✅ Start developing!

**Happy coding!** 🚀

---

## Questions?

- Backend issues? Check terminal where uvicorn is running
- Frontend issues? Check browser console (F12)
- Database issues? Check PostgreSQL logs
- API issues? Use Swagger UI at http://localhost:8000/docs
