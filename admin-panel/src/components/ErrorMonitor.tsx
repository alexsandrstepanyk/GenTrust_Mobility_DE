import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ErrorMonitor.css';

const API_URL = '/api/admin';

interface ErrorLog {
  id: string;
  timestamp: string;
  level: string;
  module: string;
  message: string;
  resolved: boolean;
}

interface ErrorStats {
  errors: number;
  warnings: number;
  unresolved: number;
  resolved: number;
}

export default function ErrorMonitor({ token }: { token: string }) {
  const [errors, set_errors] = useState<ErrorLog[]>([]);
  const [stats, set_stats] = useState<ErrorStats | null>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    load_errors();
    const interval = setInterval(load_errors, 60000);
    return () => clearInterval(interval);
  }, []);

  const load_errors = async () => {
    try {
      const [errors_res, stats_res] = await Promise.all([
        axios.get(`${API_URL}/errors?limit=100`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/errors/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      set_errors(errors_res.data.errors);
      set_stats(stats_res.data);
    } catch (error) {
      console.error('Error loading errors:', error);
    } finally {
      set_loading(false);
    }
  };

  const handle_resolve = async (error_id: string) => {
    try {
      await axios.post(
        `${API_URL}/errors/${error_id}/resolve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      load_errors();
    } catch (error) {
      console.error('Error resolving:', error);
    }
  };

  if (loading) return <div className="loading">Loading errors...</div>;

  return (
    <div className="error-monitor">
      {stats && (
        <div className="error-stats">
          <div className="error-stat">
            <div className="stat-number">{stats.errors}</div>
            <div className="stat-label">🔴 Total Errors</div>
          </div>
          <div className="error-stat">
            <div className="stat-number">{stats.warnings}</div>
            <div className="stat-label">🟡 Warnings</div>
          </div>
          <div className="error-stat">
            <div className="stat-number">{stats.unresolved}</div>
            <div className="stat-label">⚠️ Unresolved</div>
          </div>
          <div className="error-stat">
            <div className="stat-number">{stats.resolved}</div>
            <div className="stat-label">✅ Resolved</div>
          </div>
        </div>
      )}

      <div className="errors-list">
        {errors.length === 0 ? (
          <div className="empty-state">✅ No errors found!</div>
        ) : (
          errors.map((error) => (
            <div
              key={error.id}
              className={`error-item ${error.level.toLowerCase()} ${
                error.resolved ? 'resolved' : ''
              }`}
            >
              <div className="error-header">
                <span className="error-module">{error.module}</span>
                <span className="error-time">
                  {new Date(error.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="error-message">{error.message}</div>
              {!error.resolved && (
                <button
                  className="resolve-btn"
                  onClick={() => handle_resolve(error.id)}
                >
                  Mark as Resolved
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
