import React from 'react';
import '../styles/StatPanel.css';

const StatPanel = ({ title, value, color }) => {
    return (
        <div className="stat-panel" style={{ borderTop: `4px solid ${color}` }}>
            <h3 className="stat-title">{title}</h3>
            <p className="stat-value" style={{ color }}>{value}</p>
        </div>
    );
};

export default StatPanel;