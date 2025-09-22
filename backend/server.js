const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const config = require('./config');

const app = express();
const PORT = config.port;

// Middleware
app.use(cors());
app.use(express.json());

// Register endpoint
app.post('/api/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, nickname } = req.body;

    // Check if user already exists by email
    const [existingUsersByEmail] = await db.promise().execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existingUsersByEmail.length > 0) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Check if nickname already exists
    const [existingUsersByNickname] = await db.promise().execute(
      'SELECT id FROM users WHERE nickname = ?',
      [nickname]
    );

    if (existingUsersByNickname.length > 0) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten alınmış' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert user
    const [result] = await db.promise().execute(
      'INSERT INTO users (email, password, first_name, last_name, nickname) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, nickname]
    );

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.insertId, email, nickname },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Kullanıcı başarıyla oluşturuldu',
      token,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName,
        nickname
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  try {
    const { emailOrNickname, password } = req.body;

    // Find user by email or nickname
    const [users] = await db.promise().execute(
      'SELECT * FROM users WHERE email = ? OR nickname = ?',
      [emailOrNickname, emailOrNickname]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Geçersiz e-posta/kullanıcı adı veya şifre' });
    }

    const user = users[0];

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Geçersiz e-posta/kullanıcı adı veya şifre' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email, nickname: user.nickname, isAdmin: user.is_admin },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        nickname: user.nickname,
        isAdmin: user.is_admin
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token gerekli' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Geçersiz token' });
  }
};

// Middleware to check admin role
const checkAdmin = (req, res, next) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin yetkisi gerekli' });
  }
  next();
};

