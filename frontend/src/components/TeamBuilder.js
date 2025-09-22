import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Alert from './Alert';

const TeamBuilder = () => {
  const [activeMatchweek, setActiveMatchweek] = useState(null);
  const [allMatchweeks, setAllMatchweeks] = useState([]);
  const [selectedMatchweek, setSelectedMatchweek] = useState(null);
  const [userTeam, setUserTeam] = useState(null);
  const [formation, setFormation] = useState('4-4-2');
  const [teamName, setTeamName] = useState('');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [loading, setLoading] = useState(true);
  const [isViewMode, setIsViewMode] = useState(false);
  const [weeklyScores, setWeeklyScores] = useState(null);
  const [playerScores, setPlayerScores] = useState([]);
  const [alert, setAlert] = useState({ isOpen: false, type: 'warning', title: '', message: '', secondaryMessage: '' });
  const [teamPlayerLimit, setTeamPlayerLimit] = useState(3);

  const formations = {
    '4-4-2': { defenders: 4, midfielders: 4, forwards: 2 },
    '4-5-1': { defenders: 4, midfielders: 5, forwards: 1 },
    '4-3-3': { defenders: 4, midfielders: 3, forwards: 3 },
    '5-3-2': { defenders: 5, midfielders: 3, forwards: 2 },
    '5-4-1': { defenders: 5, midfielders: 4, forwards: 1 },
    '3-4-3': { defenders: 3, midfielders: 4, forwards: 3 },
    '3-5-2': { defenders: 3, midfielders: 5, forwards: 2 }
  };

  const positionMap = {
    '4-4-2': ['GK', 'DEF1', 'DEF2', 'DEF3', 'DEF4', 'MID1', 'MID2', 'MID3', 'MID4', 'FWD1', 'FWD2'],
    '4-5-1': ['GK', 'DEF1', 'DEF2', 'DEF3', 'DEF4', 'MID1', 'MID2', 'MID3', 'MID4', 'MID5', 'FWD1'],
    '4-3-3': ['GK', 'DEF1', 'DEF2', 'DEF3', 'DEF4', 'MID1', 'MID2', 'MID3', 'FWD1', 'FWD2', 'FWD3'],
    '5-3-2': ['GK', 'DEF1', 'DEF2', 'DEF3', 'DEF4', 'DEF5', 'MID1', 'MID2', 'MID3', 'FWD1', 'FWD2'],
    '5-4-1': ['GK', 'DEF1', 'DEF2', 'DEF3', 'DEF4', 'DEF5', 'MID1', 'MID2', 'MID3', 'MID4', 'FWD1'],
    '3-4-3': ['GK', 'DEF1', 'DEF2', 'DEF3', 'MID1', 'MID2', 'MID3', 'MID4', 'FWD1', 'FWD2', 'FWD3'],
    '3-5-2': ['GK', 'DEF1', 'DEF2', 'DEF3', 'MID1', 'MID2', 'MID3', 'MID4', 'MID5', 'FWD1', 'FWD2']
  };

  useEffect(() => {
    fetchActiveMatchweek();
    fetchAllMatchweeks();
    fetchTeams();
    fetchTeamPlayerLimit();
  }, []);

  useEffect(() => {
    if (selectedMatchweek) {
      fetchUserTeam();
      // Update view mode based on whether selected matchweek is active
      setIsViewMode(selectedMatchweek.id !== activeMatchweek?.id);
    } else {
      setUserTeam(null);
      setFormation('4-4-2');
      setTeamName('');
      setWeeklyScores(null);
      setPlayerScores([]);
    }
  }, [selectedMatchweek, activeMatchweek]);

  // Refresh team player limit periodically or when component becomes visible
  useEffect(() => {
    const interval = setInterval(() => {
      fetchTeamPlayerLimit();
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchActiveMatchweek = async () => {
    try {
      const response = await axios.get('/api/matchweeks/active');
      setActiveMatchweek(response.data);
      if (response.data) {
        setSelectedMatchweek(response.data);
        // View mode will be set automatically by useEffect
      }
    } catch (error) {
      console.error('Error fetching active matchweek:', error);
    }
  };

  const fetchAllMatchweeks = async () => {
    try {
      const response = await axios.get('/api/matchweeks');
      setAllMatchweeks(response.data);
      
      // If no selected matchweek, select the first one
      if (response.data.length > 0 && !selectedMatchweek) {
        setSelectedMatchweek(response.data[0]);
        // View mode will be set automatically by useEffect
      }
    } catch (error) {
      console.error('Error fetching all matchweeks:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await axios.get('/api/teams');
      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamPlayerLimit = async () => {
    try {
      const response = await axios.get('/api/scoring-system/team-limit');
      setTeamPlayerLimit(response.data.team_player_limit);
    } catch (error) {
      console.error('Error fetching team player limit:', error);
      // Set default value if API fails
      setTeamPlayerLimit(3);
    }
  };

  const fetchUserTeam = async () => {
    if (!selectedMatchweek) {
      setUserTeam(null);
      setFormation('4-4-2');
      setTeamName('');
      setWeeklyScores(null);
      setPlayerScores([]);
      return;
    }
    
    try {
      const response = await axios.get(`/api/user-teams/${selectedMatchweek.id}`);
      if (response.data) {
        setUserTeam(response.data);
        setFormation(response.data.formation);
        setTeamName(response.data.team_name || '');
        
        // Fetch weekly scores if team exists and matchweek is not active
        if (response.data.id && !selectedMatchweek.is_active) {
          fetchWeeklyScores(response.data.id);
        } else {
          setWeeklyScores(null);
          setPlayerScores([]);
        }
      } else {
        setUserTeam(null);
        setFormation('4-4-2');
        setTeamName('');
        setWeeklyScores(null);
        setPlayerScores([]);
      }
    } catch (error) {
      console.error('Error fetching user team:', error);
      setUserTeam(null);
      setFormation('4-4-2');
      setTeamName('');
      setWeeklyScores(null);
      setPlayerScores([]);
    }
  };

  const fetchWeeklyScores = async (teamId) => {
    if (!selectedMatchweek) {
      setWeeklyScores(null);
      setPlayerScores([]);
      return;
    }

    try {
      const response = await axios.get(`/api/user-teams/${teamId}/weekly-scores/${selectedMatchweek.id}`);
      setWeeklyScores(response.data.teamScore);
      setPlayerScores(response.data.playerScores);
    } catch (error) {
      console.error('Error fetching weekly scores:', error);
      setWeeklyScores(null);
      setPlayerScores([]);
    }
  };

  const fetchPlayers = async () => {
    if (!selectedMatchweek) return;
    
    try {
      let url = '/api/players';
      const params = new URLSearchParams();
      
      if (searchTerm && searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }
      if (selectedTeam) {
        params.append('team', selectedTeam);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url);
      
      // Filter players based on position and already selected players
      let filteredPlayers = response.data;
      
      // Filter by position
      if (selectedPosition) {
        const positionType = selectedPosition.startsWith('GK') ? 'Kaleci' :
                            selectedPosition.startsWith('DEF') ? 'Defans' :
                            selectedPosition.startsWith('MID') ? 'Orta Saha' : 'Forvet';
        filteredPlayers = filteredPlayers.filter(player => player.position === positionType);
      }
      
      // Filter out already selected players
      const selectedPlayerIds = Object.values(userTeam?.players || {}).map(p => p.id);
      filteredPlayers = filteredPlayers.filter(player => !selectedPlayerIds.includes(player.id));
      
      setPlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (showPlayerModal && selectedMatchweek) {
      const timeoutId = setTimeout(() => {
        fetchPlayers();
      }, searchTerm ? 300 : 0); // Debounce only when searching
      return () => clearTimeout(timeoutId);
    }
  }, [showPlayerModal, searchTerm, selectedTeam, selectedPosition, userTeam, selectedMatchweek]);

  const handleMatchweekChange = (matchweekId) => {
    const matchweek = allMatchweeks.find(mw => mw.id === parseInt(matchweekId));
    if (matchweek) {
      setSelectedMatchweek(matchweek);
      // View mode will be set automatically by useEffect
    }
  };

  const handleFormationChange = (newFormation) => {
    if (isViewMode) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Uyarı',
        message: 'Sadece aktif haftada değişiklik yapabilirsiniz!',
        secondaryMessage: 'Geçmiş haftaları sadece görüntüleyebilirsiniz.'
      });
      return;
    }

    if (!selectedMatchweek) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Hafta Seçimi Gerekli',
        message: 'Lütfen bir hafta seçin!',
        secondaryMessage: 'Takım kurmak için önce bir maç haftası seçmelisiniz.'
      });
      return;
    }
    
    setFormation(newFormation);
    if (userTeam) {
      // Clear players that don't fit in new formation
      const newPositions = positionMap[newFormation];
      const updatedPlayers = { ...userTeam.players };
      
      Object.keys(updatedPlayers).forEach(position => {
        if (!newPositions.includes(position)) {
          delete updatedPlayers[position];
        }
      });
      
      setUserTeam(prev => ({
        ...prev,
        formation: newFormation,
        players: updatedPlayers
      }));
    }
  };

  const handlePositionClick = (position) => {
    if (isViewMode) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Uyarı',
        message: 'Sadece aktif haftada değişiklik yapabilirsiniz!',
        secondaryMessage: 'Geçmiş haftaları sadece görüntüleyebilirsiniz.'
      });
      return;
    }

    if (!selectedMatchweek) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Hafta Seçimi Gerekli',
        message: 'Lütfen bir hafta seçin!',
        secondaryMessage: 'Takım kurmak için önce bir maç haftası seçmelisiniz.'
      });
      return;
    }

    setSelectedPosition(position);
    setShowPlayerModal(true);
  };

  const handlePlayerSelect = async (player) => {
    if (isViewMode) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Uyarı',
        message: 'Sadece aktif haftada değişiklik yapabilirsiniz!',
        secondaryMessage: 'Geçmiş haftaları sadece görüntüleyebilirsiniz.'
      });
      return;
    }

    if (!selectedMatchweek) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Hafta Seçimi Gerekli',
        message: 'Lütfen bir hafta seçin!',
        secondaryMessage: 'Takım kurmak için önce bir maç haftası seçmelisiniz.'
      });
      return;
    }

    try {
      // Check if player is already selected in another position
      const isPlayerAlreadySelected = Object.values(userTeam?.players || {}).some(
        selectedPlayer => selectedPlayer.id === player.id
      );
      
      if (isPlayerAlreadySelected) {
        setAlert({
          isOpen: true,
          type: 'warning',
          title: 'Oyuncu Zaten Seçili',
          message: 'Bu oyuncu zaten takımınızda seçili!',
          secondaryMessage: 'Aynı oyuncuyu birden fazla pozisyonda kullanamazsınız.'
        });
        return;
      }

      // Check team player limit
      const playersFromSameTeam = Object.values(userTeam?.players || {}).filter(
        selectedPlayer => selectedPlayer.team_id === player.team_id
      );
      
      if (playersFromSameTeam.length >= teamPlayerLimit) {
        setAlert({
          isOpen: true,
          type: 'warning',
          title: 'Takım Limiti Aşıldı',
          message: `Bu takımdan en fazla ${teamPlayerLimit} oyuncu seçebilirsiniz!`,
          secondaryMessage: `Şu anda ${playersFromSameTeam.length} oyuncu seçili.`
        });
        return;
      }

      // Check position compatibility
      const positionType = selectedPosition.startsWith('GK') ? 'Kaleci' :
                          selectedPosition.startsWith('DEF') ? 'Defans' :
                          selectedPosition.startsWith('MID') ? 'Orta Saha' : 'Forvet';
      
      if (player.position !== positionType) {
        setAlert({
          isOpen: true,
          type: 'error',
          title: 'Pozisyon Uyumsuzluğu',
          message: `${positionType} pozisyonu için ${player.position} oyuncusu seçilemez!`,
          secondaryMessage: 'Lütfen doğru pozisyon için uygun oyuncu seçin.'
        });
        return;
      }

      if (userTeam && userTeam.id) {
        // Update existing team
        await axios.put(`/api/user-teams/${userTeam.id}/players`, {
          position: selectedPosition,
          playerId: player.id
        });

      // Update local state
      setUserTeam(prev => ({
        ...prev,
        players: {
          ...prev?.players,
          [selectedPosition]: player
        }
      }));
      } else {
        // Create new team
        const response = await axios.post('/api/user-teams', {
          matchweekId: selectedMatchweek.id,
          formation: formation,
          teamName: teamName || 'Takımım',
          position: selectedPosition,
          playerId: player.id
        });
        
        // Update local state with the new team data
        setUserTeam({
          ...response.data,
          players: {
            ...response.data.players,
            [selectedPosition]: player
          }
        });
      }

      setShowPlayerModal(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Error selecting player:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Hata',
        message: 'Oyuncu seçilirken hata oluştu',
        secondaryMessage: 'Lütfen tekrar deneyin veya sayfayı yenileyin.'
      });
    }
  };

  const handleSaveTeam = async () => {
    if (isViewMode) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Uyarı',
        message: 'Sadece aktif haftada değişiklik yapabilirsiniz!',
        secondaryMessage: 'Geçmiş haftaları sadece görüntüleyebilirsiniz.'
      });
      return;
    }

    if (!selectedMatchweek) {
      setAlert({
        isOpen: true,
        type: 'warning',
        title: 'Hafta Seçimi Gerekli',
        message: 'Lütfen bir hafta seçin!',
        secondaryMessage: 'Takım kurmak için önce bir maç haftası seçmelisiniz.'
      });
      return;
    }

    try {
      if (userTeam && userTeam.id) {
        await axios.put(`/api/user-teams/${userTeam.id}`, {
          teamName: teamName,
          formation: formation
        });
      } else {
        const response = await axios.post('/api/user-teams', {
          matchweekId: selectedMatchweek.id,
          formation: formation,
          teamName: teamName || 'Takımım'
        });
        setUserTeam({ id: response.data.teamId, formation, team_name: teamName || 'Takımım', players: {} });
      }

      setAlert({
        isOpen: true,
        type: 'success',
        title: 'Başarılı',
        message: 'Takım başarıyla kaydedildi',
        secondaryMessage: 'Takımınız güncellenmiştir.'
      });
    } catch (error) {
      console.error('Error saving team:', error);
      setAlert({
        isOpen: true,
        type: 'error',
        title: 'Hata',
        message: 'Takım kaydedilirken hata oluştu',
        secondaryMessage: 'Lütfen tekrar deneyin veya sayfayı yenileyin.'
      });
    }
  };

  const getPositionIcon = (position) => {
    if (position.startsWith('GK')) return '🥅';
    if (position.startsWith('DEF')) return '🛡️';
    if (position.startsWith('MID')) return '⚽';
    if (position.startsWith('FWD')) return '🎯';
    return '👤';
  };

  const getPositionName = (position) => {
    if (position.startsWith('GK')) return 'Kaleci';
    if (position.startsWith('DEF')) return 'Defans';
    if (position.startsWith('MID')) return 'Orta Saha';
    if (position.startsWith('FWD')) return 'Forvet';
    return position;
  };

  const getPlayerScore = (playerId) => {
    const playerScore = playerScores.find(ps => ps.id === playerId);
    const score = playerScore ? parseFloat(playerScore.total_points) : 0;
    return isNaN(score) ? 0 : score;
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  if (!activeMatchweek && allMatchweeks.length === 0) {
    return (
      <div className="no-active-matchweek">
        <h3>Maç Haftası Bulunamadı</h3>
        <p>Henüz hiç maç haftası oluşturulmamış. Lütfen admin panelinden bir maç haftası oluşturun.</p>
      </div>
    );
  }

  if (!activeMatchweek && allMatchweeks.length > 0 && !selectedMatchweek) {
    return (
      <div className="no-active-matchweek">
        <h3>Aktif Maç Haftası Yok</h3>
        <p>Şu anda aktif bir maç haftası bulunmuyor. Ancak geçmiş haftaları görüntüleyebilirsiniz.</p>
        
        <div className="matchweek-selector">
          <label>Hafta Seçin:</label>
          <select 
            value={selectedMatchweek?.id || ''} 
            onChange={(e) => handleMatchweekChange(e.target.value)}
            disabled={loading}
          >
            <option value="">Hafta Seçin</option>
            {allMatchweeks.map(week => (
              <option key={week.id} value={week.id}>
                {week.name} {week.is_active ? '(Aktif)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="team-builder">
      <div className="team-builder-header">
        <h2>Takım Kurma</h2>
        <p className="team-builder-subtitle">
          {activeMatchweek 
            ? `Aktif hafta: ${activeMatchweek.name}` 
            : "Aktif maç haftası yok. Geçmiş haftaları görüntüleyebilirsiniz."
          }
        </p>
        
      {/* Hafta Seçimi */}
      <div className="matchweek-selector">
        <h3>Hafta Seçimi</h3>
        <select 
          value={selectedMatchweek?.id || ''} 
          onChange={(e) => handleMatchweekChange(e.target.value)}
          disabled={loading}
        >
          <option value="">Hafta Seçin</option>
          {allMatchweeks.map(week => (
            <option key={week.id} value={week.id}>
              {week.name} {week.is_active ? '(Aktif)' : ''}
            </option>
          ))}
        </select>
        
        {!activeMatchweek && selectedMatchweek && (
          <div className="no-active-week-warning">
            Şu anda aktif hafta yok — sadece görüntüleme modu
          </div>
        )}
      </div>

      {/* Takım Adı Input */}
      {!isViewMode && (
        <div className="team-name-input">
          <input
            type="text"
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Takım adı girin"
            disabled={!activeMatchweek}
          />
        </div>
      )}

      {/* Görüntüleme Modu Uyarısı */}
      {isViewMode && (
        <div className="view-mode-warning">
          Sadece Görüntüleme Modu
        </div>
      )}
      </div>

      <div className="formation-selector">
        <div><h3>Taktik Seçimi :</h3></div>
        <div className="formation-options">
          {Object.keys(formations).map(form => (
            <button
              key={form}
              className={`formation-btn ${formation === form ? 'active' : ''} ${isViewMode ? 'disabled' : ''}`}
              onClick={() => handleFormationChange(form)}
              disabled={isViewMode}
            >
              {form}
            </button>
          ))}
        </div>
      </div>

      <div className="field-container">
        <div className="football-field">
          <div className="field-positions">
            {/* Kaleci */}
            <div className="field-position-group goalkeeper">
              {positionMap[formation].filter(pos => pos.startsWith('GK')).map((position, index) => (
                <div
                  key={position}
                  className={`field-position ${position} ${userTeam?.players?.[position] ? 'filled' : 'empty'} ${isViewMode ? 'view-mode' : ''}`}
                  onClick={() => handlePositionClick(position)}
                >
                  {userTeam?.players?.[position] ? (
                    <div className="player-card">
                      <span className="material-icons">sports</span>
                      <div className="player-info">
                        <span className="player-name">
                          {userTeam.players[position].first_name} {userTeam.players[position].last_name}
                        </span>
                        <span className="player-team">{userTeam.players[position].team_name}</span>
                        {weeklyScores && (
                          <span className="player-score">
                            {getPlayerScore(userTeam.players[position].id).toFixed(1)} puan
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="player-card">
                      <span className="material-icons">sports</span>
                      <span className="position-label">Kaleci</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Defanslar */}
            <div className="field-position-group defenders">
              {positionMap[formation].filter(pos => pos.startsWith('DEF')).map((position, index) => (
                <div
                  key={position}
                  className={`field-position ${position} ${userTeam?.players?.[position] ? 'filled' : 'empty'} ${isViewMode ? 'view-mode' : ''}`}
                  onClick={() => handlePositionClick(position)}
                >
                  {userTeam?.players?.[position] ? (
                    <div className="player-card">
                      <span className="material-icons">shield</span>
                      <div className="player-info">
                        <span className="player-name">
                          {userTeam.players[position].first_name} {userTeam.players[position].last_name}
                        </span>
                        <span className="player-team">{userTeam.players[position].team_name}</span>
                        {weeklyScores && (
                          <span className="player-score">
                            {getPlayerScore(userTeam.players[position].id).toFixed(1)} puan
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="player-card">
                      <span className="material-icons">shield</span>
                      <span className="position-label">Defans</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Orta Saha */}
            <div className="field-position-group midfielders">
              {positionMap[formation].filter(pos => pos.startsWith('MID')).map((position, index) => (
                <div
                  key={position}
                  className={`field-position ${position} ${userTeam?.players?.[position] ? 'filled' : 'empty'} ${isViewMode ? 'view-mode' : ''}`}
                  onClick={() => handlePositionClick(position)}
                >
                  {userTeam?.players?.[position] ? (
                    <div className="player-card">
                      <span className="material-icons">groups</span>
                      <div className="player-info">
                        <span className="player-name">
                          {userTeam.players[position].first_name} {userTeam.players[position].last_name}
                        </span>
                        <span className="player-team">{userTeam.players[position].team_name}</span>
                        {weeklyScores && (
                          <span className="player-score">
                            {getPlayerScore(userTeam.players[position].id).toFixed(1)} puan
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="player-card">
                      <span className="material-icons">groups</span>
                      <span className="position-label">Orta Saha</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Forvetler */}
            <div className="field-position-group forwards">
              {positionMap[formation].filter(pos => pos.startsWith('FWD')).map((position, index) => (
              <div
                key={position}
                  className={`field-position ${position} ${userTeam?.players?.[position] ? 'filled' : 'empty'} ${isViewMode ? 'view-mode' : ''}`}
                onClick={() => handlePositionClick(position)}
              >
                {userTeam?.players?.[position] ? (
                  <div className="player-card">
                      <span className="material-icons">directions_run</span>
                    <div className="player-info">
                      <span className="player-name">
                        {userTeam.players[position].first_name} {userTeam.players[position].last_name}
                      </span>
                      <span className="player-team">{userTeam.players[position].team_name}</span>
                        {weeklyScores && (
                          <span className="player-score">
                            {getPlayerScore(userTeam.players[position].id).toFixed(1)} puan
                          </span>
                        )}
                    </div>
                  </div>
                ) : (
                    <div className="player-card">
                      <span className="material-icons">directions_run</span>
                      <span className="position-label">Forvet</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        </div>
        
        {weeklyScores && (
          <div className="weekly-score-panel">
            <h3>Haftalık Puan</h3>
            <div className="total-score">
              <span className="score-value">{parseFloat(weeklyScores.total_points || 0).toFixed(1)}</span>
              <span className="score-label">puan</span>
            </div>
            <div className="score-details">
              <p>Hesaplanma Tarihi:</p>
              <p>{new Date(weeklyScores.calculated_at).toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        )}
        
      </div>

      <div className="team-actions">
        <button 
          className={`btn btn-primary ${isViewMode ? 'disabled' : ''}`} 
          onClick={handleSaveTeam}
          disabled={isViewMode}
        >
          {isViewMode ? 'Sadece Görüntüleme Modu' : 'Takımı Kaydet'}
        </button>
      </div>

      {/* Player Selection Modal */}
      {showPlayerModal && (
        <PlayerSelectionModal
          onClose={() => {
            setShowPlayerModal(false);
            setSelectedPosition(null);
            setSearchTerm('');
            setSelectedTeam('');
          }}
          onSelectPlayer={handlePlayerSelect}
          players={players}
          teams={teams}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedTeam={selectedTeam}
          setSelectedTeam={setSelectedTeam}
          selectedPosition={selectedPosition}
          getPositionName={getPositionName}
        />
      )}
      
      {/* Alert Component */}
      <Alert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
        secondaryMessage={alert.secondaryMessage}
        confirmText="Tamam"
      />
    </div>
  );
};

// Player Selection Modal Component
const PlayerSelectionModal = ({ 
  onClose, 
  onSelectPlayer, 
  players, 
  teams, 
  searchTerm, 
  setSearchTerm, 
  selectedTeam, 
  setSelectedTeam,
  selectedPosition,
  getPositionName
}) => {
  const getPositionIcon = (position) => {
    if (position === 'Kaleci') return 'sports';
    if (position === 'Defans') return 'shield';
    if (position === 'Orta Saha') return 'groups';
    if (position === 'Forvet') return 'directions_run';
    return 'person';
  };

  return (
    <div className="modal-overlay">
      <div className="player-selection-modal">
        <div className="modal-header">
          <h3>Oyuncu Seç - {selectedPosition ? getPositionName(selectedPosition) : ''}</h3>
          <button className="close-btn" onClick={onClose}>
            <span className="material-icons">close</span>
          </button>
        </div>

          <div className="search-filters">
            <div className="search-input">
            <span className="material-icons">search</span>
              <input
                type="text"
                placeholder="Oyuncu adı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="team-filter">
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value)}
              >
                <option value="">Tüm Takımlar</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            <span className="material-icons">expand_more</span>
            </div>
          </div>

          <div className="players-list">
          {players.length === 0 ? (
            <div className="no-players">
              <p>Bu pozisyon için uygun oyuncu bulunamadı.</p>
              <p>Seçilmiş oyuncular ve yanlış pozisyon oyuncuları filtrelenmiştir.</p>
            </div>
          ) : (
            players.map(player => (
              <div
                key={player.id}
                className="player-item"
                onClick={() => onSelectPlayer(player)}
              >
                <span className="material-icons">{getPositionIcon(player.position)}</span>
                <div className="player-info">
                  <span className="player-name">{player.first_name} {player.last_name}</span>
                  <span className="player-details">{player.team_name} - {player.position}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TeamBuilder;


