import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TeamManagement from './TeamManagement';
import PlayerManagement from './PlayerManagement';
import MatchweekManagement from './MatchweekManagement';
import MatchManagement from './MatchManagement';
import ScoringSystem from './ScoringSystem';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('teams');
  const [selectedMatchweek, setSelectedMatchweek] = useState(null);

  const handleLogout = () => {
    logout();
  };

  const tabs = [
    { id: 'teams', label: 'Takım Yönetimi', icon: '⚽' },
    { id: 'players', label: 'Oyuncu Yönetimi', icon: '👤' },
    { id: 'matchweeks', label: 'Maç Haftası Yönetimi', icon: '📅' },
    { id: 'scoring', label: 'Puanlama Sistemi', icon: '📊' }
  ];

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <div className="admin-title">
          <h1>🏆 Admin Paneli</h1>
          <p>Fantezi Futbol Yönetim Sistemi</p>
        </div>
        <div className="admin-user-info">
          <span>Hoş geldin, {user?.firstName}!</span>
          <button onClick={handleLogout} className="logout-btn">
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="admin-navigation">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'teams' && <TeamManagement />}
        {activeTab === 'players' && <PlayerManagement />}
        {activeTab === 'matchweeks' && !selectedMatchweek && (
          <MatchweekManagement onSelectMatchweek={setSelectedMatchweek} />
        )}
        {activeTab === 'matchweeks' && selectedMatchweek && (
          <div>
            <div className="back-button">
              <button 
                className="btn btn-secondary"
                onClick={() => setSelectedMatchweek(null)}
              >
                ← Maç Haftalarına Dön
              </button>
            </div>
            <MatchManagement 
              matchweekId={selectedMatchweek.id} 
              matchweekName={selectedMatchweek.name}
            />
          </div>
        )}
        {activeTab === 'scoring' && <ScoringSystem />}
      </div>
    </div>
  );
};

export default AdminPanel;
