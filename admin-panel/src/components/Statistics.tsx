import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Statistics.css';

const API_URL = '/api/admin';

interface Stats {
  users: { total: number; active: number; scouts: number; clients: number };
  quests: { total: number; completed: number; completion_rate: string };
  task_orders: {
    total: number;
    approved: number;
    approval_rate: string;
  };
  finances: { total_earned: number; average_per_quest: string };
  reports: { total: number; verified: number; verification_rate: string };
}

export default function Statistics({ token }: { token: string }) {
  const [stats, set_stats] = useState<Stats | null>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    load_stats();
    const interval = setInterval(load_stats, 30000);
    return () => clearInterval(interval);
  }, []);

  const load_stats = async () => {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      set_stats(response.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      set_loading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!stats) return <div className="error">Failed to load statistics</div>;

  return (
    <div className="statistics">
      <div className="stat-section">
        <h2>👥 Users</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.users.total}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card highlight">
            <div className="stat-value">{stats.users.active}</div>
            <div className="stat-label">Active</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.users.scouts}</div>
            <div className="stat-label">Scouts</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.users.clients}</div>
            <div className="stat-label">Clients</div>
          </div>
        </div>
      </div>

      <div className="stat-section">
        <h2>🎯 Quests</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.quests.total}</div>
            <div className="stat-label">Total Quests</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.quests.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.quests.completion_rate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      <div className="stat-section">
        <h2>📝 Task Orders</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.task_orders.total}</div>
            <div className="stat-label">Total Orders</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.task_orders.approved}</div>
            <div className="stat-label">Approved</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.task_orders.approval_rate}%</div>
            <div className="stat-label">Approval Rate</div>
          </div>
        </div>
      </div>

      <div className="stat-section">
        <h2>💰 Finances</h2>
        <div className="stat-grid">
          <div className="stat-card highlight">
            <div className="stat-value">₴{stats.finances.total_earned}</div>
            <div className="stat-label">Total Paid</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">₴{stats.finances.average_per_quest}</div>
            <div className="stat-label">Average per Quest</div>
          </div>
        </div>
      </div>

      <div className="stat-section">
        <h2>📍 Reports</h2>
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{stats.reports.total}</div>
            <div className="stat-label">Total Reports</div>
          </div>
          <div className="stat-card success">
            <div className="stat-value">{stats.reports.verified}</div>
            <div className="stat-label">Verified</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{stats.reports.verification_rate}%</div>
            <div className="stat-label">Verification Rate</div>
          </div>
        </div>
      </div>
    </div>
  );
}
