import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ActivityChart.css';

const API_URL = '/api/admin';

interface Activity {
  active_last_hour: number;
  new_users_today: number;
  by_role: { [key: string]: number };
}

export default function ActivityChart({ token }: { token: string }) {
  const [activity, set_activity] = useState<Activity | null>(null);
  const [timeline, set_timeline] = useState<any>(null);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    load_activity();
  }, []);

  const load_activity = async () => {
    try {
      const [activity_res, timeline_res] = await Promise.all([
        axios.get(`${API_URL}/users/activity`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/activity/timeline`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      set_activity(activity_res.data);
      set_timeline(timeline_res.data);
    } catch (error) {
      console.error('Error loading activity:', error);
    } finally {
      set_loading(false);
    }
  };

  if (loading) return <div className="loading">Loading activity...</div>;

  return (
    <div className="activity-chart">
      {activity && (
        <div className="activity-stats">
          <div className="activity-card">
            <div className="activity-emoji">🟢</div>
            <div className="activity-content">
              <h3>{activity.active_last_hour}</h3>
              <p>Users Active Last Hour</p>
            </div>
          </div>
          <div className="activity-card">
            <div className="activity-emoji">🆕</div>
            <div className="activity-content">
              <h3>{activity.new_users_today}</h3>
              <p>New Users Today</p>
            </div>
          </div>
        </div>
      )}

      {activity?.by_role && (
        <div className="roles-section">
          <h2>Users by Role</h2>
          <div className="roles-list">
            {Object.entries(activity.by_role).map(([role, count]) => (
              <div key={role} className="role-item">
                <span className="role-name">{role}</span>
                <span className="role-count">{count as number}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {timeline && (
        <div className="timeline-section">
          <h2>Quests Created (Last 30 Days)</h2>
          <div className="timeline-bars">
            {Object.entries(timeline)
              .reverse()
              .slice(0, 14)
              .map(([date, count]: [string, any]) => (
                <div key={date} className="timeline-bar-wrapper">
                  <div
                    className="timeline-bar"
                    style={{
                      height: `${Math.max((count / 10) * 100, 20)}px`,
                    }}
                  >
                    {count > 0 && <span className="bar-label">{count}</span>}
                  </div>
                  <div className="bar-date">
                    {new Date(date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
