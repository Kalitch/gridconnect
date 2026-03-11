# GridConnect Quick Start Guide

## 5-Minute Setup

### Prerequisites
- ✅ Docker & Docker Compose installed
- ✅ `united-kingdom-latest.osm.pbf` file downloaded (or path to it)
- ✅ 2GB+ disk space available

### Step 1: Start Services (2 min)

```bash
cd gridconnect
docker-compose up -d
```

Wait for PostgreSQL to start:
```bash
docker-compose logs postgres
# Look for: "database system is ready to accept connections"
```

### Step 2: Import OSM Data (5-15 min)

If you have the PBF file locally:
```bash
# Copy to data directory
cp /path/to/united-kingdom-latest.osm.pbf ./data/

# Import
docker-compose exec api python importer.py /data/united-kingdom-latest.osm.pbf
```

Watch the progress:
```
Processed 100 substations...
Processed 200 substations...
...
Import complete!
  Substations: 2847
  Power Lines: 15234
  Transformers: 891
  Skipped: 12
```

### Step 3: Access Application

- **Frontend**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## Using the Application

### 1. Enter Location Details
- **Project Name**: Give your project a name
- **Latitude/Longitude**: Click map or type coordinates
- **Capacity**: Peak generation in MW
- **Technology**: Solar, Wind, Hydro, etc.
- **Voltage**: Connection voltage (e.g., 11kV, 33kV)

### 2. Click "Analyze Connection"

The system will:
1. Find nearby substations and power lines
2. Calculate accessibility score
3. Assess queue pressure
4. Generate connection probability curve

### 3. Review Results

**Grid Infrastructure**
- Number of nearby substations
- Power lines in area
- Infrastructure density (%)

**Network Accessibility**
- Nearest substation (name, voltage)
- Connection distance (km)
- Grid accessibility score (0-100)

**Queue & Capacity**
- Estimated wait time (years)
- Projects already in queue
- Capacity status (low/moderate/high/critical)

**Connection Probability**
- Year-by-year probability curve
- Visual chart showing likelihood over time

## API Examples

### Test Connection Analysis

```bash
curl -X POST http://localhost:8000/connection-estimate \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Solar Farm",
    "latitude": 54.5973,
    "longitude": -3.4360,
    "peak_generation_mw": 10.0,
    "technology_type": "Solar",
    "connection_voltage": "11kV"
  }'
```

### Get Project Details

```bash
# First note the project_id from previous response
curl http://localhost:8000/projects/1
```

### List Nearby Infrastructure

```bash
curl -X POST http://localhost:8000/infrastructure/nearby \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 54.5973,
    "longitude": -3.4360,
    "radius_km": 5.0
  }'
```

## Troubleshooting

### "Connection refused" error
```bash
# Check if services are running
docker-compose ps

# Check logs
docker-compose logs api
docker-compose logs postgres
```

### "No substations found" error
- OSM data may not be imported yet
- Run importer: `docker-compose exec api python importer.py /data/...`
- Wait for import to complete

### Slow performance
- Initial database queries are slower until PostGIS stats are analyzed
- Run: `docker-compose exec postgres vacuumdb -U gridconnect gridconnect_db`

### Import fails with "No such file"
- Verify PBF file path is correct
- File should be accessible from container: `docker-compose exec api ls -la /data/`

## Database Access (Advanced)

Connect directly to PostgreSQL:
```bash
docker-compose exec postgres psql -U gridconnect -d gridconnect_db

# Inside psql:
\dt                    # List tables
SELECT COUNT(*) FROM substations;  # Count records
\q                     # Exit
```

## Stopping the Application

```bash
# Stop all services
docker-compose down

# Stop + remove data (reset)
docker-compose down -v
```

## Next Steps

1. **Integrate Queue Data**: Add real ECR/DNO data to improve accuracy
2. **Extend Analysis**: Add transmission constraint modeling
3. **API Integration**: Use the REST API in your own applications
4. **Contribute**: Improve models, add features, suggest enhancements

## Support

- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Project Repository**: [Your GitLab/GitHub URL]
- **Issues**: [Issue tracker]

---

**Enjoy GridConnect! 🚀⚡**
