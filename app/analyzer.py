from sqlalchemy.orm import Session
from sqlalchemy import func
from geoalchemy2 import Geography
from geoalchemy2.functions import ST_DWithin, ST_Distance
from app.models import (
    Substation,
    PowerLine,
    Transformer,
    Project,
    ConnectionProbability,
    QueueData,
)
import math


class GridAnalyzer:
    """Core geospatial analysis engine for GridConnect"""

    @staticmethod
    def _point(latitude: float, longitude: float):
        """Create PostGIS point"""
        return func.ST_SetSRID(func.ST_MakePoint(longitude, latitude), 4326)

    @staticmethod
    def find_nearby_substations(
        db: Session, latitude: float, longitude: float, radius_km: float = 10.0
    ) -> list:

        point = GridAnalyzer._point(latitude, longitude)
        radius_meters = radius_km * 1000

        substations = (
            db.query(
                Substation.id,
                Substation.name,
                Substation.voltage,
                Substation.operator,
                func.ST_Y(Substation.geom).label("latitude"),
                func.ST_X(Substation.geom).label("longitude"),
                ST_Distance(
                    Substation.geom.cast(Geography),
                    point.cast(Geography),
                ).label("distance_meters"),
            )
            .filter(
                ST_DWithin(
                    Substation.geom.cast(Geography),
                    point.cast(Geography),
                    radius_meters,
                )
            )
            .order_by("distance_meters")
            .all()
        )

        return [
            {
                "id": s.id,
                "name": s.name or "Unknown",
                "voltage": s.voltage,
                "operator": s.operator,
                "latitude": float(s.latitude),
                "longitude": float(s.longitude),
                "distance_km": round(s.distance_meters / 1000, 2)
                if s.distance_meters
                else None,
            }
            for s in substations
        ]

    @staticmethod
    def find_nearby_power_lines(
        db: Session, latitude: float, longitude: float, radius_km: float = 10.0
    ) -> list:

        point = GridAnalyzer._point(latitude, longitude)
        radius_meters = radius_km * 1000

        power_lines = (
            db.query(
                PowerLine.id,
                PowerLine.name,
                PowerLine.voltage,
                PowerLine.cables,
                ST_Distance(
                    PowerLine.geom.cast(Geography),
                    point.cast(Geography),
                ).label("distance_meters"),
            )
            .filter(
                ST_DWithin(
                    PowerLine.geom.cast(Geography),
                    point.cast(Geography),
                    radius_meters,
                )
            )
            .order_by("distance_meters")
            .all()
        )

        return [
            {
                "id": pl.id,
                "name": pl.name or "Unknown",
                "voltage": pl.voltage,
                "cables": pl.cables,
                "distance_km": round(pl.distance_meters / 1000, 2)
                if pl.distance_meters
                else None,
            }
            for pl in power_lines
        ]

    @staticmethod
    def find_nearby_transformers(
        db: Session, latitude: float, longitude: float, radius_km: float = 10.0
    ) -> list:

        point = GridAnalyzer._point(latitude, longitude)
        radius_meters = radius_km * 1000

        transformers = (
            db.query(
                Transformer.id,
                Transformer.name,
                Transformer.power_rating,
                ST_Distance(
                    Transformer.geom.cast(Geography),
                    point.cast(Geography),
                ).label("distance_meters"),
            )
            .filter(
                ST_DWithin(
                    Transformer.geom.cast(Geography),
                    point.cast(Geography),
                    radius_meters,
                )
            )
            .order_by("distance_meters")
            .all()
        )

        return [
            {
                "id": t.id,
                "name": t.name or "Unknown",
                "power_rating": t.power_rating,
                "distance_km": round(t.distance_meters / 1000, 2)
                if t.distance_meters
                else None,
            }
            for t in transformers
        ]

    @staticmethod
    def calculate_infrastructure_density(
        db: Session, latitude: float, longitude: float, radius_km: float = 5.0
    ) -> float:

        point = GridAnalyzer._point(latitude, longitude)
        radius_meters = radius_km * 1000

        substations = (
            db.query(func.count(Substation.id))
            .filter(
                ST_DWithin(
                    Substation.geom.cast(Geography),
                    point.cast(Geography),
                    radius_meters,
                )
            )
            .scalar()
            or 0
        )

        density = min(substations / 10.0, 1.0)
        return round(density, 3)

    @staticmethod
    def find_nearest_substation(db: Session, latitude: float, longitude: float):

        point = GridAnalyzer._point(latitude, longitude)

        nearest = (
            db.query(
                Substation.id,
                Substation.name,
                Substation.voltage,
                Substation.operator,
                func.ST_Y(Substation.geom).label("latitude"),
                func.ST_X(Substation.geom).label("longitude"),
                ST_Distance(
                    Substation.geom.cast(Geography),
                    point.cast(Geography),
                ).label("distance_meters"),
            )
            .order_by("distance_meters")
            .first()
        )

        if not nearest:
            return None

        return {
            "id": nearest.id,
            "name": nearest.name or "Unknown",
            "voltage": nearest.voltage,
            "operator": nearest.operator,
            "latitude": float(nearest.latitude),
            "longitude": float(nearest.longitude),
            "distance_km": round(nearest.distance_meters / 1000, 2),
        }

    @staticmethod
    def calculate_grid_accessibility_score(
        db: Session,
        latitude: float,
        longitude: float,
        distance_to_nearest_substation: float,
        infrastructure_density: float,
    ) -> float:

        distance_score = max(0, 40 * (1 - (distance_to_nearest_substation / 25.0)))
        density_score = infrastructure_density * 40

        point = GridAnalyzer._point(latitude, longitude)

        nearby_lines = (
            db.query(func.count(PowerLine.id))
            .filter(
                ST_DWithin(
                    PowerLine.geom.cast(Geography),
                    point.cast(Geography),
                    2000,
                )
            )
            .scalar()
            or 0
        )

        transmission_score = min(nearby_lines * 5, 20)

        total_score = distance_score + density_score + transmission_score
        return round(total_score, 1)

    @staticmethod
    def estimate_queue_pressure(db: Session, substation_id: int) -> dict:

        queue_data = (
            db.query(QueueData).filter(QueueData.substation_id == substation_id).first()
        )

        if not queue_data:
            return {
                "mw_in_queue": 0.0,
                "projects_in_queue": 0,
                "average_wait_months": 0,
                "status": "no_data",
            }

        return {
            "mw_in_queue": queue_data.mw_in_queue or 0.0,
            "projects_in_queue": queue_data.projects_in_queue or 0,
            "average_wait_months": queue_data.average_wait_months or 0,
            "status": GridAnalyzer._assess_queue_status(
                queue_data.projects_in_queue or 0, queue_data.average_wait_months or 0
            ),
        }

    @staticmethod
    def _assess_queue_status(projects_in_queue: int, average_wait_months: int) -> str:

        if projects_in_queue == 0:
            return "available"
        elif projects_in_queue < 3 and average_wait_months < 12:
            return "low_congestion"
        elif projects_in_queue < 8 and average_wait_months < 24:
            return "moderate_congestion"
        else:
            return "high_congestion"

    @staticmethod
    def generate_connection_probability_curve(
        db: Session,
        substation_id: int,
        peak_generation_mw: float,
        current_year: int = 2026,
    ) -> list:

        queue_data = (
            db.query(QueueData).filter(QueueData.substation_id == substation_id).first()
        )

        base_wait_months = queue_data.average_wait_months or 0 if queue_data else 0
        projects_queue = queue_data.projects_in_queue or 0 if queue_data else 0

        years_until_connection = max(
            1, (base_wait_months / 12) + (projects_queue * 0.5)
        )

        curve = []
        for year_offset in range(0, 6):

            year = current_year + year_offset

            x = (year_offset - years_until_connection) / 2.0
            probability = 100.0 / (1.0 + math.exp(-x))

            curve.append({"year": year, "probability_percent": round(probability, 1)})

        return curve

    @staticmethod
    def calculate_capacity_stress(
        db: Session, substation_id: int, new_project_mw: float
    ) -> dict:

        queue_data = (
            db.query(QueueData).filter(QueueData.substation_id == substation_id).first()
        )

        mw_in_queue = (queue_data.mw_in_queue or 0.0) if queue_data else 0.0

        assumed_capacity = 150.0
        utilization_before = mw_in_queue / assumed_capacity
        utilization_after = (mw_in_queue + new_project_mw) / assumed_capacity

        return {
            "current_utilization": round(utilization_before * 100, 1),
            "utilization_after_project": round(utilization_after * 100, 1),
            "stress_level": GridAnalyzer._assess_stress_level(utilization_after),
            "has_capacity": utilization_after < 1.0,
        }

    @staticmethod
    def _assess_stress_level(utilization: float) -> str:

        if utilization < 0.5:
            return "low"
        elif utilization < 0.75:
            return "moderate"
        elif utilization < 0.95:
            return "high"
        else:
            return "critical"