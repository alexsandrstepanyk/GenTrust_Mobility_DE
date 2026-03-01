import React, { useEffect, useState } from 'react';
import axios from 'axios';
import QuestCard from './components/QuestCard';
import DashboardStats from './components/DashboardStats';
import './App.css';

export default function App() {
  const [quests, setQuests] = useState<any[]>([]);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const [questsRes, statsRes] = await Promise.all([
        axios.get('/api/staff/quests-pending'),
        axios.get('/api/staff/stats')
      ]);
      setQuests(questsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (questId: number) => {
    try {
      await axios.post(`/api/staff/quests/${questId}/approve`, {
        verifiedBy: 'staff-member' // TODO: Get actual staff user
      });
      loadData(); // Refresh list
    } catch (error) {
      console.error('Error approving quest:', error);
    }
  };

  const handleReject = async (questId: number, reason: string) => {
    try {
      await axios.post(`/api/staff/quests/${questId}/reject`, {
        reason,
        rejectedBy: 'staff-member'
      });
      loadData();
    } catch (error) {
      console.error('Error rejecting quest:', error);
    }
  };

  const filteredQuests = quests;

  return (
    <div className="app">
      <header className="app-header">
        <h1>📋 Staff Panel - Task Verification</h1>
        <p>Verify completed tasks from students</p>
      </header>

      <DashboardStats stats={stats} />

      <div className="content">
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''} 
            onClick={() => setFilter('all')}
          >
            All Tasks
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''} 
            onClick={() => setFilter('pending')}
          >
            Pending ({stats.pending})
          </button>
        </div>

        <div className="quests-list">
          {loading ? (
            <p className="loading">Loading quests...</p>
          ) : filteredQuests.length === 0 ? (
            <p className="empty">✅ No pending quests to verify!</p>
          ) : (
            filteredQuests.map(quest => (
              <QuestCard
                key={quest.id}
                quest={quest}
                onApprove={() => handleApprove(quest.id)}
                onReject={(reason) => handleReject(quest.id, reason)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
