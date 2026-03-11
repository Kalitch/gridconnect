from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app import get_db
from app.models import Project, ConnectionProbability
from app.schemas import (
    ConnectionEstimateRequest,
    ConnectionEstimateResponse,
    InfrastructureNearbyRequest,
    InfrastructureNearbyResponse
)
from app.analyzer import GridAnalyzer
from geoalchemy2.functions import ST_GeomFromText

app = FastAPI(
    title="GridConnect API",
    description="Geospatial intelligence platform for grid connection feasibility",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===== Health Check =====

@app.get("/health")
async def health_check():
    return {"status": "ok"}

# ===== Layer 1: Infrastructure Discovery =====

@app.post("/infrastructure/nearby", response_model=InfrastructureNearbyResponse)
async def get_nearby_infrastructure(
    request: InfrastructureNearbyRequest,
    db: Session = Depends(get_db)
):
    """
    Layer 1 Endpoint: Discover electricity infrastructure near a location
    
    Returns nearby substations, power lines, and transformers
    """
    substations = GridAnalyzer.find_nearby_substations(
        db, request.latitude, request.longitude, request.radius_km
    )
    power_lines = GridAnalyzer.find_nearby_power_lines(
        db, request.latitude, request.longitude, request.radius_km
    )
    transformers = GridAnalyzer.find_nearby_transformers(
        db, request.latitude, request.longitude, request.radius_km
    )
    density = GridAnalyzer.calculate_infrastructure_density(
        db, request.latitude, request.longitude, radius_km=5.0
    )
    
    return InfrastructureNearbyResponse(
        substations=substations,
        power_lines=power_lines,
        transformers=transformers,
        infrastructure_density=density
    )

# ===== Layer 2: Network Accessibility =====

@app.get("/substations")
async def list_substations(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all substations with pagination"""
    from app.models import Substation
    from sqlalchemy import func
    
    substations = db.query(
        Substation.id,
        Substation.name,
        Substation.voltage,
        Substation.operator,
        func.ST_Y(Substation.geom).label('latitude'),
        func.ST_X(Substation.geom).label('longitude'),
    ).offset(skip).limit(limit).all()
    
    return {
        'count': len(substations),
        'substations': [
            {
                'id': s.id,
                'name': s.name or 'Unknown',
                'voltage': s.voltage,
                'operator': s.operator,
                'latitude': float(s.latitude),
                'longitude': float(s.longitude)
            }
            for s in substations
        ]
    }

@app.get("/power-lines")
async def list_power_lines(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all power lines with pagination"""
    from app.models import PowerLine
    
    power_lines = db.query(
        PowerLine.id,
        PowerLine.name,
        PowerLine.voltage,
        PowerLine.cables,
    ).offset(skip).limit(limit).all()
    
    return {
        'count': len(power_lines),
        'power_lines': [
            {
                'id': pl.id,
                'name': pl.name or 'Unknown',
                'voltage': pl.voltage,
                'cables': pl.cables
            }
            for pl in power_lines
        ]
    }

# ===== Layer 3: Capacity & Queue Intelligence + Full Connection Estimate =====

@app.post("/connection-estimate", response_model=ConnectionEstimateResponse)
async def estimate_connection(
    request: ConnectionEstimateRequest,
    db: Session = Depends(get_db)
):
    """
    Complete connection feasibility estimate
    
    Combines all three layers:
    1. Infrastructure Discovery
    2. Network Accessibility
    3. Capacity & Queue Intelligence
    
    Returns comprehensive connection analysis with probability curve
    """
    
    # Create project record
    project = Project(
        name=request.name,
        latitude=request.latitude,
        longitude=request.longitude,
        peak_generation_mw=request.peak_generation_mw,
        technology_type=request.technology_type,
        connection_voltage=request.connection_voltage,
        project_size=request.project_size,
        geom=ST_GeomFromText(f'POINT({request.longitude} {request.latitude})', 4326)
    )
    db.add(project)
    db.flush()  # Get project ID without committing
    
    # Layer 1: Infrastructure Discovery
    nearby_substations = GridAnalyzer.find_nearby_substations(
        db, request.latitude, request.longitude, radius_km=20.0
    )
    nearby_power_lines = GridAnalyzer.find_nearby_power_lines(
        db, request.latitude, request.longitude, radius_km=20.0
    )
    infrastructure_density = GridAnalyzer.calculate_infrastructure_density(
        db, request.latitude, request.longitude, radius_km=5.0
    )
    
    # Layer 2: Network Accessibility
    nearest_substation = GridAnalyzer.find_nearest_substation(
        db, request.latitude, request.longitude
    )
    
    if not nearest_substation:
        db.rollback()
        raise HTTPException(status_code=404, detail="No substations found in database")
    
    distance_to_nearest = nearest_substation['distance_km']
    grid_accessibility_score = GridAnalyzer.calculate_grid_accessibility_score(
        db, request.latitude, request.longitude, distance_to_nearest, infrastructure_density
    )
    
    # Update project with nearest substation
    project.nearest_substation_id = nearest_substation['id']
    project.estimated_connection_distance = distance_to_nearest
    
    # Layer 3: Capacity & Queue Intelligence
    queue_pressure = GridAnalyzer.estimate_queue_pressure(db, nearest_substation['id'])
    capacity_stress = GridAnalyzer.calculate_capacity_stress(
        db, nearest_substation['id'], request.peak_generation_mw
    )
    
    # Estimate queue years
    estimated_queue_years = queue_pressure.get('average_wait_months', 0) // 12
    project.estimated_queue_years = estimated_queue_years
    
    # Generate probability curve
    probability_curve = GridAnalyzer.generate_connection_probability_curve(
        db, nearest_substation['id'], request.peak_generation_mw
    )
    
    # Save probability data
    for prob_data in probability_curve:
        cp = ConnectionProbability(
            project_id=project.id,
            year=prob_data['year'],
            probability_percent=prob_data['probability_percent']
        )
        db.add(cp)
    
    db.commit()
    
    return ConnectionEstimateResponse(
        project_id=project.id,
        name=request.name,
        latitude=request.latitude,
        longitude=request.longitude,
        peak_generation_mw=request.peak_generation_mw,
        
        # Layer 1
        nearby_substations=nearby_substations[:5],
        nearby_power_lines=nearby_power_lines[:5],
        infrastructure_density=infrastructure_density,
        
        # Layer 2
        nearest_substation=nearest_substation,
        estimated_connection_distance=distance_to_nearest,
        grid_accessibility_score=grid_accessibility_score,
        
        # Layer 3
        estimated_queue_years=estimated_queue_years,
        queue_congestion_signals=queue_pressure,
        capacity_stress_indicators=capacity_stress,
        
        # Probability
        connection_probability_over_time=[
            {'year': p['year'], 'probability_percent': p['probability_percent']}
            for p in probability_curve
        ]
    )

@app.get("/projects/{project_id}")
async def get_project(project_id: int, db: Session = Depends(get_db)):
    """Retrieve a previously analyzed project"""
    project = db.query(Project).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    probabilities = db.query(ConnectionProbability).filter(
        ConnectionProbability.project_id == project_id
    ).all()
    
    nearest_sub = None
    if project.nearest_substation_id:
        from app.models import Substation
        from sqlalchemy import func
        nearest_sub = db.query(
            Substation.id,
            Substation.name,
            Substation.voltage,
            func.ST_Y(Substation.geom).label('latitude'),
            func.ST_X(Substation.geom).label('longitude'),
        ).filter(Substation.id == project.nearest_substation_id).first()
    
    return {
        'id': project.id,
        'name': project.name,
        'latitude': project.latitude,
        'longitude': project.longitude,
        'peak_generation_mw': project.peak_generation_mw,
        'technology_type': project.technology_type,
        'estimated_connection_distance': project.estimated_connection_distance,
        'estimated_queue_years': project.estimated_queue_years,
        'nearest_substation': {
            'id': nearest_sub.id,
            'name': nearest_sub.name,
            'voltage': nearest_sub.voltage,
            'latitude': float(nearest_sub.latitude),
            'longitude': float(nearest_sub.longitude)
        } if nearest_sub else None,
        'connection_probabilities': [
            {'year': p.year, 'probability_percent': p.probability_percent}
            for p in probabilities
        ]
    }

@app.get("/projects")
async def list_projects(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """List all analyzed projects"""
    projects = db.query(Project).offset(skip).limit(limit).all()
    
    return {
        'count': len(projects),
        'projects': [
            {
                'id': p.id,
                'name': p.name,
                'latitude': p.latitude,
                'longitude': p.longitude,
                'peak_generation_mw': p.peak_generation_mw,
                'estimated_queue_years': p.estimated_queue_years
            }
            for p in projects
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
