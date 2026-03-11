from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, BigInteger
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from datetime import datetime
from app import Base

class Substation(Base):
    __tablename__ = "substations"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(BigInteger, unique=True)
    name = Column(String(255), nullable=True)
    voltage = Column(String(50), nullable=True)
    ref = Column(String(100), nullable=True)
    operator = Column(String(255), nullable=True)
    geom = Column(Geometry("POINT", srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    queue_data = relationship("QueueData", back_populates="substation")
    projects = relationship("Project", back_populates="nearest_substation")

class PowerLine(Base):
    __tablename__ = "power_lines"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(BigInteger, unique=True)
    name = Column(String(255), nullable=True)
    voltage = Column(String(50), nullable=True)
    cables = Column(String(50), nullable=True)
    frequency = Column(String(50), nullable=True)
    geom = Column(Geometry("LINESTRING", srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)

class Transformer(Base):
    __tablename__ = "transformers"

    id = Column(Integer, primary_key=True, index=True)
    osm_id = Column(BigInteger, unique=True)
    name = Column(String(255), nullable=True)
    power_rating = Column(String(100), nullable=True)
    phases = Column(String(50), nullable=True)
    geom = Column(Geometry("POINT", srid=4326))
    created_at = Column(DateTime, default=datetime.utcnow)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    latitude = Column(Float)
    longitude = Column(Float)
    peak_generation_mw = Column(Float)
    technology_type = Column(String(100), nullable=True)
    connection_voltage = Column(String(50), nullable=True)
    project_size = Column(String(100), nullable=True)
    geom = Column(Geometry("POINT", srid=4326))
    nearest_substation_id = Column(Integer, ForeignKey("substations.id"), nullable=True)
    estimated_connection_distance = Column(Float, nullable=True)
    estimated_queue_years = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    nearest_substation = relationship("Substation", back_populates="projects")
    connection_probabilities = relationship("ConnectionProbability", back_populates="project")

class ConnectionProbability(Base):
    __tablename__ = "connection_probability"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"))
    year = Column(Integer)
    probability_percent = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="connection_probabilities")

class QueueData(Base):
    __tablename__ = "queue_data"

    id = Column(Integer, primary_key=True, index=True)
    substation_id = Column(Integer, ForeignKey("substations.id"))
    mw_in_queue = Column(Float, nullable=True)
    projects_in_queue = Column(Integer, nullable=True)
    average_wait_months = Column(Integer, nullable=True)
    last_updated = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    substation = relationship("Substation", back_populates="queue_data")
