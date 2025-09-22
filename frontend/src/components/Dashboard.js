import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import TeamBuilder from './TeamBuilder';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="app-title">FANTEZİ FUTBOL</h1>
        <div className="user-info">
          <span className="welcome-text">Hoş geldin, <span className="highlight">{user?.nickname}</span>!</span>
          <button onClick={handleLogout} className="logout-btn">
            Çıkış Yap
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Ana Sayfa
        </button>
        <button 
          className={`tab-btn ${activeTab === 'team' ? 'active' : ''}`}
          onClick={() => setActiveTab('team')}
        >
          Takım Kurma
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'home' ? (
          <>
            <div className="welcome-banner">
              <h2 className="banner-title">Harekete Geç!</h2>
              <p className="banner-text">Fantezi futbol arenasına hoş geldin, <span className="highlight">{user?.nickname}</span>!</p>
              <p className="banner-subtext">Stratejini kur, yıldızları topla ve zafere ulaş!</p>
            </div>

            <div className="feature-cards-grid">
              <div className="feature-card">
                <div className="card-icon">👥</div>
                <h3 className="card-title">Takımım</h3>
                <p className="card-description">Fantezi takımını oluştur ve yönet.</p>
                <button className="card-btn primary" onClick={() => setActiveTab('team')}>
                  Takım Kur
                </button>
              </div>

              <div className="feature-card">
                <div className="card-icon">⚽</div>
                <h3 className="card-title">Oyuncular</h3>
                <p className="card-description">Oyuncuları incele ve takımına ekle.</p>
                <button className="card-btn disabled" disabled>
                  Yakında...
                </button>
              </div>

              <div className="feature-card">
                <div className="card-icon">🏆</div>
                <h3 className="card-title">Ligler</h3>
                <p className="card-description">Liglere katıl ve diğerleriyle yarış.</p>
                <button className="card-btn disabled" disabled>
                  Yakında...
                </button>
              </div>

              <div className="feature-card">
                <div className="card-icon">📈</div>
                <h3 className="card-title">İstatistikler</h3>
                <p className="card-description">Performansını ve puanlarını gör.</p>
                <button className="card-btn disabled" disabled>
                  Yakında...
                </button>
              </div>
            </div>

            <div className="account-info-section">
              <h3 className="account-title">Hesap Bilgileri</h3>
              <div className="account-details">
                <div className="account-item">
                  <span className="account-label">Ad Soyad</span>
                  <span className="account-value">{user?.firstName} {user?.lastName}</span>
                </div>
                <div className="account-item">
                  <span className="account-label">Kullanıcı Adı</span>
                  <span className="account-value">{user?.nickname}</span>
                </div>
                <div className="account-item">
                  <span className="account-label">E-posta</span>
                  <span className="account-value">{user?.email}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <TeamBuilder />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
