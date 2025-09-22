import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Takımlar yüklenirken hata oluştu');
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

      if (editingTeam) {
        await axios.put(`/api/teams/${editingTeam.id}`, formData, config);
        alert('Takım başarıyla güncellendi');
      } else {
        await axios.post('/api/teams', formData, config);
        alert('Takım başarıyla oluşturuldu');
      }

      setShowForm(false);
      setEditingTeam(null);
      setFormData({ name: '' });
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      alert('Takım kaydedilirken hata oluştu');
    }
  };

  const handleEdit = (team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name
    });
    setShowForm(true);
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Bu takımı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/teams/${teamId}`, config);
      alert('Takım başarıyla silindi');
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Takım silinirken hata oluştu');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingTeam(null);
    setFormData({ name: '' });
  };

  if (loading) {
    return <div className="loading">Takımlar yükleniyor...</div>;
  }

  return (
    <div className="team-management">
      <div className="section-header">
        <h2>Takım Yönetimi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Yeni Takım Ekle
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>{editingTeam ? 'Takımı Düzenle' : 'Yeni Takım Ekle'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Takım Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTeam ? 'Güncelle' : 'Ekle'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="teams-grid">
        {teams.length === 0 ? (
          <div className="empty-state">
            <p>Henüz takım eklenmemiş</p>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.id} className="team-card">
              <div className="team-logo">
                <div className="default-logo">⚽</div>
              </div>
              <div className="team-info">
                <h3>{team.name}</h3>
              </div>
              <div className="team-actions">
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => handleEdit(team)}
                >
                  Düzenle
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(team.id)}
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

export default TeamManagement;
