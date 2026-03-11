import React from 'react';
import { LayoutGrid, Zap, TrendingUp } from "lucide-react";
import './Header.css';

export const Header: React.FC = () => {
  return (
    <header className="gc-header">
      <div className="gc-header-content">
        <div className="gc-header-brand">
          <div className="gc-brand-icon">
            <LayoutGrid size={28} />
          </div>
          <div className="gc-brand-text">
            <h1>GridConnect</h1>
            <p>Geospatial Intelligence for Grid Connections</p>
          </div>
        </div>

        <div className="gc-header-stats">
          <div className="gc-stat">
            <Zap size={18} />
            <span>UK Infrastructure Mapping</span>
          </div>
          <div className="gc-stat">
            <TrendingUp size={18} />
            <span>Real-time Analysis</span>
          </div>
        </div>
      </div>
    </header>
  );
};
