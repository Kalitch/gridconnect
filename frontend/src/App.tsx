import React, { useState } from 'react';
import './App.css';
import { Header } from './components/Layout/Header';
import { MainLayout } from './components/Layout/MainLayout';
import { MapComponent } from './components/Map/MapComponent';
import { ConnectionForm } from './components/Forms/ConnectionForm';
import { AnalysisPanel } from './components/Analysis/AnalysisPanel';
import { ConnectionEstimateResponse, FormData } from './types/api';

interface AppState {
  selectedProject: ConnectionEstimateResponse | null;
  analysisData: ConnectionEstimateResponse | null;
  loading: boolean;
  mapCenter: [number, number];
}

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    selectedProject: null,
    analysisData: null,
    loading: false,
    mapCenter: [54.5973, -3.4360], // UK center
  });

  const handleAnalyze = async (formData: FormData): Promise<void> => {
    setState(prev => ({ ...prev, loading: true }));
    
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await fetch(`${apiUrl}/connection-estimate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const data: ConnectionEstimateResponse = await response.json();
      setState(prev => ({
        ...prev,
        analysisData: data,
        selectedProject: data,
        mapCenter: [formData.latitude, formData.longitude],
        loading: false
      }));
    } catch (error) {
      console.error('Error:', error);
      setState(prev => ({ ...prev, loading: false }));
      alert('Failed to analyze location. Please check your inputs.');
    }
  };

  return (
    <div className="app">
      <Header />
      <MainLayout
        mapComponent={
          <MapComponent
            center={state.mapCenter}
            selectedProject={state.selectedProject}
            analysisData={state.analysisData}
          />
        }
        sidebarComponent={
          <div className="gc-sidebar-content">
            <ConnectionForm
              onAnalyze={handleAnalyze}
              loading={state.loading}
            />
            {state.analysisData && (
              <AnalysisPanel
                data={state.analysisData}
                loading={state.loading}
              />
            )}
          </div>
        }
      />
    </div>
  );
};

export default App;
