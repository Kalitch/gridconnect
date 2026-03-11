from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List

# ===== Infrastructure Schemas =====

class SubstationBase(BaseModel):
    name: Optional[str] = None
    voltage: Optional[str] = None
    ref: Optional[str] = None
    operator: Optional[str] = None

class SubstationResponse(SubstationBase):
    id: int
    osm_id: int
    latitude: float = Field(alias="lat")
    longitude: float = Field(alias="lon")

    class Config:
        from_attributes = True

class PowerLineResponse(BaseModel):
    id: int
    osm_id: int
    name: Optional[str] = None
    voltage: Optional[str] = None
    cables: Optional[str] = None
    frequency: Optional[str] = None

    class Config:
        from_attributes = True

class TransformerResponse(BaseModel):
    id: int
    osm_id: int
    name: Optional[str] = None
    power_rating: Optional[str] = None
    phases: Optional[str] = None

    class Config:
        from_attributes = True

# ===== Queue Data Schemas =====

class QueueDataResponse(BaseModel):
    id: int
    substation_id: int
    mw_in_queue: Optional[float] = None
    projects_in_queue: Optional[int] = None
    average_wait_months: Optional[int] = None
    last_updated: Optional[datetime] = None

    class Config:
        from_attributes = True

# ===== Connection Probability Schemas =====

class ConnectionProbabilityResponse(BaseModel):
    year: int
    probability_percent: float

    class Config:
        from_attributes = True

# ===== Project/Connection Request Schemas =====

class ConnectionEstimateRequest(BaseModel):
    latitude: float
    longitude: float
    peak_generation_mw: float
    name: Optional[str] = "Unnamed Project"
    technology_type: Optional[str] = None
    connection_voltage: Optional[str] = None
    project_size: Optional[str] = None

class ConnectionEstimateResponse(BaseModel):
    project_id: int
    name: str
    latitude: float
    longitude: float
    peak_generation_mw: float
    
    # Layer 1: Infrastructure Discovery
    nearby_substations: List[dict]
    nearby_power_lines: List[dict]
    infrastructure_density: float
    
    # Layer 2: Network Accessibility
    nearest_substation: dict
    estimated_connection_distance: float
    estimated_connection_path: Optional[dict] = None
    grid_accessibility_score: float
    
    # Layer 3: Capacity & Queue Intelligence
    estimated_queue_years: int
    queue_congestion_signals: dict
    capacity_stress_indicators: dict
    
    # Probability Curve
    connection_probability_over_time: List[ConnectionProbabilityResponse]

class InfrastructureNearbyRequest(BaseModel):
    latitude: float
    longitude: float
    radius_km: float = 10.0

class InfrastructureNearbyResponse(BaseModel):
    substations: List[dict]
    power_lines: List[dict]
    transformers: List[dict]
    infrastructure_density: float