// TEAMS API ENDPOINTS

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const [teams] = await db.promise().execute(
      'SELECT * FROM teams ORDER BY name ASC'
    );
    res.json(teams);
  } catch (error) {
    console.error('Get teams error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get team by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const [teams] = await db.promise().execute(
      'SELECT * FROM teams WHERE id = ?',
      [req.params.id]
    );
    
    if (teams.length === 0) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }
    
    res.json(teams[0]);
  } catch (error) {
    console.error('Get team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create team (Admin only)
app.post('/api/teams', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await db.promise().execute(
      'INSERT INTO teams (name) VALUES (?)',
      [name]
    );

    res.status(201).json({
      message: 'Takım başarıyla oluşturuldu',
      team: {
        id: result.insertId,
        name
      }
    });
  } catch (error) {
    console.error('Create team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update team (Admin only)
app.put('/api/teams/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    const [result] = await db.promise().execute(
      'UPDATE teams SET name = ? WHERE id = ?',
      [name, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }

    res.json({ message: 'Takım başarıyla güncellendi' });
  } catch (error) {
    console.error('Update team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete team (Admin only)
app.delete('/api/teams/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().execute(
      'DELETE FROM teams WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }

    res.json({ message: 'Takım başarıyla silindi' });
  } catch (error) {
    console.error('Delete team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PLAYERS API ENDPOINTS

// Get all players (moved to below with search and filter support)

// Get players by team
app.get('/api/teams/:teamId/players', async (req, res) => {
  try {
    const [players] = await db.promise().execute(
      'SELECT * FROM players WHERE team_id = ? ORDER BY position, last_name ASC',
      [req.params.teamId]
    );
    res.json(players);
  } catch (error) {
    console.error('Get team players error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get player by ID
app.get('/api/players/:id', async (req, res) => {
  try {
    const [players] = await db.promise().execute(`
      SELECT p.*, t.name as team_name 
      FROM players p 
      JOIN teams t ON p.team_id = t.id 
      WHERE p.id = ?
    `, [req.params.id]);
    
    if (players.length === 0) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }
    
    res.json(players[0]);
  } catch (error) {
    console.error('Get player error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create player (Admin only)
app.post('/api/players', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { teamId, firstName, lastName, position } = req.body;

    const [result] = await db.promise().execute(
      'INSERT INTO players (team_id, first_name, last_name, position) VALUES (?, ?, ?, ?)',
      [teamId, firstName, lastName, position]
    );

    res.status(201).json({
      message: 'Oyuncu başarıyla oluşturuldu',
      player: {
        id: result.insertId,
        teamId,
        firstName,
        lastName,
        position
      }
    });
  } catch (error) {
    console.error('Create player error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update player (Admin only)
app.put('/api/players/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { teamId, firstName, lastName, position } = req.body;

    const [result] = await db.promise().execute(
      'UPDATE players SET team_id = ?, first_name = ?, last_name = ?, position = ? WHERE id = ?',
      [teamId, firstName, lastName, position, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    res.json({ message: 'Oyuncu başarıyla güncellendi' });
  } catch (error) {
    console.error('Update player error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete player (Admin only)
app.delete('/api/players/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().execute(
      'DELETE FROM players WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Oyuncu bulunamadı' });
    }

    res.json({ message: 'Oyuncu başarıyla silindi' });
  } catch (error) {
    console.error('Delete player error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// MATCHWEEKS API ENDPOINTS

// Get all matchweeks
app.get('/api/matchweeks', async (req, res) => {
  try {
    const [matchweeks] = await db.promise().execute(
      'SELECT * FROM matchweeks ORDER BY created_at DESC'
    );
    res.json(matchweeks);
  } catch (error) {
    console.error('Get matchweeks error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get active matchweek
app.get('/api/matchweeks/active', async (req, res) => {
  try {
    const [matchweeks] = await db.promise().execute(
      'SELECT * FROM matchweeks WHERE is_active = TRUE LIMIT 1'
    );
    res.json(matchweeks[0] || null);
  } catch (error) {
    console.error('Get active matchweek error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create matchweek (Admin only)
app.post('/api/matchweeks', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    const [result] = await db.promise().execute(
      'INSERT INTO matchweeks (name, start_date, end_date) VALUES (?, ?, ?)',
      [name, startDate, endDate]
    );

    res.status(201).json({
      message: 'Maç haftası başarıyla oluşturuldu',
      matchweek: {
        id: result.insertId,
        name,
        startDate,
        endDate
      }
    });
  } catch (error) {
    console.error('Create matchweek error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Set active matchweek (Admin only)
app.put('/api/matchweeks/:id/activate', verifyToken, checkAdmin, async (req, res) => {
  try {
    // First, deactivate all matchweeks
    await db.promise().execute('UPDATE matchweeks SET is_active = FALSE');
    
    // Then activate the selected one
    const [result] = await db.promise().execute(
      'UPDATE matchweeks SET is_active = TRUE WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Maç haftası bulunamadı' });
    }

    res.json({ message: 'Maç haftası aktif olarak ayarlandı' });
  } catch (error) {
    console.error('Activate matchweek error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete matchweek (Admin only)
app.delete('/api/matchweeks/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().execute(
      'DELETE FROM matchweeks WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Maç haftası bulunamadı' });
    }

    res.json({ message: 'Maç haftası başarıyla silindi' });
  } catch (error) {
    console.error('Delete matchweek error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// MATCHES API ENDPOINTS

// Get matches by matchweek
app.get('/api/matchweeks/:matchweekId/matches', async (req, res) => {
  try {
    const [matches] = await db.promise().execute(`
      SELECT m.*, 
             ht.name as home_team_name, 
             at.name as away_team_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.matchweek_id = ?
      ORDER BY m.match_date ASC
    `, [req.params.matchweekId]);
    
    res.json(matches);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create match (Admin only)
app.post('/api/matches', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { matchweekId, homeTeamId, awayTeamId, matchDate } = req.body;

    const [result] = await db.promise().execute(
      'INSERT INTO matches (matchweek_id, home_team_id, away_team_id, match_date) VALUES (?, ?, ?, ?)',
      [matchweekId, homeTeamId, awayTeamId, matchDate]
    );

    res.status(201).json({
      message: 'Maç başarıyla oluşturuldu',
      match: {
        id: result.insertId,
        matchweekId,
        homeTeamId,
        awayTeamId,
        matchDate
      }
    });
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update match score (Admin only)
app.put('/api/matches/:id/score', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { homeScore, awayScore, status } = req.body;

    const [result] = await db.promise().execute(
      'UPDATE matches SET home_score = ?, away_score = ?, status = ? WHERE id = ?',
      [homeScore, awayScore, status, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }

    res.json({ message: 'Maç skoru güncellendi' });
  } catch (error) {
    console.error('Update match score error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete match (Admin only)
app.delete('/api/matches/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().execute(
      'DELETE FROM matches WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Maç bulunamadı' });
    }

    res.json({ message: 'Maç başarıyla silindi' });
  } catch (error) {
    console.error('Delete match error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// PLAYER STATISTICS API ENDPOINTS

// Get players for a match (both teams)
app.get('/api/matches/:matchId/players', async (req, res) => {
  try {
    const [players] = await db.promise().execute(`
      SELECT p.*, t.name as team_name, 
             ps.minutes_played, ps.goals, ps.assists, ps.yellow_cards, ps.red_cards,
             ps.own_goals, ps.penalties_won, ps.penalties_missed, ps.penalties_conceded,
             ps.saves, ps.penalties_saved, ps.penalties_saved_outfield
      FROM players p
      JOIN teams t ON p.team_id = t.id
      JOIN matches m ON (m.home_team_id = t.id OR m.away_team_id = t.id)
      LEFT JOIN player_statistics ps ON (ps.player_id = p.id AND ps.match_id = ?)
      WHERE m.id = ?
      ORDER BY t.name, p.position, p.last_name ASC
    `, [req.params.matchId, req.params.matchId]);
    
    res.json(players);
  } catch (error) {
    console.error('Get match players error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get player statistics for a match
app.get('/api/matches/:matchId/statistics', async (req, res) => {
  try {
    const [statistics] = await db.promise().execute(`
      SELECT ps.*, p.first_name, p.last_name, p.position, t.name as team_name
      FROM player_statistics ps
      JOIN players p ON ps.player_id = p.id
      JOIN teams t ON p.team_id = t.id
      WHERE ps.match_id = ?
      ORDER BY t.name, p.position, p.last_name ASC
    `, [req.params.matchId]);
    
    res.json(statistics);
  } catch (error) {
    console.error('Get match statistics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create or update player statistics (Admin only)
app.post('/api/matches/:matchId/statistics', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { playerId, statistics } = req.body;
    const matchId = req.params.matchId;
    
    console.log('Received player stats request:', { playerId, statistics, matchId });

    // Check if statistics already exist for this player in this match
    const [existing] = await db.promise().execute(
      'SELECT id FROM player_statistics WHERE match_id = ? AND player_id = ?',
      [matchId, playerId]
    );

    if (existing.length > 0) {
      // Update existing statistics
      const [result] = await db.promise().execute(`
        UPDATE player_statistics SET 
          minutes_played = ?, goals = ?, assists = ?, yellow_cards = ?, red_cards = ?,
          own_goals = ?, penalties_won = ?, penalties_missed = ?, penalties_conceded = ?,
          saves = ?, penalties_saved = ?, penalties_saved_outfield = ?
        WHERE match_id = ? AND player_id = ?
      `, [
        statistics.minutesPlayed || 0,
        statistics.goals || 0,
        statistics.assists || 0,
        statistics.yellowCards || 0,
        statistics.redCards || 0,
        statistics.ownGoals || 0,
        statistics.penaltiesWon || 0,
        statistics.penaltiesMissed || 0,
        statistics.penaltiesConceded || 0,
        statistics.saves || 0,
        statistics.penaltiesSaved || 0,
        statistics.penaltiesSavedOutfield || 0,
        matchId,
        playerId
      ]);

      res.json({ message: 'Oyuncu istatistikleri güncellendi' });
    } else {
      // Create new statistics
      const [result] = await db.promise().execute(`
        INSERT INTO player_statistics 
        (match_id, player_id, minutes_played, goals, assists, yellow_cards, red_cards,
         own_goals, penalties_won, penalties_missed, penalties_conceded,
         saves, penalties_saved, penalties_saved_outfield)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        matchId,
        playerId,
        statistics.minutesPlayed || 0,
        statistics.goals || 0,
        statistics.assists || 0,
        statistics.yellowCards || 0,
        statistics.redCards || 0,
        statistics.ownGoals || 0,
        statistics.penaltiesWon || 0,
        statistics.penaltiesMissed || 0,
        statistics.penaltiesConceded || 0,
        statistics.saves || 0,
        statistics.penaltiesSaved || 0,
        statistics.penaltiesSavedOutfield || 0
      ]);

      res.status(201).json({ message: 'Oyuncu istatistikleri kaydedildi' });
    }
  } catch (error) {
    console.error('Save player statistics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Delete player statistics (Admin only)
app.delete('/api/matches/:matchId/statistics/:playerId', verifyToken, checkAdmin, async (req, res) => {
  try {
    const [result] = await db.promise().execute(
      'DELETE FROM player_statistics WHERE match_id = ? AND player_id = ?',
      [req.params.matchId, req.params.playerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'İstatistik bulunamadı' });
    }

    res.json({ message: 'Oyuncu istatistikleri silindi' });
  } catch (error) {
    console.error('Delete player statistics error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// USER TEAM API ENDPOINTS

// Get user team for a matchweek
app.get('/api/user-teams/:matchweekId', verifyToken, async (req, res) => {
  try {
    const [userTeams] = await db.promise().execute(`
      SELECT ut.*, utp.position, p.id as player_id, p.first_name, p.last_name, p.position as player_position, t.name as team_name
      FROM user_teams ut
      LEFT JOIN user_team_players utp ON ut.id = utp.user_team_id
      LEFT JOIN players p ON utp.player_id = p.id
      LEFT JOIN teams t ON p.team_id = t.id
      WHERE ut.user_id = ? AND ut.matchweek_id = ?
    `, [req.user.userId, req.params.matchweekId]);

    if (userTeams.length === 0) {
      return res.json(null);
    }

    // Group players by position
    const team = {
      id: userTeams[0].id,
      formation: userTeams[0].formation,
      team_name: userTeams[0].team_name,
      players: {}
    };

    userTeams.forEach(row => {
      if (row.player_id) {
        team.players[row.position] = {
          id: row.player_id,
          first_name: row.first_name,
          last_name: row.last_name,
          position: row.player_position,
          team_name: row.team_name
        };
      }
    });

    res.json(team);
  } catch (error) {
    console.error('Get user team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Create or update user team
app.post('/api/user-teams', verifyToken, async (req, res) => {
  try {
    const { matchweekId, formation, teamName, position, playerId } = req.body;

    // Check if user team already exists
    const [existingTeams] = await db.promise().execute(
      'SELECT id FROM user_teams WHERE user_id = ? AND matchweek_id = ?',
      [req.user.userId, matchweekId]
    );

    let userTeamId;
    if (existingTeams.length > 0) {
      // Update existing team
      userTeamId = existingTeams[0].id;
      await db.promise().execute(
        'UPDATE user_teams SET formation = ?, team_name = ? WHERE id = ?',
        [formation, teamName, userTeamId]
      );
    } else {
      // Create new team
      const [result] = await db.promise().execute(
        'INSERT INTO user_teams (user_id, matchweek_id, formation, team_name) VALUES (?, ?, ?, ?)',
        [req.user.userId, matchweekId, formation, teamName]
      );
      userTeamId = result.insertId;
    }

    // Add player to position if provided
    if (position && playerId) {
      // Remove existing player from this position
      await db.promise().execute(
        'DELETE FROM user_team_players WHERE user_team_id = ? AND position = ?',
        [userTeamId, position]
      );

      // Add new player
      await db.promise().execute(
        'INSERT INTO user_team_players (user_team_id, player_id, position) VALUES (?, ?, ?)',
        [userTeamId, playerId, position]
      );
    }

    res.status(201).json({ message: 'Takım başarıyla kaydedildi', teamId: userTeamId });
  } catch (error) {
    console.error('Create user team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update user team
app.put('/api/user-teams/:teamId', verifyToken, async (req, res) => {
  try {
    const { teamName, formation } = req.body;

    const [result] = await db.promise().execute(
      'UPDATE user_teams SET team_name = ?, formation = ? WHERE id = ? AND user_id = ?',
      [teamName, formation, req.params.teamId, req.user.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }

    res.json({ message: 'Takım başarıyla güncellendi' });
  } catch (error) {
    console.error('Update user team error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update user team player
app.put('/api/user-teams/:teamId/players', verifyToken, async (req, res) => {
  try {
    const { position, playerId } = req.body;

    // Remove existing player from this position
    await db.promise().execute(
      'DELETE FROM user_team_players WHERE user_team_id = ? AND position = ?',
      [req.params.teamId, position]
    );

    // Add new player
    await db.promise().execute(
      'INSERT INTO user_team_players (user_team_id, player_id, position) VALUES (?, ?, ?)',
      [req.params.teamId, playerId, position]
    );

    res.json({ message: 'Oyuncu başarıyla eklendi' });
  } catch (error) {
    console.error('Update user team player error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get players with search and team filter
app.get('/api/players', async (req, res) => {
  try {
    const { search, team } = req.query;
    
    let query = `
      SELECT p.*, t.name as team_name 
      FROM players p 
      JOIN teams t ON p.team_id = t.id 
    `;
    const params = [];

    if (search || team) {
      query += ' WHERE ';
      const conditions = [];

      if (search) {
        conditions.push('(p.first_name LIKE ? OR p.last_name LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      if (team) {
        conditions.push('p.team_id = ?');
        params.push(team);
      }

      query += conditions.join(' AND ');
    }

    query += ' ORDER BY p.last_name ASC';

    const [players] = await db.promise().execute(query, params);
    res.json(players);
  } catch (error) {
    console.error('Get players error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// SCORING SYSTEM API ENDPOINTS

// Get all scoring rules
app.get('/api/scoring-system', async (req, res) => {
  try {
    const [scoringRules] = await db.promise().execute(
      'SELECT * FROM scoring_system ORDER BY stat_name ASC'
    );
    res.json(scoringRules);
  } catch (error) {
    console.error('Get scoring system error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update team player limit (Admin only) - MUST BE BEFORE /:id route
app.put('/api/scoring-system/team-limit', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { team_player_limit } = req.body;
    
    console.log('Received team_player_limit:', team_player_limit, 'Type:', typeof team_player_limit);
    
    if (team_player_limit === undefined || team_player_limit === null) {
      return res.status(400).json({ message: 'Takım oyuncu limiti değeri gerekli' });
    }
    
    const limitValue = parseInt(team_player_limit);
    if (isNaN(limitValue) || limitValue < 1 || limitValue > 11) {
      return res.status(400).json({ message: 'Takım oyuncu limiti 1-11 arasında olmalıdır' });
    }

    console.log('Updating team_player_limit to:', limitValue);

    // Update all records with the new team_player_limit value
    await db.promise().execute(
      'UPDATE scoring_system SET team_player_limit = ?',
      [limitValue]
    );

    res.json({ message: 'Takım oyuncu limiti başarıyla güncellendi' });
  } catch (error) {
    console.error('Update team player limit error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Update scoring rule (Admin only)
app.put('/api/scoring-system/:id', verifyToken, checkAdmin, async (req, res) => {
  try {
    const { pointsPerStat } = req.body;

    if (pointsPerStat === undefined || pointsPerStat === null) {
      return res.status(400).json({ message: 'Puan değeri gerekli' });
    }

    const pointsValue = parseFloat(pointsPerStat);
    if (isNaN(pointsValue)) {
      return res.status(400).json({ message: 'Geçerli bir sayı girin' });
    }

    const [result] = await db.promise().execute(
      'UPDATE scoring_system SET points_per_stat = ? WHERE id = ?',
      [pointsValue, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Puanlama kuralı bulunamadı' });
    }

    res.json({ message: 'Puanlama kuralı başarıyla güncellendi' });
  } catch (error) {
    console.error('Update scoring rule error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Reset scoring system to default values (Admin only)
app.post('/api/scoring-system/reset', verifyToken, checkAdmin, async (req, res) => {
  try {
    // Reset all scoring rules to default values
    const defaultValues = [
      ['minutes_played', 0.01],
      ['goals', 2.00],
      ['assists', 1.50],
      ['yellow_cards', -1.00],
      ['red_cards', -3.00],
      ['own_goals', -2.00],
      ['penalties_won', 1.00],
      ['penalties_missed', -2.00],
      ['penalties_conceded', -1.00],
      ['saves', 0.50],
      ['penalties_saved', 2.00],
      ['penalties_saved_outfield', 3.00]
    ];

    for (const [statName, points] of defaultValues) {
      await db.promise().execute(
        'UPDATE scoring_system SET points_per_stat = ? WHERE stat_name = ?',
        [points, statName]
      );
    }

    res.json({ message: 'Puanlama sistemi varsayılan değerlere sıfırlandı' });
  } catch (error) {
    console.error('Reset scoring system error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get team player limit (Public - needed for team building)
app.get('/api/scoring-system/team-limit', async (req, res) => {
  try {
    // Get team_player_limit from any existing record (they all have the same value)
    const [result] = await db.promise().execute(
      'SELECT team_player_limit FROM scoring_system WHERE team_player_limit IS NOT NULL LIMIT 1'
    );
    
    if (result.length === 0) {
      // If no record exists, return default value
      return res.json({ team_player_limit: 3 });
    }
    
    res.json({ team_player_limit: result[0].team_player_limit });
  } catch (error) {
    console.error('Get team player limit error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// (Duplicate route removed - moved above)

// WEEKLY SCORES API ENDPOINTS

// Calculate scores for a matchweek (Admin only)
app.post('/api/matchweeks/:matchweekId/calculate-scores', verifyToken, checkAdmin, async (req, res) => {
  try {
    const matchweekId = req.params.matchweekId;
    
    // Get all scoring rules
    const [scoringRules] = await db.promise().execute(
      'SELECT * FROM scoring_system ORDER BY stat_name ASC'
    );
    
    // Create scoring map for quick lookup
    const scoringMap = {};
    scoringRules.forEach(rule => {
      scoringMap[rule.stat_name] = rule.points_per_stat;
    });

    // Get all user teams for this matchweek
    const [userTeams] = await db.promise().execute(`
      SELECT ut.*, u.nickname, u.first_name, u.last_name
      FROM user_teams ut
      JOIN users u ON ut.user_id = u.id
      WHERE ut.matchweek_id = ?
    `, [matchweekId]);

    if (userTeams.length === 0) {
      return res.status(400).json({ message: 'Bu hafta için hiç takım bulunamadı' });
    }

    // Get all matches for this matchweek
    const [matches] = await db.promise().execute(`
      SELECT m.*, ht.name as home_team_name, at.name as away_team_name
      FROM matches m
      JOIN teams ht ON m.home_team_id = ht.id
      JOIN teams at ON m.away_team_id = at.id
      WHERE m.matchweek_id = ?
    `, [matchweekId]);

    if (matches.length === 0) {
      return res.status(400).json({ message: 'Bu hafta için hiç maç bulunamadı' });
    }

    // Get all team IDs for this matchweek
    const teamIds = [...new Set(matches.flatMap(match => [match.home_team_id, match.away_team_id]))];

    // Get all players from these teams
    const [players] = await db.promise().execute(`
      SELECT p.*, t.name as team_name
      FROM players p
      JOIN teams t ON p.team_id = t.id
      WHERE p.team_id IN (${teamIds.map(() => '?').join(',')})
    `, teamIds);

    // Create player map for quick lookup
    const playerMap = {};
    players.forEach(player => {
      playerMap[player.id] = player;
    });

    // Calculate scores for each user team
    const results = [];
    
    for (const userTeam of userTeams) {
      // Get user team players
      const [userTeamPlayers] = await db.promise().execute(`
        SELECT utp.*, p.*, t.name as team_name
        FROM user_team_players utp
        JOIN players p ON utp.player_id = p.id
        JOIN teams t ON p.team_id = t.id
        WHERE utp.user_team_id = ?
      `, [userTeam.id]);

      let totalPoints = 0;
      const playerScores = [];

      // Calculate score for each player in the team
      for (const teamPlayer of userTeamPlayers) {
        let playerPoints = 0;

        // Get player statistics from all matches in this matchweek
        for (const match of matches) {
          const [playerStats] = await db.promise().execute(`
            SELECT ps.*
            FROM player_statistics ps
            WHERE ps.player_id = ? AND ps.match_id = ?
          `, [teamPlayer.player_id, match.id]);

          if (playerStats.length > 0) {
            const stats = playerStats[0];
            
            // Calculate points for each statistic
            const statMappings = {
              'minutes_played': stats.minutes_played || 0,
              'goals': stats.goals || 0,
              'assists': stats.assists || 0,
              'yellow_cards': stats.yellow_cards || 0,
              'red_cards': stats.red_cards || 0,
              'own_goals': stats.own_goals || 0,
              'penalties_won': stats.penalties_won || 0,
              'penalties_missed': stats.penalties_missed || 0,
              'penalties_conceded': stats.penalties_conceded || 0,
              'saves': stats.saves || 0,
              'penalties_saved': stats.penalties_saved || 0,
              'penalties_saved_outfield': stats.penalties_saved_outfield || 0
            };

            // Apply scoring rules
            for (const [statName, value] of Object.entries(statMappings)) {
              if (scoringMap[statName] !== undefined) {
                const rule = scoringRules.find(r => r.stat_name === statName);
                
                // Check if this stat applies to this player's position
                const isGoalkeeper = teamPlayer.position === 'Kaleci';
                const isOutfield = teamPlayer.position !== 'Kaleci';
                
                if ((!rule.is_goalkeeper_only && !rule.is_outfield_only) ||
                    (rule.is_goalkeeper_only && isGoalkeeper) ||
                    (rule.is_outfield_only && isOutfield)) {
                  playerPoints += value * scoringMap[statName];
                }
              }
            }
          }
        }

        // Store individual player score
        await db.promise().execute(`
          INSERT INTO player_weekly_scores (user_team_id, player_id, matchweek_id, total_points)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE total_points = VALUES(total_points)
        `, [userTeam.id, teamPlayer.player_id, matchweekId, playerPoints]);

        playerScores.push({
          player: teamPlayer,
          points: playerPoints
        });

        totalPoints += playerPoints;
      }

      // Store total team score
      await db.promise().execute(`
        INSERT INTO weekly_scores (user_team_id, matchweek_id, total_points)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE total_points = VALUES(total_points)
      `, [userTeam.id, matchweekId, totalPoints]);

      results.push({
        userTeam: userTeam,
        totalPoints: totalPoints,
        playerScores: playerScores
      });
    }

    // Deactivate the matchweek
    await db.promise().execute(
      'UPDATE matchweeks SET is_active = FALSE WHERE id = ?',
      [matchweekId]
    );

    res.json({
      message: 'Puanlar başarıyla hesaplandı ve hafta kapatıldı',
      results: results
    });

  } catch (error) {
    console.error('Calculate scores error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get weekly scores for a matchweek
app.get('/api/matchweeks/:matchweekId/scores', async (req, res) => {
  try {
    const [scores] = await db.promise().execute(`
      SELECT ws.*, ut.team_name, u.nickname, u.first_name, u.last_name
      FROM weekly_scores ws
      JOIN user_teams ut ON ws.user_team_id = ut.id
      JOIN users u ON ut.user_id = u.id
      WHERE ws.matchweek_id = ?
      ORDER BY ws.total_points DESC
    `, [req.params.matchweekId]);

    res.json(scores);
  } catch (error) {
    console.error('Get weekly scores error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Get user team weekly scores with player details
app.get('/api/user-teams/:teamId/weekly-scores/:matchweekId', verifyToken, async (req, res) => {
  try {
    const { teamId, matchweekId } = req.params;
    const userId = req.user.userId;


    // Validate parameters
    if (!teamId || !matchweekId) {
      return res.status(400).json({ message: 'Geçersiz parametreler' });
    }

    // Verify team belongs to user
    const [teamCheck] = await db.promise().execute(
      'SELECT id FROM user_teams WHERE id = ? AND user_id = ?',
      [parseInt(teamId), parseInt(userId)]
    );

    if (teamCheck.length === 0) {
      return res.status(404).json({ message: 'Takım bulunamadı' });
    }

    // Get team total score
    const [teamScore] = await db.promise().execute(`
      SELECT total_points, calculated_at
      FROM weekly_scores
      WHERE user_team_id = ? AND matchweek_id = ?
    `, [parseInt(teamId), parseInt(matchweekId)]);


    // Get player scores
    const [playerScores] = await db.promise().execute(`
      SELECT 
        p.id,
        CONCAT(p.first_name, ' ', p.last_name) as name,
        p.position,
        p.team_id,
        t.name as team_name,
        pws.total_points,
        utp.position as field_position
      FROM player_weekly_scores pws
      JOIN players p ON pws.player_id = p.id
      JOIN teams t ON p.team_id = t.id
      JOIN user_team_players utp ON p.id = utp.player_id AND utp.user_team_id = pws.user_team_id
      WHERE pws.user_team_id = ? AND pws.matchweek_id = ?
      ORDER BY utp.position, pws.total_points DESC
    `, [parseInt(teamId), parseInt(matchweekId)]);


    res.json({
      teamScore: teamScore[0] || { total_points: 0, calculated_at: null },
      playerScores: playerScores
    });
  } catch (error) {
    console.error('Get user team weekly scores error:', error);
    res.status(500).json({ message: 'Sunucu hatası' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
