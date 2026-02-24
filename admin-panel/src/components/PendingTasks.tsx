import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PendingTasks.css';

const API_URL = '/api/admin';

export default function PendingTasks({ token }: { token: string }) {
  const [orders, set_orders] = useState([]);
  const [reports, set_reports] = useState([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    load_pending();
    const interval = setInterval(load_pending, 60000);
    return () => clearInterval(interval);
  }, []);

  const load_pending = async () => {
    try {
      const [orders_res, reports_res] = await Promise.all([
        axios.get(`${API_URL}/task-orders/pending`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/reports/problematic`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      set_orders(orders_res.data);
      set_reports(reports_res.data);
    } catch (error) {
      console.error('Error loading pending tasks:', error);
    } finally {
      set_loading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="pending-tasks">
      <div className="pending-section">
        <h2>📋 Pending Task Orders</h2>
        {orders.length === 0 ? (
          <div className="empty">✅ All orders are moderated!</div>
        ) : (
          <div className="tasks-list">
            {orders.map((order: any) => (
              <div key={order.id} className="task-card">
                <div className="task-header">
                  <h3>{order.title}</h3>
                  <span className="task-status">{order.status}</span>
                </div>
                <p className="task-desc">{order.description}</p>
                <div className="task-info">
                  <span>💰 ₴{order.budget}</span>
                  <span>📍 {order.location}</span>
                  <span>👤 {order.requester?.firstName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="pending-section">
        <h2>📸 Problematic Reports</h2>
        {reports.length === 0 ? (
          <div className="empty">✅ No problematic reports!</div>
        ) : (
          <div className="tasks-list">
            {reports.map((report: any) => (
              <div key={report.id} className="task-card warning">
                <div className="task-header">
                  <span className="task-status">{report.status}</span>
                  <span className="task-time">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="task-desc">{report.description}</p>
                <div className="task-info">
                  <span>📍 {report.latitude}, {report.longitude}</span>
                  <span>👤 {report.author?.firstName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
