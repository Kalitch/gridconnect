# GridConnect

A comprehensive geospatial intelligence platform for understanding electricity grid infrastructure and estimating the feasibility of new grid connections for renewable energy projects.
<img width="1280" height="720" alt="image" src="https://github.com/user-attachments/assets/1363f358-06d7-4b26-b212-35eedb4427f5" />
<img width="406" height="692" alt="image" src="https://github.com/user-attachments/assets/a91669b5-08eb-4deb-b451-509612f50829" />
<img width="378" height="813" alt="image" src="https://github.com/user-attachments/assets/1c65f2bc-bdcb-4cf2-b097-b469ba5d23d2" />
<img width="385" height="823" alt="image" src="https://github.com/user-attachments/assets/3249cf5c-38e0-449b-a345-e0a09bbaf948" />
<img width="400" height="938" alt="image" src="https://github.com/user-attachments/assets/9bf1b04f-11e3-4009-ba63-25d7eeb15558" />

## Features

### Three-Layer Intelligence Model

**Layer 1: Infrastructure Discovery**
- Identifies electricity infrastructure near a given location
- Returns nearby substations, power lines, and transformers
- Calculates infrastructure density metrics
- Uses OpenStreetMap electricity network data

**Layer 2: Network Accessibility**
- Analyzes physical connectivity to the grid
- Calculates distance to candidate connection substations
- Generates grid accessibility scores (0-100)
- Uses transmission topology for realistic routing

**Layer 3: Capacity & Queue Intelligence**
- Estimates grid congestion and queue delays
- Integrates queue pressure data
- Projects connection timelines
- Generates probability curves for connection likelihood over time

## Architecture

```
gridconnect/
├── app/
│   ├── __init__.py              # Database configuration
│   ├── models.py                # SQLAlchemy ORM models
│   ├── schemas.py               # Pydantic validation schemas
│   ├── analyzer.py              # Core geospatial analysis engine
│   └── api.py                   # FastAPI application & endpoints
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapComponent.js  # Leaflet-based geospatial visualization
│   │   │   ├── ConnectionForm.js # Analysis input form
│   │   │   └── AnalysisPanel.js  # Results & charts
│   │   ├── App.js
│   │   └── index.js
│   ├── Dockerfile
│   └── package.json
├── importer.py                   # OSM data importer
├── docker-compose.yml
├── init-db.sql
├── requirements.txt
└── README.md
```

## Technology Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL + PostGIS** - Spatial database with GIS capabilities
- **SQLAlchemy** - ORM and database abstraction
- **Shapely** - Geometric operations
- **pyosmium** - OpenStreetMap data parsing

### Frontend
- **React 18** - UI framework
- **Leaflet** - Interactive mapping library
- **Recharts** - Charts and data visualization
- **Tailwind CSS** - Styling

### Infrastructure
- **Docker & Docker Compose** - Containerization

## Setup & Installation

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- Node.js 18+ (for local frontend development)
- PostgreSQL with PostGIS (automated via Docker)
- OpenStreetMap PBF file (UK data available from Geofabrik)

### 1. Start Infrastructure

```bash
# From project root
docker-compose up -d

# Wait for PostgreSQL to be ready (~30 seconds)
docker-compose logs postgres
```

### 2. Import OSM Data

Download UK OpenStreetMap data:
```bash
# If you haven't already
wget https://download.geofabrik.de/europe/united-kingdom-latest.osm.pbf
```

Import into database:
```bash
docker-compose exec api python importer.py /data/united-kingdom-latest.osm.pbf
```

This will extract:
- All substations (power=substation)
- All power lines (power=line)
- All transformers (power=transformer)

Processing time varies based on file size (~5-15 minutes for full UK data).

### 3. Verify Installation

**Check API Health:**
```bash
curl http://localhost:8000/health
```

**Access Frontend:**
Visit http://localhost:3000 in your browser

## API Endpoints

### Infrastructure Discovery (Layer 1)

**Get Infrastructure Near Location**
```http
POST /infrastructure/nearby
Content-Type: application/json

{
  "latitude": 54.5973,
  "longitude": -3.4360,
  "radius_km": 10.0
}
```

Response includes nearby substations, power lines, transformers, and density metrics.

