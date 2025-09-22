import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchweekManagement = ({ onSelectMatchweek }) => {
  const [matchweeks, setMatchweeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMatchweek, setEditingMatchweek] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchMatchweeks();
  }, []);

  const fetchMatchweeks = async () => {
    try {
      const response = await axios.get('/api/matchweeks');
      setMatchweeks(response.data);
    } catch (error) {
      console.error('Error fetching matchweeks:', error);
      alert('Maç haftaları yüklenirken hata oluştu');
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

      if (editingMatchweek) {
        // Update matchweek logic here if needed
        alert('Güncelleme özelliği yakında eklenecek');
      } else {
        await axios.post('/api/matchweeks', formData, config);
        alert('Maç haftası başarıyla oluşturuldu');
      }

      setShowForm(false);
      setEditingMatchweek(null);
      setFormData({ name: '', startDate: '', endDate: '' });
      fetchMatchweeks();
    } catch (error) {
      console.error('Error saving matchweek:', error);
      alert('Maç haftası kaydedilirken hata oluştu');
    }
  };

  const handleActivate = async (matchweekId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(`/api/matchweeks/${matchweekId}/activate`, {}, config);
      alert('Maç haftası aktif olarak ayarlandı');
      fetchMatchweeks();
    } catch (error) {
      console.error('Error activating matchweek:', error);
      alert('Maç haftası aktifleştirilirken hata oluştu');
    }
  };

  const handleDelete = async (matchweekId) => {
    if (!window.confirm('Bu maç haftasını silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.delete(`/api/matchweeks/${matchweekId}`, config);
      alert('Maç haftası başarıyla silindi');
      fetchMatchweeks();
    } catch (error) {
      console.error('Error deleting matchweek:', error);
      alert('Maç haftası silinirken hata oluştu');
    }
  };

  const handleCalculateScores = async (matchweekId, matchweekName) => {
    if (!window.confirm(`${matchweekName} için puanları hesaplamak ve haftayı kapatmak istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const response = await axios.post(`/api/matchweeks/${matchweekId}/calculate-scores`, {}, config);
      
      alert(response.data.message);
      fetchMatchweeks(); // Refresh the list to update active status
    } catch (error) {
      console.error('Error calculating scores:', error);
      alert('Puan hesaplanırken hata oluştu');
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingMatchweek(null);
    setFormData({ name: '', startDate: '', endDate: '' });
  };

  if (loading) {
    return <div className="loading">Maç haftaları yükleniyor...</div>;
  }

  return (
    <div className="matchweek-management">
      <div className="section-header">
        <h2>Maç Haftası Yönetimi</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowForm(true)}
        >
          + Yeni Maç Haftası Ekle
        </button>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-content">
            <h3>Yeni Maç Haftası Ekle</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Hafta Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Örn: 1. Hafta, Play-off 1"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Başlangıç Tarihi</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Bitiş Tarihi</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
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

      <div className="matchweeks-grid">
        {matchweeks.length === 0 ? (
          <div className="empty-state">
            <p>Henüz maç haftası eklenmemiş</p>
          </div>
        ) : (
          matchweeks.map(matchweek => (
            <div key={matchweek.id} className={`matchweek-card ${matchweek.is_active ? 'active' : ''}`}>
              <div className="matchweek-header">
                <h3>{matchweek.name}</h3>
                {matchweek.is_active && (
                  <span className="active-badge">Aktif Hafta</span>
                )}
              </div>
              
              <div className="matchweek-info">
                {matchweek.start_date && (
                  <p><strong>Başlangıç:</strong> {new Date(matchweek.start_date).toLocaleDateString('tr-TR')}</p>
                )}
                {matchweek.end_date && (
                  <p><strong>Bitiş:</strong> {new Date(matchweek.end_date).toLocaleDateString('tr-TR')}</p>
                )}
                <p><strong>Oluşturulma:</strong> {new Date(matchweek.created_at).toLocaleDateString('tr-TR')}</p>
              </div>

              <div className="matchweek-actions">
                {!matchweek.is_active && (
                  <button 
                    className="btn btn-sm btn-success"
                    onClick={() => handleActivate(matchweek.id)}
                  >
                    Aktif Yap
                  </button>
                )}
                {matchweek.is_active && (
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleCalculateScores(matchweek.id, matchweek.name)}
                  >
                    Puanları Hesapla
                  </button>
                )}
                <button 
                  className="btn btn-sm btn-primary"
                  onClick={() => onSelectMatchweek(matchweek)}
                >
                  Maçları Gör
                </button>
                <button 
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(matchweek.id)}
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

export default MatchweekManagement;
