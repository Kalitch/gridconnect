import React, { useState } from 'react';
import { ZapOff, MapPin, Database } from 'lucide-react';
import './ConnectionForm.css';
import { FormData } from '../../types/api';
import { ExpandableCard } from '../Common/Card';

interface ConnectionFormProps {
  onAnalyze: (data: FormData) => Promise<void>;
  loading: boolean;
}

const defaultFormData: FormData = {
  name: 'My Project',
  latitude: 54.5973,
  longitude: -3.4360,
  peak_generation_mw: 10.0,
  technology_type: 'Solar',
  connection_voltage: '11kV'
};

export const ConnectionForm: React.FC<ConnectionFormProps> = ({ onAnalyze, loading }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'peak_generation_mw' ? parseFloat(value) : value
    }));
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

        <button
          type="submit"
          disabled={loading}
          className="gc-button-primary"
        >
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
          Enter location details to estimate grid connection feasibility and timeline
        </p>
      </form>
    </ExpandableCard>
  );
};
