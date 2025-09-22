import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ScoringSystem = () => {
  const [scoringRules, setScoringRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRule, setEditingRule] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [teamPlayerLimit, setTeamPlayerLimit] = useState(3);
  const [editingTeamLimit, setEditingTeamLimit] = useState(false);
  const [teamLimitValue, setTeamLimitValue] = useState('3');

  useEffect(() => {
    fetchScoringRules();
    fetchTeamPlayerLimit();
  }, []);

  const fetchScoringRules = async () => {
    try {
      const response = await axios.get('/api/scoring-system');
      setScoringRules(response.data);
    } catch (error) {
      console.error('Error fetching scoring rules:', error);
      alert('Puanlama kuralları yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPlayerLimit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const response = await axios.get('/api/scoring-system/team-limit', config);
      setTeamPlayerLimit(response.data.team_player_limit);
      setTeamLimitValue(response.data.team_player_limit.toString());
    } catch (error) {
      console.error('Error fetching team player limit:', error);
      // Set default value if API fails
      setTeamPlayerLimit(3);
      setTeamLimitValue('3');
    }
  };

  const handleEdit = (rule) => {
    setEditingRule(rule.id);
    setEditValue(rule.points_per_stat.toString());
  };

  const handleSave = async (ruleId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const pointsPerStat = parseFloat(editValue);
      if (isNaN(pointsPerStat)) {
        alert('Geçerli bir sayı girin');
        return;
      }

      await axios.put(`/api/scoring-system/${ruleId}`, {
        pointsPerStat: pointsPerStat
      }, config);

      // Update local state
      setScoringRules(prev => prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, points_per_stat: pointsPerStat }
          : rule
      ));

      setEditingRule(null);
      setEditValue('');
      alert('Puanlama kuralı güncellendi');
    } catch (error) {
      console.error('Error updating scoring rule:', error);
      alert('Puanlama kuralı güncellenirken hata oluştu');
    }
  };

  const handleCancel = () => {
    setEditingRule(null);
    setEditValue('');
  };

  const handleReset = async () => {
    if (!window.confirm('Puanlama sistemini varsayılan değerlere sıfırlamak istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post('/api/scoring-system/reset', {}, config);
      await fetchScoringRules();
      alert('Puanlama sistemi varsayılan değerlere sıfırlandı');
    } catch (error) {
      console.error('Error resetting scoring system:', error);
      alert('Puanlama sistemi sıfırlanırken hata oluştu');
    }
  };

  const handleEditTeamLimit = () => {
    setEditingTeamLimit(true);
    setTeamLimitValue(teamPlayerLimit.toString());
  };

  const handleSaveTeamLimit = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const limit = parseInt(teamLimitValue);
      if (isNaN(limit) || limit < 1 || limit > 11) {
        alert('Takım oyuncu limiti 1-11 arasında olmalıdır');
        return;
      }

      await axios.put('/api/scoring-system/team-limit', {
        team_player_limit: limit
      }, config);

      setTeamPlayerLimit(limit);
      setEditingTeamLimit(false);
      alert('Takım oyuncu limiti başarıyla güncellendi');
    } catch (error) {
      console.error('Error updating team player limit:', error);
      alert('Takım oyuncu limiti güncellenirken hata oluştu');
    }
  };

  const handleCancelTeamLimit = () => {
    setEditingTeamLimit(false);
    setTeamLimitValue(teamPlayerLimit.toString());
  };

  const getStatIcon = (statName) => {
    const icons = {
      'minutes_played': '⏱️',
      'goals': '⚽',
      'assists': '🎯',
      'yellow_cards': '🟨',
      'red_cards': '🟥',
      'own_goals': '😞',
      'penalties_won': '✅',
      'penalties_missed': '❌',
      'penalties_conceded': '⚠️',
      'saves': '🛡️',
      'penalties_saved': '🥅',
      'penalties_saved_outfield': '⚽'
    };
    return icons[statName] || '📊';
  };

  const getStatDescription = (rule) => {
    if (rule.is_goalkeeper_only) {
      return 'Sadece kaleci oyuncuları için';
    } else if (rule.is_outfield_only) {
      return 'Sadece saha oyuncuları için';
    } else {
      return 'Tüm oyuncular için';
    }
  };

  if (loading) {
    return <div className="loading">Puanlama kuralları yükleniyor...</div>;
  }

  return (
    <div className="scoring-system">
      <div className="section-header">
        <h2>Puanlama Sistemi</h2>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={handleReset}>
            Varsayılan Değerlere Sıfırla
          </button>
        </div>
      </div>

      {/* Team Player Limit Section */}
      <div className="team-limit-section">
        <div className="team-limit-card">
          <div className="team-limit-header">
            <h3>👥 Takım Oyuncu Limiti</h3>
            <p>Bir takımdan en fazla kaç oyuncu seçilebileceğini belirleyin</p>
          </div>
          
          <div className="team-limit-content">
            {editingTeamLimit ? (
              <div className="edit-form">
                <div className="input-group">
                  <label>Maksimum Oyuncu Sayısı:</label>
                  <input
                    type="number"
                    min="1"
                    max="11"
                    value={teamLimitValue}
                    onChange={(e) => setTeamLimitValue(e.target.value)}
                    placeholder="1-11 arası sayı girin"
                  />
                </div>
                <div className="edit-actions">
                  <button 
                    className="btn btn-sm btn-primary"
                    onClick={handleSaveTeamLimit}
                  >
                    Kaydet
                  </button>
                  <button 
                    className="btn btn-sm btn-secondary"
                    onClick={handleCancelTeamLimit}
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div className="team-limit-display">
                <div className="limit-display">
                  <span className="limit-value">{teamPlayerLimit}</span>
                  <span className="limit-label">oyuncu</span>
                </div>
                <button 
                  className="btn btn-sm btn-outline"
                  onClick={handleEditTeamLimit}
                >
                  Düzenle
                </button>
              </div>
            )}
          </div>
          
          <div className="team-limit-info">
            <small>
              Bu limit, kullanıcıların takım kurarken aynı takımdan seçebileceği maksimum oyuncu sayısını belirler.
            </small>
          </div>
        </div>
      </div>

      <div className="scoring-rules-grid">
        {scoringRules.map(rule => (
          <div key={rule.id} className="scoring-rule-card">
            <div className="rule-header">
              <span className="stat-icon">{getStatIcon(rule.stat_name)}</span>
              <div className="rule-info">
                <h3>{rule.stat_display_name}</h3>
                <p className="rule-description">{getStatDescription(rule)}</p>
              </div>
            </div>

            <div className="rule-content">
              {editingRule === rule.id ? (
                <div className="edit-form">
                  <div className="input-group">
                    <label>Puan Değeri:</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Puan değeri girin"
                    />
                  </div>
                  <div className="edit-actions">
                    <button 
                      className="btn btn-sm btn-primary"
                      onClick={() => handleSave(rule.id)}
                    >
                      Kaydet
                    </button>
                    <button 
                      className="btn btn-sm btn-secondary"
                      onClick={handleCancel}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rule-display">
                  <div className="points-display">
                    <span className="points-value">
                      {rule.points_per_stat > 0 ? '+' : ''}{rule.points_per_stat}
                    </span>
                    <span className="points-label">puan</span>
                  </div>
                  <button 
                    className="btn btn-sm btn-outline"
                    onClick={() => handleEdit(rule)}
                  >
                    Düzenle
                  </button>
                </div>
              )}
            </div>

            <div className="rule-example">
              <small>
                Örnek: 3 {rule.stat_display_name.toLowerCase()} = {rule.points_per_stat * 3 > 0 ? '+' : ''}{(rule.points_per_stat * 3).toFixed(2)} puan
              </small>
            </div>
          </div>
        ))}
      </div>

      <div className="scoring-info">
        <h3>Puanlama Sistemi Hakkında</h3>
        <div className="info-cards">
          <div className="info-card">
            <h4>Pozitif Puanlar</h4>
            <p>Gol, asist, kurtarış gibi olumlu performanslar için pozitif puanlar verilir.</p>
          </div>
          <div className="info-card">
            <h4>Negatif Puanlar</h4>
            <p>Kart, kendi kalesine gol gibi olumsuz durumlar için negatif puanlar verilir.</p>
          </div>
          <div className="info-card">
            <h4>Pozisyon Bazlı</h4>
            <p>Bazı istatistikler sadece belirli pozisyonlardaki oyuncular için geçerlidir.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoringSystem;


