import React from 'react';
import './DashboardStats.css';

export default function DashboardStats({ stats }: { stats: any }) {
  return (
    <div className="dashboard-stats">
      <div className="stat-card pending">
        <div className="stat-emoji">⏳</div>
        <div className="stat-content">
          <h3>{stats.pending}</h3>
          <p>Pending Verification</p>
        </div>
      </div>

      <div className="stat-card approved">
        <div className="stat-emoji">✅</div>
        <div className="stat-content">
          <h3>{stats.approved}</h3>
          <p>Approved Today</p>
        </div>
      </div>

      <div className="stat-card rejected">
        <div className="stat-emoji">❌</div>
        <div className="stat-content">
          <h3>{stats.rejected}</h3>
          <p>Rejected</p>
        </div>
      </div>
    </div>
  );
}
