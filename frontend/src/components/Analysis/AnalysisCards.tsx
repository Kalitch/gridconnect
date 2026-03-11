import React from 'react';
import { LayoutGrid, AlertTriangle, CheckCircle } from 'lucide-react';
import './AnalysisCards.css';
import { ConnectionEstimateResponse } from '../../types/api';
import { ExpandableCard, SimpleCard } from '../Common/Card';

interface InfrastructureCardProps {
  data: ConnectionEstimateResponse;
}

export const InfrastructureCard: React.FC<InfrastructureCardProps> = ({ data }) => {
  const densityPercent = Math.round(data.infrastructure_density * 100);
  const nearbySubstations = data.nearby_substations.length;
  const powerLines = data.nearby_power_lines.length;

  const getDensityStatus = (density: number): 'good' | 'moderate' | 'low' => {
    if (density > 0.5) return 'good';
    if (density > 0.2) return 'moderate';
    return 'low';
  };

  const status = getDensityStatus(data.infrastructure_density);
  const statusColors = {
    good: { bg: '#dcfce7', border: '#22c55e', text: '#16a34a' },
    moderate: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
    low: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' }
  };

  return (
    <ExpandableCard
      title="Grid Infrastructure"
      icon={<LayoutGrid size={20} />}
      badge={status.toUpperCase()}
      badgeColor={status === 'good' ? 'green' : status === 'moderate' ? 'yellow' : 'red'}
      defaultExpanded={true}
    >
      <div className="gc-infrastructure-grid">
        <div className="gc-metric-card">
          <div className="gc-metric-label">Nearby Substations</div>
          <div className="gc-metric-value">{nearbySubstations}</div>
          <div className="gc-metric-subtext">within 5 km</div>
        </div>

        <div className="gc-metric-card">
          <div className="gc-metric-label">Power Lines</div>
          <div className="gc-metric-value">{powerLines}</div>
          <div className="gc-metric-subtext">nearby</div>
        </div>

        <div className="gc-metric-card">
          <div className="gc-metric-label">Infrastructure Density</div>
          <div className="gc-metric-value">{densityPercent}%</div>
          <div className="gc-metric-subtext">in region</div>
        </div>
      </div>

      <div className="gc-status-box" style={statusColors[status]}>
        {status === 'good' ? (
          <>
            <CheckCircle size={18} />
            <span>Strong infrastructure density in this area</span>
          </>
        ) : status === 'moderate' ? (
          <>
            <AlertTriangle size={18} />
            <span>Moderate infrastructure density</span>
          </>
        ) : (
          <>
            <AlertTriangle size={18} />
            <span>Low infrastructure density - may increase connection difficulty</span>
          </>
        )}
      </div>

      {data.nearby_substations.length > 0 && (
        <div className="gc-table-wrapper">
          <table className="gc-substations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Voltage</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {data.nearby_substations.slice(0, 5).map(sub => (
                <tr key={sub.id}>
                  <td>{sub.name || 'Unknown'}</td>
                  <td>{sub.voltage || '-'}</td>
                  <td>{sub.distance_km.toFixed(1)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ExpandableCard>
  );
};

interface AccessibilityCardProps {
  data: ConnectionEstimateResponse;
}

export const AccessibilityCard: React.FC<AccessibilityCardProps> = ({ data }) => {
  const score = Math.round(data.grid_accessibility_score);
  const getScoreColor = (score: number): string => {
    if (score >= 75) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <ExpandableCard
      title="Network Accessibility"
      icon={<LayoutGrid size={20} />}
      defaultExpanded={true}
    >
      <div className="gc-accessibility-grid">
        <SimpleCard>
          <div className="gc-metric-label">Accessibility Score</div>
          <div className="gc-score-display" style={{ color: getScoreColor(score) }}>
            <div className="gc-score-value">{score}</div>
            <div className="gc-score-max">/100</div>
          </div>
        </SimpleCard>

        <SimpleCard>
          <div className="gc-metric-label">Nearest Substation</div>
          <div className="gc-metric-value" style={{ fontSize: '16px' }}>
            {data.nearest_substation?.name || 'Unknown'}
          </div>
          <div className="gc-metric-subtext">
            {data.estimated_connection_distance.toFixed(1)} km away
          </div>
        </SimpleCard>
      </div>

      <div className="gc-progress-bar">
        <div className="gc-progress-fill" style={{
          width: `${score}%`,
          backgroundColor: getScoreColor(score)
        }} />
      </div>

      <div className="gc-accessibility-details">
        <h4>Key Metrics</h4>
        <ul>
          <li>
            <span>Connection Distance:</span>
            <strong>{data.estimated_connection_distance.toFixed(1)} km</strong>
          </li>
          <li>
            <span>Nearby Infrastructure:</span>
            <strong>{data.nearby_substations.length} substations</strong>
          </li>
          <li>
            <span>Grid Density Score:</span>
            <strong>{Math.round(data.infrastructure_density * 100)}%</strong>
          </li>
        </ul>
      </div>
    </ExpandableCard>
  );
};

interface QueueCapacityCardProps {
  data: ConnectionEstimateResponse;
}

export const QueueCapacityCard: React.FC<QueueCapacityCardProps> = ({ data }) => {
  const queue = data.queue_congestion_signals;
  const stress = data.capacity_stress_indicators;
  const queueYears = data.estimated_queue_years;

  const getStressLevel = (level: string): { color: string; bg: string } => {
    const colors = {
      low: { color: '#22c55e', bg: '#dcfce7' },
      moderate: { color: '#f59e0b', bg: '#fef3c7' },
      high: { color: '#ef4444', bg: '#fee2e2' },
      critical: { color: '#991b1b', bg: '#fee2e2' }
    };
    return colors[level as keyof typeof colors] || colors.low;
  };

  const stressStyle = getStressLevel(stress.stress_level);

  return (
    <ExpandableCard
      title="Queue & Capacity"
      icon={<LayoutGrid size={20} />}
      badge={stress.stress_level.toUpperCase()}
      badgeColor={stress.stress_level === 'critical' ? 'red' : stress.stress_level === 'high' ? 'red' : 'yellow'}
      defaultExpanded={true}
    >
      <div className="gc-queue-grid">
        <div className="gc-metric-card">
          <div className="gc-metric-label">Estimated Queue Time</div>
          <div className="gc-metric-value">{queueYears}</div>
          <div className="gc-metric-subtext">years</div>
        </div>

        <div className="gc-metric-card">
          <div className="gc-metric-label">MW in Queue</div>
          <div className="gc-metric-value">{queue.mw_in_queue}</div>
          <div className="gc-metric-subtext">before your project</div>
        </div>

        <div className="gc-metric-card">
          <div className="gc-metric-label">Projects in Queue</div>
          <div className="gc-metric-value">{queue.projects_in_queue}</div>
          <div className="gc-metric-subtext">ahead of you</div>
        </div>
      </div>

      <div className="gc-stress-indicator" style={{ backgroundColor: stressStyle.bg }}>
        <span style={{ color: stressStyle.color }}>
          <strong>Capacity Stress: {stress.stress_level.toUpperCase()}</strong>
        </span>
        <p>Current utilization: {Math.round(stress.current_utilization)}%</p>
        <p>After your project: {Math.round(stress.utilization_after_project)}%</p>
      </div>

      <div className="gc-queue-details">
        <h4>Queue Information</h4>
        <ul>
          <li>
            <span>Average Wait Time:</span>
            <strong>{queue.average_wait_months} months</strong>
          </li>
          <li>
            <span>Connection Status:</span>
            <strong>{stress.has_capacity ? 'Capacity Available' : 'Constrained'}</strong>
          </li>
          <li>
            <span>Congestion Level:</span>
            <strong>{queue.status.replace(/_/g, ' ')}</strong>
          </li>
        </ul>
      </div>
    </ExpandableCard>
  );
};
