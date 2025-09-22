import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchManagement = ({ matchweekId, matchweekName }) => {
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchPlayers, setMatchPlayers] = useState([]);
  const [showPlayerStats, setShowPlayerStats] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStats, setPlayerStats] = useState({});
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    matchDate: '',
    matchTime: ''
  });

  useEffect(() => {
    if (matchweekId) {
      fetchData();
    }
  }, [matchweekId]);

  const fetchData = async () => {
    try {
      const [matchesRes, teamsRes] = await Promise.all([
        axios.get(`/api/matchweeks/${matchweekId}/matches`),
        axios.get('/api/teams')
      ]);
      setMatches(matchesRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const submitData = {
        matchweekId: parseInt(matchweekId),
        homeTeamId: parseInt(formData.homeTeamId),
        awayTeamId: parseInt(formData.awayTeamId),
        matchDate: `${formData.matchDate}T${formData.matchTime}:00`
      };

      if (editingMatch) {
        // Update match logic here if needed
        alert('Güncelleme özelliği yakında eklenecek');
      } else {
        await axios.post('/api/matches', submitData, config);
        alert('Maç başarıyla oluşturuldu');
      }

      setShowForm(false);
      setEditingMatch(null);
      setFormData({ homeTeamId: '', awayTeamId: '', matchDate: '', matchTime: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving match:', error);
      alert('Maç kaydedilirken hata oluştu');
    }
  };

  const handleUpdateScore = async (matchId, homeScore, awayScore, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/matches/${matchId}/score`, {
        homeScore: parseInt(homeScore),
        awayScore: parseInt(awayScore),
        status
      }, config);

      alert('Maç skoru güncellendi');
      fetchData();
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Skor güncellenirken hata oluştu');
    }
  };

  const handleDelete = async (matchId) => {
    if (!window.confirm('Bu maçı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/matches/${matchId}`, config);
      alert('Maç başarıyla silindi');
      fetchData();
    } catch (error) {
      console.error('Error deleting match:', error);
      alert('Maç silinirken hata oluştu');
    }
  };

  const handleViewPlayerStats = async (match) => {
    try {
      setSelectedMatch(match);
      setSelectedPlayer(null);
      const [playersRes] = await Promise.all([
        axios.get(`/api/matches/${match.id}/players`)
      ]);
      console.log('Fetched players:', playersRes.data);
      setShowPlayerStats(true);
      
      // Initialize player stats and mark players with existing stats
      const initialStats = {};
      const playersWithStats = playersRes.data.map(player => {
        // Check if player has database record (any field is not null/undefined)
        const hasDatabaseRecord = player.minutes_played !== null && player.minutes_played !== undefined;
        
        initialStats[player.id] = {
          minutesPlayed: player.minutes_played || 0,
          goals: player.goals || 0,
          assists: player.assists || 0,
          yellowCards: player.yellow_cards || 0,
          redCards: player.red_cards || 0,
          ownGoals: player.own_goals || 0,
          penaltiesWon: player.penalties_won || 0,
          penaltiesMissed: player.penalties_missed || 0,
          penaltiesConceded: player.penalties_conceded || 0,
          saves: player.saves || 0,
          penaltiesSaved: player.penalties_saved || 0,
          penaltiesSavedOutfield: player.penalties_saved_outfield || 0
        };

        return {
          ...player,
          hasStats: hasDatabaseRecord
        };
      });
      
      setPlayerStats(initialStats);
      setMatchPlayers(playersWithStats);
    } catch (error) {
      console.error('Error fetching match players:', error);
      alert('Oyuncular yüklenirken hata oluştu');
    }
  };

  const handleSavePlayerStats = async (playerId, statistics) => {
    try {
      console.log('Saving player stats:', { playerId, statistics, matchId: selectedMatch.id });
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.post(`/api/matches/${selectedMatch.id}/statistics`, {
        playerId,
        statistics
      }, config);

      // Update local state
      setPlayerStats(prev => ({
        ...prev,
        [playerId]: statistics
      }));

      // Mark player as updated
      setMatchPlayers(prev => prev.map(player => 
        player.id === playerId 
          ? { ...player, hasStats: true, ...statistics }
          : player
      ));

      alert('İstatistikler başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving player stats:', error);
      alert('İstatistikler kaydedilirken hata oluştu');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMatch(null);
    setFormData({ homeTeamId: '', awayTeamId: '', matchDate: '', matchTime: '' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled': return '#6c757d';
      case 'Live': return '#28a745';
      case 'Finished': return '#007bff';
      default: return '#6c757d';
    }
  };

  if (loading) {
    return <div className="loading">Maçlar yükleniyor...</div>;
  }

  return (
    <div className="match-management">
      <div className="section-header">
        <h2>{matchweekName} - Maç Yönetimi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Yeni Maç Ekle
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Yeni Maç Ekle</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Ev Sahibi Takım *</label>
                  <select
                    name="homeTeamId"
                    value={formData.homeTeamId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Takım Seçin</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Deplasman Takımı *</label>
                  <select
                    name="awayTeamId"
                    value={formData.awayTeamId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Takım Seçin</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Maç Tarihi *</label>
                  <input
                    type="date"
                    name="matchDate"
                    value={formData.matchDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Maç Saati *</label>
                  <input
                    type="time"
                    name="matchTime"
                    value={formData.matchTime}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  Ekle
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="matches-list">
        {matches.length === 0 ? (
          <div className="empty-state">
            <p>Bu hafta için henüz maç eklenmemiş</p>
          </div>
        ) : (
          matches.map(match => (
            <div key={match.id} className="match-card">
              <div className="match-info">
                <div className="teams">
                  <div className="team home-team">
                    <span className="team-name">{match.home_team_name}</span>
                    <span className="team-score">{match.home_score !== null ? match.home_score : '-'}</span>
                  </div>
                  <div className="vs">VS</div>
                  <div className="team away-team">
                    <span className="team-score">{match.away_score !== null ? match.away_score : '-'}</span>
                    <span className="team-name">{match.away_team_name}</span>
                  </div>
                </div>
                
                <div className="match-details">
                  <p><strong>Tarih:</strong> {new Date(match.match_date).toLocaleDateString('tr-TR')}</p>
                  <p><strong>Saat:</strong> {new Date(match.match_date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</p>
                  <p><strong>Durum:</strong> 
                    <span style={{ color: getStatusColor(match.status), fontWeight: 'bold' }}>
                      {match.status === 'Scheduled' ? 'Planlandı' : 
                       match.status === 'Live' ? 'Canlı' : 'Bitti'}
                    </span>
                  </p>
                </div>
              </div>

              <div className="match-actions">
                <button 
                  className="btn btn-sm btn-success"
                  onClick={() => handleViewPlayerStats(match)}
                >
                  Oyuncu İstatistikleri
                </button>
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => {
                    const homeScore = prompt('Ev sahibi skoru:', match.home_score || '');
                    const awayScore = prompt('Deplasman skoru:', match.away_score || '');
                    if (homeScore !== null && awayScore !== null) {
                      handleUpdateScore(match.id, homeScore, awayScore, 'Finished');
                    }
                  }}
                >
                  Skor Güncelle
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(match.id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Player Statistics Modal */}
      {showPlayerStats && selectedMatch && (
        <PlayerStatsModal
          match={selectedMatch}
          players={matchPlayers}
          selectedPlayer={selectedPlayer}
          playerStats={playerStats}
          onClose={() => {
            setShowPlayerStats(false);
            setSelectedMatch(null);
            setSelectedPlayer(null);
            setMatchPlayers([]);
            setPlayerStats({});
          }}
          onSelectPlayer={setSelectedPlayer}
          onSaveStats={handleSavePlayerStats}
          onStatChange={(playerId, field, value) => {
            setPlayerStats(prev => ({
              ...prev,
              [playerId]: {
                ...prev[playerId],
                [field]: parseInt(value) || 0
              }
            }));
          }}
        />
      )}
    </div>
  );
};

// Player Statistics Modal Component
const PlayerStatsModal = ({ match, players, selectedPlayer, playerStats, onClose, onSelectPlayer, onSaveStats, onStatChange }) => {
  const getPositionIcon = (position) => {
    switch (position) {
      case 'Kaleci': return '🥅';
      case 'Defans': return '🛡️';
      case 'Orta Saha': return '⚽';
      case 'Forvet': return '🎯';
      default: return '👤';
    }
  };

  // Group players by team
  const homeTeamPlayers = players.filter(p => p.team_id === match.home_team_id);
  const awayTeamPlayers = players.filter(p => p.team_id === match.away_team_id);

  const handleSavePlayer = async (playerId) => {
    await onSaveStats(playerId, playerStats[playerId]);
  };

  return (
    <div className="modal-overlay">
      <div className="player-stats-modal-new">
        <div className="modal-header">
          <h3>
            {match.home_team_name} vs {match.away_team_name}
            <br />
            <small>Oyuncu İstatistikleri</small>
          </h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content-new">
          <div className="players-layout">
            {/* Left Side - Players List */}
            <div className="players-list">
              <h4>Ev Sahibi Takım - {match.home_team_name}</h4>
              <div className="players-grid-list">
                {homeTeamPlayers.map(player => (
                  <div
                    key={player.id}
                    className={`player-item ${selectedPlayer?.id === player.id ? 'selected' : ''} ${player.hasStats ? 'has-stats' : ''}`}
                    onClick={() => onSelectPlayer(player)}
                  >
                    <span className="position-icon">{getPositionIcon(player.position)}</span>
                    <div className="player-info">
                      <span className="player-name">{player.first_name} {player.last_name}</span>
                      <span className="player-position">{player.position}</span>
                    </div>
                    {player.hasStats && <span className="stats-indicator">✓</span>}
                  </div>
                ))}
              </div>

              <h4>Deplasman Takımı - {match.away_team_name}</h4>
              <div className="players-grid-list">
                {awayTeamPlayers.map(player => (
                  <div
                    key={player.id}
                    className={`player-item ${selectedPlayer?.id === player.id ? 'selected' : ''} ${player.hasStats ? 'has-stats' : ''}`}
                    onClick={() => onSelectPlayer(player)}
                  >
                    <span className="position-icon">{getPositionIcon(player.position)}</span>
                    <div className="player-info">
                      <span className="player-name">{player.first_name} {player.last_name}</span>
                      <span className="player-position">{player.position}</span>
                    </div>
                    {player.hasStats && <span className="stats-indicator">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side - Player Stats Form */}
            <div className="player-stats-form">
              {selectedPlayer ? (
                <PlayerStatsForm
                  player={selectedPlayer}
                  stats={playerStats[selectedPlayer.id] || {}}
                  onStatChange={onStatChange}
                  onSave={handleSavePlayer}
                />
              ) : (
                <div className="no-player-selected">
                  <p>İstatistik girmek için bir oyuncu seçin</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Player Stats Form Component
const PlayerStatsForm = ({ player, stats, onStatChange, onSave }) => {
  const isGoalkeeper = player.position === 'Kaleci';

  const getPositionIcon = (position) => {
    switch (position) {
      case 'Kaleci': return '🥅';
      case 'Defans': return '🛡️';
      case 'Orta Saha': return '⚽';
      case 'Forvet': return '🎯';
      default: return '👤';
    }
  };

  return (
    <div className="player-stats-form-content">
      <div className="player-header">
        <span className="position-icon">{getPositionIcon(player.position)}</span>
        <div className="player-info">
          <h4>{player.first_name} {player.last_name}</h4>
          <span className="position">{player.position}</span>
        </div>
      </div>

      <div className="stats-form">
        <div className="stats-grid-new">
          <div className="stat-group">
            <label>Dakika</label>
            <input
              type="number"
              min="0"
              max="120"
              value={stats.minutesPlayed || 0}
              onChange={(e) => onStatChange(player.id, 'minutesPlayed', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Gol</label>
            <input
              type="number"
              min="0"
              value={stats.goals || 0}
              onChange={(e) => onStatChange(player.id, 'goals', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Asist</label>
            <input
              type="number"
              min="0"
              value={stats.assists || 0}
              onChange={(e) => onStatChange(player.id, 'assists', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Sarı Kart</label>
            <input
              type="number"
              min="0"
              value={stats.yellowCards || 0}
              onChange={(e) => onStatChange(player.id, 'yellowCards', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Kırmızı Kart</label>
            <input
              type="number"
              min="0"
              value={stats.redCards || 0}
              onChange={(e) => onStatChange(player.id, 'redCards', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Kendi Kalesine Gol</label>
            <input
              type="number"
              min="0"
              value={stats.ownGoals || 0}
              onChange={(e) => onStatChange(player.id, 'ownGoals', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Penaltı Kazanma</label>
            <input
              type="number"
              min="0"
              value={stats.penaltiesWon || 0}
              onChange={(e) => onStatChange(player.id, 'penaltiesWon', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Penaltı Kaçırma</label>
            <input
              type="number"
              min="0"
              value={stats.penaltiesMissed || 0}
              onChange={(e) => onStatChange(player.id, 'penaltiesMissed', e.target.value)}
            />
          </div>

          <div className="stat-group">
            <label>Penaltıya Sebep Olma</label>
            <input
              type="number"
              min="0"
              value={stats.penaltiesConceded || 0}
              onChange={(e) => onStatChange(player.id, 'penaltiesConceded', e.target.value)}
            />
          </div>

          {/* Goalkeeper specific stats */}
          {isGoalkeeper && (
            <>
              <div className="stat-group">
                <label>Kurtarış</label>
                <input
                  type="number"
                  min="0"
                  value={stats.saves || 0}
                  onChange={(e) => onStatChange(player.id, 'saves', e.target.value)}
                />
              </div>

              <div className="stat-group">
                <label>Kurtarılan Penaltı (Kaleci)</label>
                <input
                  type="number"
                  min="0"
                  value={stats.penaltiesSaved || 0}
                  onChange={(e) => onStatChange(player.id, 'penaltiesSaved', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Outfield player specific stats */}
          {!isGoalkeeper && (
            <div className="stat-group">
              <label>Kurtarılan Penaltı (Saha Oyuncusu)</label>
              <input
                type="number"
                min="0"
                value={stats.penaltiesSavedOutfield || 0}
                onChange={(e) => onStatChange(player.id, 'penaltiesSavedOutfield', e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" onClick={() => onSave(player.id)}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchManagement;
