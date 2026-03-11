import React from 'react';
import './MainLayout.css';

interface MainLayoutProps {
  mapComponent: React.ReactNode;
  sidebarComponent: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ mapComponent, sidebarComponent }) => {
  return (
    <div className="gc-layout">
      <div className="gc-map-container">
        {mapComponent}
      </div>
      
      <div className="gc-sidebar">
        {sidebarComponent}
      </div>
    </div>
  );
};
