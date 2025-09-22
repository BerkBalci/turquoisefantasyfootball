import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [formData, setFormData] = useState({
    teamId: '',
    firstName: '',
    lastName: '',
    position: 'Kaleci'
  });

  const positions = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [playersRes, teamsRes] = await Promise.all([
        axios.get('/api/players'),
        axios.get('/api/teams')
      ]);
      setPlayers(playersRes.data);
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
        ...formData,
        teamId: parseInt(formData.teamId)
      };

      if (editingPlayer) {
        await axios.put(`/api/players/${editingPlayer.id}`, submitData, config);
        alert('Oyuncu başarıyla güncellendi');
      } else {
        await axios.post('/api/players', submitData, config);
        alert('Oyuncu başarıyla oluşturuldu');
      }

      setShowForm(false);
      setEditingPlayer(null);
      setFormData({
        teamId: '',
        firstName: '',
        lastName: '',
        position: 'Kaleci'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving player:', error);
      alert('Oyuncu kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (player) => {
    setEditingPlayer(player);
    setFormData({
      teamId: player.team_id,
      firstName: player.first_name,
      lastName: player.last_name,
      position: player.position
    });
    setShowForm(true);
  };

  const handleDelete = async (playerId) => {
    if (!window.confirm('Bu oyuncuyu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/players/${playerId}`, config);
      alert('Oyuncu başarıyla silindi');
      fetchData();
    } catch (error) {
      console.error('Error deleting player:', error);
      alert('Oyuncu silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPlayer(null);
    setFormData({
      teamId: '',
      firstName: '',
      lastName: '',
      position: 'Kaleci'
    });
  };

  const getPositionIcon = (position) => {
    const icons = {
      'Kaleci': '🥅',
      'Defans': '🛡️',
      'Orta Saha': '⚽',
      'Forvet': '⚡'
    };
    return icons[position] || '👤';
  };

  if (loading) {
    return <div className="loading">Veriler yükleniyor...</div>;
  }

  return (
    <div className="player-management">
      <div className="section-header">
        <h2>Oyuncu Yönetimi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Yeni Oyuncu Ekle
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingPlayer ? 'Oyuncuyu Düzenle' : 'Yeni Oyuncu Ekle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Takım *</label>
                  <select
                    name="teamId"
                    value={formData.teamId}
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
                  <label>Mevki *</label>
                  <select
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    required
                  >
                    {positions.map(pos => (
                      <option key={pos} value={pos}>
                        {getPositionIcon(pos)} {pos}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ad *</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Soyad *</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingPlayer ? 'Güncelle' : 'Ekle'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="players-grid">
        {players.length === 0 ? (
          <div className="empty-state">
            <p>Henüz oyuncu eklenmemiş</p>
          </div>
        ) : (
          players.map(player => (
            <div key={player.id} className="player-card">
              <div className="player-photo">
                <div className="default-photo">
                  {getPositionIcon(player.position)}
                </div>
              </div>
              <div className="player-info">
                <h3>{player.first_name} {player.last_name}</h3>
                <p><strong>Takım:</strong> {player.team_name}</p>
                <p><strong>Mevki:</strong> {getPositionIcon(player.position)} {player.position}</p>
              </div>
              <div className="player-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEdit(player)}
                >
                  Düzenle
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(player.id)}
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PlayerManagement;
