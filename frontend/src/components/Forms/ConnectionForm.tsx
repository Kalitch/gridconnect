import React, { useState, useEffect } from "react";
import { ZapOff, MapPin, Database, Search } from "lucide-react";
import "./ConnectionForm.css";
import { FormData } from "../../types/api";
import { ExpandableCard } from "../Common/Card";

interface ConnectionFormProps {
  onAnalyze: (data: FormData) => Promise<void>;
  loading: boolean;
  locationState?: { lat: number; lng: number };
  onLocationChange?: (lat: number, lng: number) => void;
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const defaultFormData: FormData = {
  name: "My Project",
  latitude: 54.5973,
  longitude: -3.436,
  peak_generation_mw: 10.0,
  technology_type: "Solar",
  connection_voltage: "11kV",
};

export const ConnectionForm: React.FC<ConnectionFormProps> = ({
  onAnalyze,
  loading,
  locationState,
  onLocationChange,
}) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Sync with external location state (e.g., from Map clicks)
  useEffect(() => {
    if (locationState) {
      setFormData((prev) => ({
        ...prev,
        latitude: locationState.lat,
        longitude: locationState.lng,
      }));
    }
  }, [locationState]);

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`,
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data.slice(0, 5));
            setShowResults(true);
          }
        } catch (e) {
          console.error("Error searching address", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const isCoordinate = name === "latitude" || name === "longitude";
    let parsedValue: string | number = value;

    if (name === "peak_generation_mw" || isCoordinate) {
      parsedValue = parseFloat(value);
      if (isNaN(parsedValue)) parsedValue = 0;
    }

    setFormData((prev) => {
      const newData = { ...prev, [name]: parsedValue };
      // If coordinates manually changed, notify parent to re-center map
      if (isCoordinate && onLocationChange) {
        onLocationChange(
          name === "latitude" ? (parsedValue as number) : newData.latitude,
          name === "longitude" ? (parsedValue as number) : newData.longitude,
        );
      }
      return newData;
    });
  };

 
  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lon = parseFloat(result.lon);

    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lon }));
    
    // Clear the search query / you can change that to show the selected result instead
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);

    if (onLocationChange) {
      onLocationChange(lat, lon);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAnalyze(formData);
  };

  return (
    <ExpandableCard
      title="Connection Analysis"
      icon={<MapPin size={20} />}
      defaultExpanded={true}
    >
      <form className="gc-form" onSubmit={handleSubmit}>
        <div className="gc-form-group">
          <label htmlFor="name">Project Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="My Renewable Project"
            className="gc-input"
          />
        </div>

        {/* Address Search */}
        <div className="gc-form-group gc-search-container">
          <label htmlFor="search">Search Location</label>
          <div className="gc-input-with-icon">
            <Search size={16} />
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address or area..."
              className="gc-input-search"
              autoComplete="off"
            />
            {isSearching && <span className="gc-spinner-small" />}
          </div>

          {showResults && searchResults.length > 0 && (
            <ul className="gc-search-results">
              {searchResults.map((result) => (
                <li
                  key={result.place_id}
                  onClick={() => handleResultClick(result)}
                  className="gc-search-result-item"
                >
                  <MapPin size={14} className="gc-search-icon" />
                  <span>{result.display_name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="gc-form-row">
          <div className="gc-form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              id="latitude"
              name="latitude"
              type="number"
              step="0.0001"
              value={formData.latitude}
              onChange={handleChange}
              className="gc-input"
            />
          </div>
          <div className="gc-form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              id="longitude"
              name="longitude"
              type="number"
              step="0.0001"
              value={formData.longitude}
              onChange={handleChange}
              className="gc-input"
            />
          </div>
        </div>

        <div className="gc-form-group">
          <label htmlFor="peak_generation">Peak Capacity (MW)</label>
          <div className="gc-input-with-icon">
            <ZapOff size={16} />
            <input
              id="peak_generation"
              name="peak_generation_mw"
              type="number"
              step="0.1"
              min="0"
              value={formData.peak_generation_mw}
              onChange={handleChange}
              className="gc-input"
            />
          </div>
        </div>

        <div className="gc-form-row">
          <div className="gc-form-group">
            <label htmlFor="technology">Technology</label>
            <select
              id="technology"
              name="technology_type"
              value={formData.technology_type}
              onChange={handleChange}
              className="gc-input"
            >
              <option>Solar</option>
              <option>Wind</option>
              <option>Hydro</option>
              <option>Biomass</option>
              <option>Other</option>
            </select>
          </div>
          <div className="gc-form-group">
            <label htmlFor="voltage">Connection Voltage</label>
            <input
              id="voltage"
              name="connection_voltage"
              type="text"
              value={formData.connection_voltage}
              onChange={handleChange}
              placeholder="11kV"
              className="gc-input"
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="gc-button-primary">
          {loading ? (
            <>
              <span className="gc-spinner" />
              Analyzing...
            </>
          ) : (
            <>
              <Database size={16} />
              Analyze Connection
            </>
          )}
        </button>

        <p className="gc-form-note">
          Enter location details to estimate grid connection feasibility and
          timeline
        </p>
      </form>
    </ExpandableCard>
  );
};
