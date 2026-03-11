-- Create PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Create substations table
CREATE TABLE substations (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    voltage VARCHAR(50),
    ref VARCHAR(100),
    operator VARCHAR(255),
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on substations
CREATE INDEX idx_substations_geom ON substations USING GIST (geom);

-- Create power lines table
CREATE TABLE power_lines (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    voltage VARCHAR(50),
    cables VARCHAR(50),
    frequency VARCHAR(50),
    geom GEOMETRY(LineString, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on power lines
CREATE INDEX idx_power_lines_geom ON power_lines USING GIST (geom);

-- Create transformers table
CREATE TABLE transformers (
    id SERIAL PRIMARY KEY,
    osm_id BIGINT UNIQUE,
    name VARCHAR(255),
    power_rating VARCHAR(100),
    phases VARCHAR(50),
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on transformers
CREATE INDEX idx_transformers_geom ON transformers USING GIST (geom);

-- Create projects table (for tracking connections and queue data)
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    latitude FLOAT,
    longitude FLOAT,
    peak_generation_mw FLOAT,
    technology_type VARCHAR(100),
    connection_voltage VARCHAR(50),
    project_size VARCHAR(100),
    geom GEOMETRY(Point, 4326),
    nearest_substation_id INTEGER REFERENCES substations(id),
    estimated_connection_distance FLOAT,
    estimated_queue_years INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index on projects
CREATE INDEX idx_projects_geom ON projects USING GIST (geom);

-- Create connection_probability table (time-series data)
CREATE TABLE connection_probability (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    year INTEGER,
    probability_percent FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on project_id for fast queries
CREATE INDEX idx_connection_probability_project_id ON connection_probability(project_id);

-- Create queue_data table (for ECR and capacity intelligence)
CREATE TABLE queue_data (
    id SERIAL PRIMARY KEY,
    substation_id INTEGER REFERENCES substations(id),
    mw_in_queue FLOAT,
    projects_in_queue INTEGER,
    average_wait_months INTEGER,
    last_updated TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for substation queries
CREATE INDEX idx_queue_data_substation_id ON queue_data(substation_id);
