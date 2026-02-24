import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './FinanceReport.css';

const API_URL = '/api/admin';

export default function FinanceReport({ token }: { token: string }) {
  const [finance, set_finance] = useState(null);
  const [quests, set_quests] = useState([]);
  const [loading, set_loading] = useState(true);

  useEffect(() => {
    load_finance();
  }, []);

  const load_finance = async () => {
    try {
      const [finance_res, quests_res] = await Promise.all([
        axios.get(`${API_URL}/finance/report`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API_URL}/quests/top`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      set_finance(finance_res.data);
      set_quests(quests_res.data);
    } catch (error) {
      console.error('Error loading finance:', error);
    } finally {
      set_loading(false);
    }
  };

  if (loading) return <div className="loading">Loading finance...</div>;

  return (
    <div className="finance-report">
      {finance && (
        <div className="finance-overview">
          <div className="finance-card primary">
            <div className="finance-icon">💳</div>
            <div className="finance-content">
              <h3>Total Paid</h3>
              <div className="finance-value">₴{finance.total_paid}</div>
            </div>
          </div>
          <div className="finance-card warning">
            <div className="finance-icon">⏳</div>
            <div className="finance-content">
              <h3>Pending Payment</h3>
              <div className="finance-value">₴{finance.pending_payment}</div>
            </div>
          </div>
          <div className="finance-card success">
            <div className="finance-icon">📈</div>
            <div className="finance-content">
              <h3>Today's Earnings</h3>
              <div className="finance-value">₴{finance.today_earnings}</div>
            </div>
          </div>
        </div>
      )}

      {quests.length > 0 && (
        <div className="top-quests">
          <h2>🏆 Top Quests by Budget</h2>
          <div className="quests-table">
            <div className="table-header">
              <div className="col">Quest</div>
              <div className="col">Budget</div>
              <div className="col">Status</div>
              <div className="col">Date</div>
            </div>
            {quests.map((quest: any) => (
              <div key={quest.id} className="table-row">
                <div className="col">{quest.title}</div>
                <div className="col budget">₴{quest.budget}</div>
                <div className="col">
                  <span className={`status ${quest.status.toLowerCase()}`}>
                    {quest.status}
                  </span>
                </div>
                <div className="col">
                  {new Date(quest.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
