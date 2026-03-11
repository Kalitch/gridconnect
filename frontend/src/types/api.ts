// API Response Types
export interface Substation {
  id: number;
  name: string;
  voltage: string | null;
  operator: string | null;
  latitude: number;
  longitude: number;
  distance_km: number;
}

export interface PowerLine {
  id: number;
  name: string;
  voltage: string | null;
  cables: string | null;
  distance_km: number;
}

export interface ConnectionEstimateRequest {
  name: string;
  latitude: number;
  longitude: number;
  peak_generation_mw: number;
  technology_type?: string;
  connection_voltage?: string;
}

export interface QueueSignals {
  mw_in_queue: number;
  projects_in_queue: number;
  average_wait_months: number;
  status: 'available' | 'low_congestion' | 'moderate_congestion' | 'high_congestion';
}

export interface CapacityStress {
  current_utilization: number;
  utilization_after_project: number;
  stress_level: 'low' | 'moderate' | 'high' | 'critical';
  has_capacity: boolean;
}

export interface ConnectionProbability {
  year: number;
  probability_percent: number;
}

export interface ConnectionEstimateResponse {
  project_id: number;
  name: string;
  latitude: number;
  longitude: number;
  peak_generation_mw: number;
  
  // Layer 1
  nearby_substations: Substation[];
  nearby_power_lines: PowerLine[];
  infrastructure_density: number;
  
  // Layer 2
  nearest_substation: Substation;
  estimated_connection_distance: number;
  grid_accessibility_score: number;
  
  // Layer 3
  estimated_queue_years: number;
  queue_congestion_signals: QueueSignals;
  capacity_stress_indicators: CapacityStress;
  
  // Probability
  connection_probability_over_time: ConnectionProbability[];
}

export interface FormData {
  name: string;
  latitude: number;
  longitude: number;
  peak_generation_mw: number;
  technology_type: string;
  connection_voltage: string;
}

export interface AnalysisState {
  isLoading: boolean;
  error: string | null;
  data: ConnectionEstimateResponse | null;
  expanded: {
    infrastructure: boolean;
    accessibility: boolean;
    queue: boolean;
  };
}