### Network Accessibility (Layer 2)

**List All Substations**
```http
GET /substations?skip=0&limit=100
```

**List All Power Lines**
```http
GET /power-lines?skip=0&limit=100
```

### Connection Estimate (Layer 3 + Complete Analysis)

**Estimate Connection Feasibility**
```http
POST /connection-estimate
Content-Type: application/json

{
  "latitude": 54.5973,
  "longitude": -3.4360,
  "peak_generation_mw": 10.0,
  "name": "My Solar Farm",
  "technology_type": "Solar",
  "connection_voltage": "11kV"
}
```

Complete response includes all three layers plus:
- Grid accessibility score (0-100)
- Queue congestion signals
- Capacity stress indicators
- Connection probability curve (years ahead)

### Project Management

**Get Project Details**
```http
GET /projects/{project_id}
```

**List All Projects**
```http
GET /projects?skip=0&limit=20
```

## Key Algorithms

### Grid Accessibility Score
Combines four factors:
- **Distance to substations** (0-40 points): Closer substations = higher score
- **Infrastructure density** (0-40 points): Denser network = higher score
- **Transmission line proximity** (0-20 points): Bonus for nearby HV lines
- Total score: 0-100

### Connection Probability Curve
Uses logistic function (S-curve) based on:
- Current projects in queue
- Average connection wait time
- Estimated capacity constraints
- Year-by-year probability projection

### Capacity Stress Assessment
Evaluates:
- MW currently in queue at substation
- New project size
- Assumed substation capacity (150 MW baseline)
- Utilization before/after connection

## Database Schema

### Core Tables

**substations**
- OSM infrastructure data with spatial index
- Voltage levels, operators, references
- POINT geometry

**power_lines**
- Transmission infrastructure
- Voltage, cable count, frequency
- LINESTRING geometry

**transformers**
- Individual transformer locations
- Power ratings, phases
- POINT geometry

**projects**
- Analyzed connection requests
- Stores nearest substation reference
- POINT geometry

**connection_probability**
- Time-series probability data
- Links to projects
- Year-by-year breakdown

**queue_data**
- Current queue state at each substation
- MW and project counts
- Average wait times

All geometry columns use SRID 4326 (WGS84).

## Development

### Local Development (Without Docker)

```bash
# Backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Start PostgreSQL separately, then:
python -m app.api

# Frontend (separate terminal)
cd frontend
npm install
npm start
```

### Adding Queue Data

To integrate real queue data (ECR, DNO data):

```python
from app.models import QueueData
from app import SessionLocal

db = SessionLocal()
queue_entry = QueueData(
    substation_id=1,
    mw_in_queue=45.5,
    projects_in_queue=3,
    average_wait_months=24
)
db.add(queue_entry)
db.commit()
```

### Extending the System

The modular design allows independent improvements:

1. **Geospatial experts**: Improve connection path logic in `analyzer.py`
2. **Grid engineers**: Enhance voltage matching models
3. **Data scientists**: Improve probability models
4. **Frontend developers**: Extend visualization components

Each module can evolve independently without affecting others.

## Performance Notes

- Initial OSM import: 5-15 minutes (depends on file size)
- Subsequent queries: <100ms for typical radius searches
- Large radius searches (50km) may take 1-2 seconds
- Database automatically indexes all geometry columns

For large datasets, consider:
- Partitioning tables by region
- Materialized views for pre-computed analyses
- Read replicas for heavy query loads

## Future Enhancements

- Integration with real ECR and DNO queue data
- Machine learning probability models
- Automated routing to voltage networks
- Substation catchment modeling
- Transmission constraint analysis
- REST API rate limiting & authentication
- Multi-country support

## License

Open source (license to be determined). Designed to be free and accessible to community energy initiatives.

## Contributing

This repository is designed for interdisciplinary collaboration:

- Power system engineers
- GIS specialists  
- Energy economists
- Data scientists
- Web developers

Each component can be contributed to independently.

## Support

For issues or questions:
- Check Docker logs: `docker-compose logs -f api`
- Verify database: `docker-compose exec postgres psql -U gridconnect -d gridconnect_db`
- API documentation: http://localhost:8000/docs
