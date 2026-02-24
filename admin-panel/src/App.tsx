import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Statistics from './components/Statistics';
import ErrorMonitor from './components/ErrorMonitor';
import ActivityChart from './components/ActivityChart';
import PendingTasks from './components/PendingTasks';
import FinanceReport from './components/FinanceReport';
import './App.css';

const API_URL = '/api/admin';
const ADMIN_TOKEN = localStorage.getItem('admin_token') || '';

export default function App() {
  const [authenticated, set_authenticated] = useState(!!ADMIN_TOKEN);
  const [token, set_token] = useState(ADMIN_TOKEN);
  const [active_tab, set_active_tab] = useState('dashboard');

  const handle_login = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form_data = new FormData(e.currentTarget);
    const input_token = form_data.get('token') as string;

    localStorage.setItem('admin_token', input_token);
    set_token(input_token);
    set_authenticated(true);
  };

  if (!authenticated) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🔐 GenTrust Admin Panel</h1>
          <form onSubmit={handle_login}>
            <input
              type="password"
              name="token"
              placeholder="Enter admin token"
              required
            />
            <button type="submit">Login</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>📊 GenTrust Core Dashboard</h1>
        <button
          onClick={() => {
            localStorage.removeItem('admin_token');
            set_authenticated(false);
          }}
          className="logout-btn"
        >
          Logout
        </button>
      </header>

      <div className="tabs">
        <button
          className={active_tab === 'dashboard' ? 'active' : ''}
          onClick={() => set_active_tab('dashboard')}
        >
          📈 Dashboard
        </button>
        <button
          className={active_tab === 'errors' ? 'active' : ''}
          onClick={() => set_active_tab('errors')}
        >
          🐛 Errors
        </button>
        <button
          className={active_tab === 'activity' ? 'active' : ''}
          onClick={() => set_active_tab('activity')}
        >
          📊 Activity
        </button>
        <button
          className={active_tab === 'tasks' ? 'active' : ''}
          onClick={() => set_active_tab('tasks')}
        >
          ⚠️ Pending
        </button>
        <button
          className={active_tab === 'finance' ? 'active' : ''}
          onClick={() => set_active_tab('finance')}
        >
          💰 Finance
        </button>
      </div>

      <div className="content">
        {active_tab === 'dashboard' && <Statistics token={token} />}
        {active_tab === 'errors' && <ErrorMonitor token={token} />}
        {active_tab === 'activity' && <ActivityChart token={token} />}
        {active_tab === 'tasks' && <PendingTasks token={token} />}
        {active_tab === 'finance' && <FinanceReport token={token} />}
      </div>
    </div>
  );
}
