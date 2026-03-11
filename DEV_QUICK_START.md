# GridConnect Local Development - Quick Start

## One-Time Setup (5 minutes)

### macOS/Linux
```bash
# 1. Install PostgreSQL
brew install postgresql@16 postgis
brew services start postgresql@16

# 2. Run setup script
cd gridconnect
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### Windows
```bash
# 1. Install PostgreSQL from https://www.postgresql.org/download/windows/
# 2. Run setup batch file
cd gridconnect
scripts\setup.bat
```

---

## Start Development (Every Session)

### Option 1: Automated (macOS/Linux)
```bash
cd gridconnect
./scripts/dev-start.sh
# Opens both servers automatically
```

### Option 2: Manual Start (All platforms)

**Terminal 1 - Backend:**
```bash
cd gridconnect
source venv/bin/activate    # macOS/Linux
# or
venv\Scripts\activate.bat   # Windows

python -m uvicorn app.api:app --reload
# Output: "Uvicorn running on http://127.0.0.1:8000"
```

**Terminal 2 - Frontend:**
```bash
cd gridconnect/frontend
npm start
# Opens http://localhost:3000 automatically
```

---

## Access the Application

| Service | URL | Purpose |
|---------|-----|---------|
| Frontend | http://localhost:3000 | Main app |
| API Docs | http://localhost:8000/docs | Test endpoints |
| Health | http://localhost:8000/health | Status check |
| Database | `psql -U gridconnect -d gridconnect_db` | Query data |

---

## Development Workflow

### Backend Changes
1. Edit file in `app/` (e.g., `app/analyzer.py`)
2. Save file
3. Server auto-reloads (within 1-2 seconds)
4. Test in Swagger UI at http://localhost:8000/docs

### Frontend Changes
1. Edit file in `frontend/src/` (e.g., `App.js`)
2. Save file
3. Browser auto-refreshes (within 1-2 seconds)
4. See changes immediately

### Database Changes
1. Edit schema in `init-db.sql`
2. Reset database:
   ```bash
   psql -U gridconnect -d gridconnect_db < init-db.sql
   ```

---

## Add Dependencies

### Python Package
```bash
# With venv activated
pip install package-name

# Save to requirements.txt
pip freeze > requirements.txt
```

### Node Package
```bash
cd frontend
npm install package-name
# Automatically saved to package.json
```

---

## Debug Tips

### Backend
```python
# Add to code (auto-reloads)
print("DEBUG:", variable)

# Use debugger
import pdb; pdb.set_trace()
# Type 'n' for next, 'c' for continue
```

### Frontend
- Press F12 (or Cmd+Opt+I on Mac)
- Console tab shows JavaScript errors
- Network tab shows API calls
- Add `console.log()` to code

### Database
```bash
# Connect and query
psql -U gridconnect -d gridconnect_db

# In psql:
SELECT COUNT(*) FROM substations;
SELECT * FROM projects;
\dt                    # List tables
```

---

## Common Issues

| Issue | Solution |
|-------|----------|
| `psql: command not found` | Install PostgreSQL client |
| `ModuleNotFoundError` | Run `pip install -r requirements.txt` |
| `Port 8000 in use` | Change port: `--port 8001` |
| `Port 3000 in use` | Change port: `PORT=3001 npm start` |
| `No module named 'venv'` | Run `python3 -m venv venv` |
| Database tables missing | Run `psql ... < init-db.sql` |

---

## Import OSM Data

When ready to test with real data:

```bash
# Activate venv first
source venv/bin/activate

# Run importer
python importer.py /path/to/united-kingdom-latest.osm.pbf

# Takes 5-15 minutes, shows progress
# "Processed 100 substations..."
```

After import, test in frontend - should see results now.

---

## Database Management

### View Data
```bash
psql -U gridconnect -d gridconnect_db

# View substations
SELECT COUNT(*) FROM substations;
SELECT name, voltage FROM substations LIMIT 5;

# View projects
SELECT * FROM projects;
```

### Reset Database
```bash
# Delete everything
psql -U gridconnect -d gridconnect_db -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Reinitialize
psql -U gridconnect -d gridconnect_db < init-db.sql
```

### Backup
```bash
pg_dump -U gridconnect gridconnect_db > backup.sql
```

---

## Project Structure

```
gridconnect/
├── app/
│   ├── api.py          ← Add endpoints here
│   ├── analyzer.py     ← Improve algorithms here
│   ├── models.py       ← Database models
│   └── schemas.py      ← API schemas
├── frontend/
│   └── src/
│       ├── App.js      ← Main layout
│       └── components/
│           ├── MapComponent.js     ← Map
│           ├── ConnectionForm.js   ← Form
│           └── AnalysisPanel.js    ← Results
├── scripts/
│   ├── setup.sh        ← Initial setup
│   └── dev-start.sh    ← Start servers
└── init-db.sql         ← Database schema
```

---

## Useful Commands

```bash
# Activate virtual environment
source venv/bin/activate          # macOS/Linux
venv\Scripts\activate.bat         # Windows

# Start backend (with auto-reload)
python -m uvicorn app.api:app --reload

# Start frontend
cd frontend && npm start

# Install dependencies
pip install -r requirements.txt
npm install

# Connect to database
psql -U gridconnect -d gridconnect_db

# Test API
curl http://localhost:8000/health

# Check if PostgreSQL is running
psql -U postgres -c "SELECT 1"
```

---

## Next Steps

1. ✅ Run setup script
2. ✅ Start backend & frontend servers
3. ✅ Open http://localhost:3000 in browser
4. ✅ Test with Swagger API (http://localhost:8000/docs)
5. ✅ Import OSM data
6. ✅ Start developing!

---

## Full Documentation

- **LOCAL_DEV_SETUP.md** - Detailed setup guide
- **README.md** - Project overview
- **PROJECT_STRUCTURE.txt** - Architecture
