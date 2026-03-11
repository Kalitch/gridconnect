import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import './Card.css';

interface ExpandableCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  badge?: string;
  badgeColor?: 'green' | 'yellow' | 'red' | 'blue';
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  title,
  icon,
  children,
  defaultExpanded = true,
  badge,
  badgeColor = 'blue'
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="gc-card">
      <div
        className="gc-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="gc-card-title">
          {icon && <span className="gc-card-icon">{icon}</span>}
          <h3>{title}</h3>
          {badge && (
            <span className={`gc-badge gc-badge-${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
        <ChevronDown
          size={20}
          className={`gc-chevron ${isExpanded ? 'expanded' : ''}`}
        />
      </div>

      {isExpanded && (
        <div className="gc-card-content">
          {children}
        </div>
      )}
    </div>
  );
};

// Simple card without expand/collapse
interface SimpleCardProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleCard: React.FC<SimpleCardProps> = ({ children, className }) => {
  return <div className={`gc-simple-card ${className || ''}`}>{children}</div>;
};
