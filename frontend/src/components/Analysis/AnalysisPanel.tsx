import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';
import './AnalysisPanel.css';
import { ConnectionEstimateResponse } from '../../types/api';
import { InfrastructureCard, AccessibilityCard, QueueCapacityCard } from './AnalysisCards';
import { ExpandableCard } from '../Common/Card';

interface AnalysisPanelProps {
  data: ConnectionEstimateResponse | null;
  loading: boolean;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="gc-analysis-panel">
        <div className="gc-loading">
          <div className="gc-spinner" />
          <p>Analyzing grid connection...</p>
        </div>
      </div>
    );
  }

  // If no data, don't show results
  if (!data) {
    return null;
  }

  const chartData = data.connection_probability_over_time.map(prob => ({
    year: prob.year,
    probability: prob.probability_percent
  }));

  return (
    <div className="gc-analysis-panel">
      <div className="gc-panel-header">
        <h2>Analysis Results</h2>
        <p>{data.name} - {data.peak_generation_mw} MW</p>
      </div>

      <div className="gc-analysis-cards">
        <InfrastructureCard data={data} />
        <AccessibilityCard data={data} />
        <QueueCapacityCard data={data} />

        <ExpandableCard
          title="Connection Probability"
          icon={<TrendingUp size={20} />}
          defaultExpanded={true}
        >
          <div className="gc-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="year"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${Math.round(value as number)}%`, 'Probability']}
                />
                <Line
                  type="monotone"
                  dataKey="probability"
                  stroke="#3b82f6"
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="gc-chart-note">
              Projected connection probability over the next 6 years based on current queue and capacity levels.
            </p>
          </div>
        </ExpandableCard>

        <ExpandableCard
          title="Summary & Recommendations"
          icon={<TrendingUp size={20} />}
          defaultExpanded={true}
        >
          <div className="gc-summary">
            <div className="gc-recommendation-item">
              <h4>📍 Location Assessment</h4>
              <p>
                Your project is located {data.estimated_connection_distance.toFixed(1)} km
                from the nearest substation. Infrastructure density in this area is{' '}
                <strong>{Math.round(data.infrastructure_density * 100)}%</strong>.
              </p>
            </div>

            <div className="gc-recommendation-item">
              <h4>⏱️ Timeline Expectation</h4>
              <p>
                Based on current queue congestion, expect approximately{' '}
                <strong>{data.estimated_queue_years} years</strong> before connection approval.
                There are {data.queue_congestion_signals.projects_in_queue} projects ahead in the queue.
              </p>
            </div>

            <div className="gc-recommendation-item">
              <h4>🔌 Capacity Status</h4>
              <p>
                Grid capacity stress is currently{' '}
                <strong>{data.capacity_stress_indicators.stress_level}</strong>.
                Your project would increase utilization to{' '}
                <strong>{Math.round(data.capacity_stress_indicators.utilization_after_project)}%</strong>.
              </p>
            </div>

            <div className="gc-recommendation-item">
              <h4>✅ Next Steps</h4>
              <ul>
                <li>Contact local DNO (Distribution Network Operator) with your project details</li>
                <li>Confirm connection point and voltage level with grid operator</li>
                <li>Monitor queue position and infrastructure updates</li>
                <li>Plan timeline with expected connection date in mind</li>
              </ul>
            </div>
          </div>
        </ExpandableCard>
      </div>
    </div>
  );
};
