#!/usr/bin/env python3
"""
OSM Data Importer for GridConnect
Parses OpenStreetMap PBF files and extracts electricity infrastructure
"""

import argparse
import logging
from pathlib import Path
import osmium

from sqlalchemy.orm import Session
from app import SessionLocal
from app.models import Substation, PowerLine, Transformer
from geoalchemy2.functions import ST_GeomFromText

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ElectricityInfrastructureHandler(osmium.SimpleHandler):
    """OSM handler for extracting electricity infrastructure"""

    def __init__(self, db_session: Session):
        super().__init__()
        self.db_session = db_session

        self.substation_count = 0
        self.power_line_count = 0
        self.transformer_count = 0
        self.skipped_count = 0

        self.batch_size = 1000

    def node(self, n):
        """Process OSM nodes"""
        if "power" not in n.tags:
            return

        try:
            power_type = n.tags.get("power")

            if power_type == "substation":
                self._process_substation_node(n)

            elif power_type == "transformer":
                self._process_transformer_node(n)

        except Exception as e:
            logger.warning(f"Error processing node {n.id}: {e}")
            self.skipped_count += 1

    def way(self, w):
        """Process OSM ways"""
        if "power" not in w.tags:
            return

        try:
            power_type = w.tags.get("power")

            if power_type == "line":
                self._process_power_line(w)

        except Exception as e:
            logger.warning(f"Error processing way {w.id}: {e}")
            self.skipped_count += 1

    def _process_substation_node(self, node):
        """Extract substation from node"""

        if not node.location.valid():
            return

        existing = (
            self.db_session.query(Substation)
            .filter(Substation.osm_id == node.id)
            .first()
        )

        if existing:
            return

        substation = Substation(
            osm_id=node.id,
            name=node.tags.get("name"),
            voltage=node.tags.get("voltage"),
            ref=node.tags.get("ref"),
            operator=node.tags.get("operator"),
            geom=ST_GeomFromText(
                f"POINT({node.location.lon} {node.location.lat})", 4326
            ),
        )

        self.db_session.add(substation)
        self.substation_count += 1

        if self.substation_count % self.batch_size == 0:
            self.db_session.commit()
            logger.info(f"Processed {self.substation_count} substations")

    def _process_transformer_node(self, node):
        """Extract transformer from node"""

        if not node.location.valid():
            return

        existing = (
            self.db_session.query(Transformer)
            .filter(Transformer.osm_id == node.id)
            .first()
        )

        if existing:
            return

        transformer = Transformer(
            osm_id=node.id,
            name=node.tags.get("name"),
            power_rating=node.tags.get("power"),
            phases=node.tags.get("phases"),
            geom=ST_GeomFromText(
                f"POINT({node.location.lon} {node.location.lat})", 4326
            ),
        )

        self.db_session.add(transformer)
        self.transformer_count += 1

        if self.transformer_count % self.batch_size == 0:
            self.db_session.commit()
            logger.info(f"Processed {self.transformer_count} transformers")

    def _process_power_line(self, way):
        """Extract power line from way"""

        try:
            coords = [(node.lon, node.lat) for node in way.nodes]

            if len(coords) < 2:
                return

        except Exception:
            return

        existing = (
            self.db_session.query(PowerLine).filter(PowerLine.osm_id == way.id).first()
        )

        if existing:
            return

        line_wkt = f"LINESTRING({', '.join([f'{lon} {lat}' for lon, lat in coords])})"

        power_line = PowerLine(
            osm_id=way.id,
            name=way.tags.get("name"),
            voltage=way.tags.get("voltage"),
            cables=way.tags.get("cables"),
            frequency=way.tags.get("frequency"),
            geom=ST_GeomFromText(line_wkt, 4326),
        )

        self.db_session.add(power_line)
        self.power_line_count += 1

        if self.power_line_count % self.batch_size == 0:
            self.db_session.commit()
            logger.info(f"Processed {self.power_line_count} power lines")


def import_osm_data(pbf_file: str) -> None:
    """Import OSM data from PBF file"""

    pbf_path = Path(pbf_file)

    if not pbf_path.exists():
        logger.error(f"File not found: {pbf_file}")
        return

    logger.info(f"Starting import from {pbf_file}")

    db = SessionLocal()

    try:
        handler = ElectricityInfrastructureHandler(db)

        handler.apply_file(pbf_file, locations=True)

        db.commit()

        logger.info("Import complete")
        logger.info(f"Substations: {handler.substation_count}")
        logger.info(f"Power Lines: {handler.power_line_count}")
        logger.info(f"Transformers: {handler.transformer_count}")
        logger.info(f"Skipped: {handler.skipped_count}")

    except Exception as e:
        logger.error(f"Import failed: {e}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import OSM electricity data")
    parser.add_argument("pbf_file", help="Path to OSM PBF file")

    args = parser.parse_args()

    import_osm_data(args.pbf_file)
