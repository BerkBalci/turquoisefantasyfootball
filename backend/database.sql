-- Fantasy Football Database Setup
CREATE DATABASE IF NOT EXISTS fantasy_football;
USE fantasy_football;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    position ENUM('Kaleci', 'Defans', 'Orta Saha', 'Forvet') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Matchweeks table
CREATE TABLE IF NOT EXISTS matchweeks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT FALSE,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    matchweek_id INT NOT NULL,
    home_team_id INT NOT NULL,
    away_team_id INT NOT NULL,
    home_score INT DEFAULT NULL,
    away_score INT DEFAULT NULL,
    match_date DATETIME,
    status ENUM('Scheduled', 'Live', 'Finished') DEFAULT 'Scheduled',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (matchweek_id) REFERENCES matchweeks(id) ON DELETE CASCADE,
    FOREIGN KEY (home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (away_team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- Player statistics table
CREATE TABLE IF NOT EXISTS player_statistics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    match_id INT NOT NULL,
    player_id INT NOT NULL,
    minutes_played INT DEFAULT 0,
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    own_goals INT DEFAULT 0,
    penalties_won INT DEFAULT 0,
    penalties_missed INT DEFAULT 0,
    penalties_conceded INT DEFAULT 0,
    saves INT DEFAULT 0,
    penalties_saved INT DEFAULT 0,
    penalties_saved_outfield INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_match (match_id, player_id)
);

-- User teams table (for fantasy team building)
CREATE TABLE IF NOT EXISTS user_teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    matchweek_id INT NOT NULL,
    formation VARCHAR(10) NOT NULL,
    team_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (matchweek_id) REFERENCES matchweeks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_matchweek (user_id, matchweek_id)
);

-- User team players table (player positions in user's team)
CREATE TABLE IF NOT EXISTS user_team_players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_team_id INT NOT NULL,
    player_id INT NOT NULL,
    position VARCHAR(20) NOT NULL, -- GK, DEF1, DEF2, DEF3, DEF4, DEF5, MID1, MID2, MID3, MID4, MID5, FWD1, FWD2, FWD3
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_team_id) REFERENCES user_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    UNIQUE KEY unique_team_position (user_team_id, position)
);

-- Insert admin user (email: admin@fantasy.com, password: admin123)
INSERT IGNORE INTO users (email, password, first_name, last_name, nickname, is_admin) 
VALUES ('admin@fantasy.com', '$2b$10$rQZ8K9LmN2pO3qR4sT5uVeWxYzA1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6', 'Admin', 'User', 'admin', TRUE);

-- Insert teams
INSERT IGNORE INTO teams (id, name) VALUES
(1, 'Galatasaray'),
(2, 'Kocaelispor'),
(3, 'Alanyaspor'),
(4, 'Kasımpaşa'),
(5, 'Kayserispor'),
(6, 'Fatih Karagümrük'),
(7, 'Gençlerbirliği'),
(8, 'Trabzonspor'),
(9, 'Samsunspor'),
(10, 'Fenerbahçe'),
(11, 'Beşiktaş'),
(12, 'Konyaspor'),
(13, 'Çaykur Rizespor'),
(14, 'Eyüpspor'),
(15, 'Antalyaspor'),
(16, 'Başakşehir'),
(17, 'Göztepe'),
(18, 'Gaziantep FK');


-- Insert players for Turkish Super League (18 teams)

-- Galatasaray / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(1, 'Uğurcan', 'Çakır', 'Kaleci'),
(1, 'Günay', 'Güvenç', 'Kaleci'),
(1, 'Batuhan', 'Şen', 'Kaleci'),
(1, 'Enes Emre', 'Büyük', 'Kaleci');

-- Galatasaray / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(1, 'Davinson', 'Sánchez', 'Defans'),
(1, 'Abdülkerim', 'Bardakcı', 'Defans'),
(1, 'Metehan', 'Baltacı', 'Defans'),
(1, 'Arda', 'Ünay', 'Defans'),
(1, 'Ismail', 'Jakobs', 'Defans'),
(1, 'Eren', 'Elmalı', 'Defans'),
(1, 'Kazımcan', 'Karataş', 'Defans'),
(1, 'Wilfried', 'Singo', 'Defans');

-- Galatasaray / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(1, 'Roland', 'Sallai', 'Orta Saha'),
(1, 'Lucas', 'Torreira', 'Orta Saha'),
(1, 'Mario', 'Lemina', 'Orta Saha'),
(1, 'Kaan', 'Ayhan', 'Orta Saha'),
(1, 'Gabriel', 'Sara', 'Orta Saha'),
(1, 'İlkay', 'Gündoğan', 'Orta Saha'),
(1, 'Berkan', 'Kutlu', 'Orta Saha'),
(1, 'Gökdeniz', 'Gürpüz', 'Orta Saha');

-- Galatasaray / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(1, 'Barış Alper', 'Yılmaz', 'Forvet'),
(1, 'Ahmed', 'Kutucu', 'Forvet'),
(1, 'Leroy', 'Sané', 'Forvet'),
(1, 'Yunus', 'Akgün', 'Forvet'),
(1, 'Yusuf', 'Demir', 'Forvet'),
(1, 'Victor', 'Osimhen', 'Forvet'),
(1, 'Mauro', 'Icardi', 'Forvet');

-- Kocaelispor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(2, 'Aleksandar', 'Jovanovic', 'Kaleci'),
(2, 'Serhat', 'Öztaşdelen', 'Kaleci'),
(2, 'Gökhan', 'Değirmenci', 'Kaleci');

-- Kocaelispor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(2, 'Botond', 'Balogh', 'Defans'),
(2, 'Mateusz', 'Wieteska', 'Defans'),
(2, 'Hrvoje', 'Smolcic', 'Defans'),
(2, 'Oleksandr', 'Syrota', 'Defans'),
(2, 'Tarkan', 'Serbest', 'Defans'),
(2, 'Massadio', 'Haidara', 'Defans'),
(2, 'Muharrem', 'Cinan', 'Defans'),
(2, 'Anfernee', 'Dijksteel', 'Defans'),
(2, 'Ahmet', 'Oğuz', 'Defans');

-- Kocaelispor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(2, 'Show', '', 'Orta Saha'),
(2, 'Joseph', 'Nonge', 'Orta Saha'),
(2, 'Karol', 'Linetty', 'Orta Saha'),
(2, 'Habib', 'Keita', 'Orta Saha'),
(2, 'Tayfur', 'Bingöl', 'Orta Saha'),
(2, 'Samet', 'Yalçın', 'Orta Saha'),
(2, 'Ege', 'Bilim', 'Orta Saha');

-- Kocaelispor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(2, 'Darko', 'Churlinov', 'Forvet'),
(2, 'Rigoberto', 'Rivas', 'Forvet'),
(2, 'Furkan', 'Gedik', 'Forvet'),
(2, 'Can', 'Keleş', 'Forvet'),
(2, 'Dan', 'Agyei', 'Forvet'),
(2, 'Bruno', 'Petkovic', 'Forvet'),
(2, 'Ahmet', 'Sağat', 'Forvet'),
(2, 'Serdar', 'Dursun', 'Forvet');

-- Alanyaspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(3, 'Mert', 'Bayram', 'Kaleci'),
(3, 'Paulo', 'Victor', 'Kaleci'),
(3, 'Ertuğrul', 'Taşkıran', 'Kaleci');

-- Alanyaspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(3, 'Fatih', 'Aksoy', 'Defans'),
(3, 'Nuno', 'Lima', 'Defans'),
(3, 'Fidan', 'Aliti', 'Defans'),
(3, 'Bruno', 'Viana', 'Defans'),
(3, 'Ümit', 'Akdağ', 'Defans'),
(3, 'Bedirhan', 'Özyurt', 'Defans'),
(3, 'Yusuf', 'Özdemir', 'Defans'),
(3, 'Baran', 'Moğultay', 'Defans'),
(3, 'Florent', 'Hadergjonaj', 'Defans'),
(3, 'Batuhan', 'Yavuz', 'Defans');

-- Alanyaspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(3, 'Maestro', '', 'Orta Saha'),
(3, 'Gaius', 'Makouta', 'Orta Saha'),
(3, 'Nicolas', 'Janvier', 'Orta Saha'),
(3, 'Enes', 'Keskin', 'Orta Saha'),
(3, 'İzzet', 'Çelik', 'Orta Saha'),
(3, 'Buluthan', 'Bulut', 'Orta Saha'),
(3, 'Ianis', 'Hagi', 'Orta Saha'),
(3, 'Efecan', 'Karaca', 'Orta Saha'),
(3, 'Yusuf Can', 'Karademir', 'Orta Saha');

-- Alanyaspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(3, 'İbrahim', 'Kaya', 'Forvet'),
(3, 'Ruan', '', 'Forvet'),
(3, 'Meschack', 'Elia', 'Forvet'),
(3, 'Steve', 'Mounié', 'Forvet'),
(3, 'Güven', 'Yalçın', 'Forvet'),
(3, 'Ui-jo', 'Hwang', 'Forvet'),
(3, 'Uchenna', 'Ogundu', 'Forvet');

-- Kasımpaşa / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(4, 'Andreas', 'Gianniotis', 'Kaleci'),
(4, 'Ali Emre', 'Yanar', 'Kaleci'),
(4, 'Ege', 'Albayrak', 'Kaleci'),
(4, 'Şant', 'Kazancı', 'Kaleci');

-- Kasımpaşa / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(4, 'Attila', 'Szalai', 'Defans'),
(4, 'Nicholas', 'Opoku', 'Defans'),
(4, 'Adem', 'Arous', 'Defans'),
(4, 'Taylan', 'Aydın', 'Defans'),
(4, 'Yunus', 'Atakaya', 'Defans'),
(4, 'Godfried', 'Frimpong', 'Defans'),
(4, 'Emre', 'Taşdemir', 'Defans'),
(4, 'Cláudio', 'Winck', 'Defans'),
(4, 'Jhon', 'Espinoza', 'Defans'),
(4, 'Berkay', 'Muratoğlu', 'Defans'),
(4, 'Oğuzhan', 'Yılmaz', 'Defans');

-- Kasımpaşa / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(4, 'Andri Fannar', 'Baldursson', 'Orta Saha'),
(4, 'Cem', 'Üstündag', 'Orta Saha'),
(4, 'Cafú', '', 'Orta Saha'),
(4, 'Atakan', 'Müjde', 'Orta Saha'),
(4, 'Haris', 'Hajradinovic', 'Orta Saha');

-- Kasımpaşa / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(4, 'Mortadha Ben', 'Ouanes', 'Forvet'),
(4, 'Ali Yavuz', 'Kol', 'Forvet'),
(4, 'Erdem', 'Çetinkaya', 'Forvet'),
(4, 'Fousseni', 'Diabaté', 'Forvet'),
(4, 'Mamadou', 'Fall', 'Forvet'),
(4, 'Yasin', 'Eratlıa', 'Forvet'),
(4, 'Yusuf', 'Barasi', 'Forvet'),
(4, 'Pape Habib', 'Guèye', 'Forvet'),
(4, 'Kubilay', 'Kanatsızkuş', 'Forvet');

-- Kayserispor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(5, 'Bilal', 'Bayazıt', 'Kaleci'),
(5, 'Deniz', 'Dönmezer', 'Kaleci'),
(5, 'Onurcan', 'Piri', 'Kaleci'),
(5, 'Şamil', 'Öztürk', 'Kaleci');

-- Kayserispor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(5, 'Stefano', 'Denswil', 'Defans'),
(5, 'Majid', 'Hosseini', 'Defans'),
(5, 'Arif', 'Kocaman', 'Defans'),
(5, 'Gideon', 'Jung', 'Defans'),
(5, 'Abdulsamet', 'Burak', 'Defans'),
(5, 'Kayra', 'Cihan', 'Defans'),
(5, 'Lionel', 'Carole', 'Defans'),
(5, 'Ramazan', 'Civelek', 'Defans');

-- Kayserispor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(5, 'Youssef Aït', 'Bennasser', 'Orta Saha'),
(5, 'Yaw', 'Ackah', 'Orta Saha'),
(5, 'László', 'Bénes', 'Orta Saha'),
(5, 'Dorukhan', 'Toköz', 'Orta Saha'),
(5, 'Ali', 'Karimi', 'Orta Saha'),
(5, 'Furkan', 'Soyalp', 'Orta Saha'),
(5, 'Yiğit Emre', 'Çeltik', 'Orta Saha'),
(5, 'João', 'Mendes', 'Orta Saha');

-- Kayserispor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(5, 'Eray', 'Özbek', 'Forvet'),
(5, 'Miguel', 'Cardoso', 'Forvet'),
(5, 'Aaron', 'Opoku', 'Forvet'),
(5, 'Nurettin', 'Korkmaz', 'Forvet'),
(5, 'Carlos', 'Mané', 'Forvet'),
(5, 'Burak', 'Kapacak', 'Forvet'),
(5, 'Berkan', 'Aslan', 'Forvet'),
(5, 'German', 'Onugkha', 'Forvet'),
(5, 'Indrit', 'Tuci', 'Forvet'),
(5, 'Talha', 'Sarıarslan', 'Forvet');

-- Fatih Karagümrük / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(6, 'Ivo', 'Grbić', 'Kaleci'),
(6, 'Furkan', 'Bekleviç', 'Kaleci'),
(6, 'Berke Can', 'Evli', 'Kaleci'),
(6, 'Kerem', 'Yandal', 'Kaleci');

-- Fatih Karagümrük / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(6, 'Enzo', 'Roco', 'Defans'),
(6, 'Nikoloz', 'Ugrekhelidze', 'Defans'),
(6, 'Burhan', 'Ersoy', 'Defans'),
(6, 'Anıl Yiğit', 'Çınar', 'Defans'),
(6, 'Muhammed', 'Kadıoğlu', 'Defans'),
(6, 'Jure', 'Balkovec', 'Defans'),
(6, 'Çağatay', 'Kurukalp', 'Defans'),
(6, 'Ricardo', 'Esgaio', 'Defans'),
(6, 'Atakan', 'Çankaya', 'Defans');

-- Fatih Karagümrük / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(6, 'Marius Tresor', 'Doh', 'Orta Saha'),
(6, 'Matías', 'Kravnetter', 'Orta Saha'),
(6, 'Berkay', 'Özcan', 'Orta Saha'),
(6, 'Alper', 'Demiroğlu', 'Orta Saha'),
(6, 'Ömer', 'Gümüş', 'Orta Saha'),
(6, 'Tuğbey', 'Akgün', 'Orta Saha'),
(6, 'Daniel', 'Johnson', 'Orta Saha'),
(6, 'Barış', 'Kalaycı', 'Orta Saha');

-- Fatih Karagümrük / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(6, 'Sam', 'Larsson', 'Forvet'),
(6, 'Serginho', '', 'Forvet'),
(6, 'João', 'Camacho', 'Forvet'),
(6, 'Tarık Buğra', 'Kalpaklı', 'Forvet'),
(6, 'David Datro', 'Fofana', 'Forvet'),
(6, 'Andre', 'Gray', 'Forvet'),
(6, 'Tiago', 'Çukur', 'Forvet'),
(6, 'Ahmet', 'Sivri', 'Forvet');

-- Gençlerbirliği / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(7, 'Ricardo', 'Velho', 'Kaleci'),
(7, 'Gökhan', 'Akkan', 'Kaleci'),
(7, 'Erhan', 'Erenürk', 'Kaleci'),
(7, 'Ebrar', 'Aydın', 'Kaleci'),
(7, 'Berk Deniz', 'Çukurcu', 'Kaleci');

-- Gençlerbirliği / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(7, 'Dimitrios', 'Goutas', 'Defans'),
(7, 'Thalisson', '', 'Defans'),
(7, 'Zan', 'Zuzek', 'Defans'),
(7, 'Sinan', 'Osmanoğlu', 'Defans'),
(7, 'Abdullah', 'Şahindere', 'Defans'),
(7, 'Umut', 'İslamoğlu', 'Defans'),
(7, 'Abdurrahim', 'Dursun', 'Defans'),
(7, 'Matej', 'Hanousek', 'Defans'),
(7, 'Yiğit Hamza', 'Aydar', 'Defans'),
(7, 'Pedro', 'Pereira', 'Defans'),
(7, 'Furctan', 'Özüm', 'Defans'),
(7, 'Emirhan', 'Önal', 'Defans');

-- Gençlerbirliği / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(7, 'Oğulcan', 'Ülgün', 'Orta Saha'),
(7, 'Moussak', 'Kyabou', 'Orta Saha'),
(7, 'Peter', 'Etebo', 'Orta Saha'),
(7, 'Tom', 'Dele-Bashiru', 'Orta Saha'),
(7, 'Ensar', 'Kemaloğlu', 'Orta Saha'),
(7, 'Samed', 'Onur', 'Orta Saha'),
(7, 'Dal', 'Varesanovic', 'Orta Saha'),
(7, 'Gökhan', 'Gürpüz', 'Orta Saha'),
(7, 'Franco', 'Tongya', 'Orta Saha');

-- Gençlerbirliği / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(7, 'Henry', 'Onyekuru', 'Forvet'),
(7, 'Kevin', 'Csoboth', 'Forvet'),
(7, 'Metehan', 'Mimaroğlu', 'Forvet'),
(7, 'Elias', 'Durmaz', 'Forvet'),
(7, 'Ilhan', 'Demir', 'Forvet'),
(7, 'Shkëlqim Demhasaj', 'Koita', 'Forvet'),
(7, 'Aaron', 'Boupendza', 'Forvet'),
(7, 'Batuhan', 'Azcan', 'Forvet');

-- Trabzonspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(8, 'André', 'Onana', 'Kaleci'),
(8, 'Onuralp', 'Çevikkan', 'Kaleci'),
(8, 'Ahmet', 'Yıldırım', 'Kaleci'),
(8, 'Erol Can', 'Çolak', 'Kaleci');

-- Trabzonspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(8, 'Arseniy', 'Batagov', 'Defans'),
(8, 'Serdar', 'Saatçı', 'Defans'),
(8, 'Rayyan', 'Baniya', 'Defans'),
(8, 'Stefan', 'Savić', 'Defans'),
(8, 'Arda', 'Öztürk', 'Defans'),
(8, 'Taha Emre', 'İnce', 'Defans'),
(8, 'Mustafa', 'Eskihellaç', 'Defans'),
(8, 'Arif', 'Boşluk', 'Defans'),
(8, 'Wagner', 'Pina', 'Defans');

-- Trabzonspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(8, 'Okay', 'Yokuşlu', 'Orta Saha'),
(8, 'Salih', 'Malkoçoğlu', 'Orta Saha'),
(8, 'Benjamin', 'Bouchouari', 'Orta Saha'),
(8, 'Ozan', 'Tufan', 'Orta Saha'),
(8, 'Tim', 'Jabol-Folcarelli', 'Orta Saha'),
(8, 'Christ Inao', 'Oulai', 'Orta Saha'),
(8, 'Boran', 'Başkan', 'Orta Saha'),
(8, 'Ernest', 'Muci', 'Orta Saha');

-- Trabzonspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(8, 'Kazeem', 'Olabige', 'Forvet'),
(8, 'Cihan', 'Çanak', 'Forvet'),
(8, 'Anthony', 'Nwakaeme', 'Forvet'),
(8, 'Oleksandr', 'Zubkov', 'Forvet'),
(8, 'Edin', 'Višća', 'Forvet'),
(8, 'Danylo', 'Sikan', 'Forvet'),
(8, 'Paul', 'Onuachu', 'Forvet'),
(8, 'Felipe', 'Augusto', 'Forvet');

-- Samsunspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(9, 'Okan', 'Kocuk', 'Kaleci'),
(9, 'Albert', 'Posiadala', 'Kaleci'),
(9, 'Efe Yiğit', 'Üstin', 'Kaleci'),
(9, 'Efe Berat', 'Toriz', 'Kaleci');

-- Samsunspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(9, 'Toni', 'Borevković', 'Defans'),
(9, 'Rick van', 'Drongelen', 'Defans'),
(9, 'Lubomir', 'Satka', 'Defans'),
(9, 'Yunus Emre', 'Çift', 'Defans'),
(9, 'Bedirhan', 'Çetin', 'Defans'),
(9, 'Logi', 'Tómasson', 'Defans'),
(9, 'Soner', 'Gönül', 'Defans'),
(9, 'Joe', 'Mendes', 'Defans'),
(9, 'Zeki', 'Yavru', 'Defans');

-- Samsunspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(9, 'Antoine', 'Makoumbou', 'Orta Saha'),
(9, 'Celil', 'Yüksel', 'Orta Saha'),
(9, 'Franck', 'Attoen', 'Orta Saha'),
(9, 'Olivier', 'Ntcham', 'Orta Saha'),
(9, 'Eyüp', 'Aydın', 'Orta Saha'),
(9, 'Soner', 'Aydoğdu', 'Orta Saha'),
(9, 'Afonso', 'Sousa', 'Orta Saha'),
(9, 'Carlo', 'Holse', 'Orta Saha');

-- Samsunspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(9, 'Emre', 'Kılınç', 'Forvet'),
(9, 'Tanguy', 'Coulibaly', 'Forvet'),
(9, 'Anthony', 'Musaba', 'Forvet'),
(9, 'Polat', 'Yaldır', 'Forvet'),
(9, 'Cherif', 'Ndiaye', 'Forvet'),
(9, 'Marius', 'Mouandilmadji', 'Forvet'),
(9, 'Ebrima', 'Ceesay', 'Forvet');

-- Fenerbahçe / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(10, 'Ederson', '', 'Kaleci'),
(10, 'İrfan Can', 'Eğribayat', 'Kaleci'),
(10, 'Tarık', 'Çetin', 'Kaleci'),
(10, 'Engin Can', 'Biberge', 'Kaleci');

-- Fenerbahçe / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(10, 'Milan', 'Škriniar', 'Defans'),
(10, 'Jayden', 'Oosterwolde', 'Defans'),
(10, 'Çağlar', 'Söyüncü', 'Defans'),
(10, 'Rodrigo', 'Becão', 'Defans'),
(10, 'Yiğit Efe', 'Demir', 'Defans'),
(10, 'Archie', 'Brown', 'Defans'),
(10, 'Levent', 'Mercan', 'Defans'),
(10, 'Nélson', 'Semedo', 'Defans'),
(10, 'Mert', 'Müldür', 'Defans');

-- Fenerbahçe / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(10, 'Edson', 'Álvarez', 'Orta Saha'),
(10, 'İsmail', 'Yüksek', 'Orta Saha'),
(10, 'Bartuğ', 'Elmaz', 'Orta Saha'),
(10, 'Fred', '', 'Orta Saha'),
(10, 'Abdou Aziz', 'Fall', 'Orta Saha'),
(10, 'Marco', 'Asensio', 'Orta Saha'),
(10, 'Sebastian', 'Szymański', 'Orta Saha'),
(10, 'Talisca', '', 'Orta Saha'),
(10, 'Mert Hakan', 'Yandaş', 'Orta Saha');

-- Fenerbahçe / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(10, 'Kerem', 'Aktürkoğlu', 'Forvet'),
(10, 'Oğuz', 'Aydın', 'Forvet'),
(10, 'Dorgeles', 'Nene', 'Forvet'),
(10, 'İrfan Can', 'Kahveci', 'Forvet'),
(10, 'Emre', 'Mor', 'Forvet'),
(10, 'Jhon', 'Durán', 'Forvet'),
(10, 'Youssef', 'En-Nesyri', 'Forvet'),
(10, 'Cenk', 'Tosun', 'Forvet');

-- Beşiktaş / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(11, 'Ersin', 'Destanoğlu', 'Kaleci'),
(11, 'Mert', 'Günok', 'Kaleci'),
(11, 'Emre', 'Bilgin', 'Kaleci'),
(11, 'Emir', 'Yaşar', 'Kaleci');

-- Beşiktaş / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(11, 'Tiago', 'Djaló', 'Defans'),
(11, 'Felix', 'Uduokhai', 'Defans'),
(11, 'Emirhan', 'Topçu', 'Defans'),
(11, 'Gabriel', 'Paulista', 'Defans'),
(11, 'Stefan', 'Savić', 'Defans'),
(11, 'Arda', 'Öztürk', 'Defans'),
(11, 'David', 'Jurásek', 'Defans'),
(11, 'Rıdvan', 'Yılmaz', 'Defans'),
(11, 'Taylan', 'Bulut', 'Defans'),
(11, 'Jonas', 'Svensson', 'Defans'),
(11, 'Gökhan', 'Sazdağı', 'Defans');

-- Beşiktaş / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(11, 'Wilfred', 'Ndidi', 'Orta Saha'),
(11, 'Demir Ege', 'Tıknaz', 'Orta Saha'),
(11, 'Kartal', 'Yılmaz', 'Orta Saha'),
(11, 'Necip', 'Uysal', 'Orta Saha'),
(11, 'Orkun', 'Kökçü', 'Orta Saha'),
(11, 'Salih', 'Uçan', 'Orta Saha');

-- Beşiktaş / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(11, 'Devrim', 'Şahin', 'Forvet'),
(11, 'Jota', 'Silva', 'Forvet'),
(11, 'Václav', 'Černý', 'Forvet'),
(11, 'Cengiz', 'Ünder', 'Forvet'),
(11, 'Milot', 'Rashica', 'Forvet'),
(11, 'Rafa', 'Silva', 'Forvet'),
(11, 'Tammy', 'Abraham', 'Forvet'),
(11, 'El Bilal', 'Touré', 'Forvet'),
(11, 'Mustafa', 'Hekimoğlu', 'Forvet');

-- Konyaspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(12, 'Deniz', 'Ertaş', 'Kaleci'),
(12, 'Bahadır', 'Güngördü', 'Kaleci'),
(12, 'Egemen', 'Aydın', 'Kaleci');

-- Konyaspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(12, 'Riechedly', 'Bazoer', 'Defans'),
(12, 'Adil', 'Demirbağ', 'Defans'),
(12, 'Uğurcan', 'Yazgılı', 'Defans'),
(12, 'Josip', 'Calusic', 'Defans'),
(12, 'Utku', 'Eriş', 'Defans'),
(12, 'Guilherme', '', 'Defans'),
(12, 'Yasir', 'Subaşı', 'Defans'),
(12, 'Yhoan', 'Andzouana', 'Defans');

-- Konyaspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(12, 'Ufuk', 'Akyol', 'Orta Saha'),
(12, 'Marko', 'Jevtovic', 'Orta Saha'),
(12, 'Mücahit', 'İbrahimoğlu', 'Orta Saha'),
(12, 'İsmail Esat', 'Buğa', 'Orta Saha'),
(12, 'Morten', 'Bjørlo', 'Orta Saha'),
(12, 'Jin-ho', 'Jo', 'Orta Saha'),
(12, 'Enis', 'Bardhi', 'Orta Saha'),
(12, 'Pedrinho', '', 'Orta Saha'),
(12, 'Melih', 'İbrahimoğlu', 'Orta Saha');

-- Konyaspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(12, 'Kaan', 'Akyazı', 'Forvet'),
(12, 'Marius', 'Ştefănescu', 'Forvet'),
(12, 'Alassane', 'Ndao', 'Forvet'),
(12, 'Tunahan', 'Taşçı', 'Forvet'),
(12, 'Jackson', 'Muleka', 'Forvet'),
(12, 'Umut', 'Nayir', 'Forvet'),
(12, 'Melih', 'Bostan', 'Forvet');

-- Çaykur Rizespor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(13, 'Yahia', 'Fofana', 'Kaleci'),
(13, 'Erdem', 'Canpolat', 'Kaleci'),
(13, 'Efe', 'Doğan', 'Kaleci');

-- Çaykur Rizespor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(13, 'Modibo', 'Sagnan', 'Defans'),
(13, 'Khusniddin', 'Alikulov', 'Defans'),
(13, 'Attila', 'Mocsi', 'Defans'),
(13, 'Samet', 'Alaydin', 'Defans'),
(13, 'Casper', 'Höjer', 'Defans'),
(13, 'Taha', 'Şahin', 'Defans'),
(13, 'Furkan', 'Orak', 'Defans');

-- Çaykur Rizespor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(13, 'Giannis', 'Papanikolaou', 'Orta Saha'),
(13, 'Janne-Pekka', 'Laine', 'Orta Saha'),
(13, 'Qazim', 'Laci', 'Orta Saha'),
(13, 'Ibrahim', 'Olawoyin', 'Orta Saha'),
(13, 'Muhamed', 'Buljubasic', 'Orta Saha'),
(13, 'Mithat', 'Pala', 'Orta Saha'),
(13, 'Taylan', 'Antalyalı', 'Orta Saha');

-- Çaykur Rizespor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(13, 'Valentin', 'Mihăilă', 'Forvet'),
(13, 'Altin', 'Zeqiri', 'Forvet'),
(13, 'Emrecan', 'Bulut', 'Forvet'),
(13, 'Jesurun', 'Rak-Sakyi', 'Forvet'),
(13, 'Loide', 'Augusto', 'Forvet'),
(13, 'Ali', 'Sowe', 'Forvet'),
(13, 'Vaclav', 'Jurecka', 'Forvet'),
(13, 'Halil', 'Dervişoğlu', 'Forvet');

-- Eyüpspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(14, 'Marcos', 'Felipe', 'Kaleci'),
(14, 'Jankat', 'Yılmaz', 'Kaleci'),
(14, 'Alp', 'Kıseser', 'Kaleci');

-- Eyüpspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(14, 'Nihad', 'Mujakic', 'Defans'),
(14, 'Robin', 'Yalçın', 'Defans'),
(14, 'Emir', 'Ortakaya', 'Defans'),
(14, 'Luccas', 'Claro', 'Defans'),
(14, 'Gilbert', 'Mendy', 'Defans'),
(14, 'Umut', 'Meraş', 'Defans'),
(14, 'Calegari', '', 'Defans'),
(14, 'Talha', 'Ulvan', 'Defans');

-- Eyüpspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(14, 'Mateusz', 'Legowski', 'Orta Saha'),
(14, 'Baran', 'Gezcek', 'Orta Saha'),
(14, 'Taras', 'Stepanenko', 'Orta Saha'),
(14, 'Taşjon', 'Ilter', 'Orta Saha'),
(14, 'Christ', 'Sadia', 'Orta Saha'),
(14, 'Kerem', 'Demirbay', 'Orta Saha'),
(14, 'Yalçın', 'Kayan', 'Orta Saha'),
(14, 'Can', 'Bayrıkan', 'Orta Saha'),
(14, 'Svit', 'Seslar', 'Orta Saha'),
(14, 'Emre', 'Akbaba', 'Orta Saha'),
(14, 'Samu', 'Saiz', 'Orta Saha');

-- Eyüpspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(14, 'Prince', 'Ampem', 'Forvet'),
(14, 'Serdar', 'Gürler', 'Forvet'),
(14, 'Halil', 'Akbunar', 'Forvet'),
(14, 'Denis', 'Drăguş', 'Forvet'),
(14, 'Mame', 'Thiam', 'Forvet'),
(14, 'Umut', 'Bozok', 'Forvet'),
(14, 'Metehan', 'Altunbaş', 'Forvet');

-- Antalyaspor / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(15, 'Ataberk', 'Dadakdeniz', 'Kaleci'),
(15, 'Julián', 'Cuesta', 'Kaleci'),
(15, 'Abdullah', 'Yiğiter', 'Kaleci'),
(15, 'Kağan', 'Arıcan', 'Kaleci');

-- Antalyaspor / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(15, 'Georgiy', 'Dzhikiya', 'Defans'),
(15, 'Lautaro', 'Giannetti', 'Defans'),
(15, 'Bahadır', 'Öztürk', 'Defans'),
(15, 'Veysel', 'Sarı', 'Defans'),
(15, 'Hüseyin', 'Türkmen', 'Defans'),
(15, 'Ege', 'İzmirli', 'Defans'),
(15, 'Kenneth', 'Paal', 'Defans'),
(15, 'Samet', 'Karaloç', 'Defans'),
(15, 'Efecan', 'Gülerce', 'Defans'),
(15, 'Bünyamin', 'Balcı', 'Defans'),
(15, 'Erdoğan', 'Yeşilyurt', 'Defans');

-- Antalyaspor / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(15, 'Jesper', 'Ceesay', 'Orta Saha'),
(15, 'Soner', 'Dikmen', 'Orta Saha'),
(15, 'Dario', 'Saric', 'Orta Saha'),
(15, 'Yakup', 'Işın', 'Orta Saha'),
(15, 'Abdülkadir', 'Ömür', 'Orta Saha'),
(15, 'Ramzi', 'Safuri', 'Orta Saha'),
(15, 'Sander van de', 'Streek', 'Orta Saha');

-- Antalyaspor / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(15, 'Nikola', 'Storm', 'Forvet'),
(15, 'Doğukan', 'Sinik', 'Forvet'),
(15, 'Ali', 'Demirbelik', 'Forvet'),
(15, 'Berkay', 'Topdemir', 'Forvet'),
(15, 'Samuel', 'Ballet', 'Forvet'),
(15, 'Tomas', 'Cvancara', 'Forvet'),
(15, 'Yohan', 'Boli', 'Forvet'),
(15, 'Poyraz', 'Yıldırım', 'Forvet'),
(15, 'Bachir', 'Gueye', 'Forvet'),
(15, 'Arda', 'Altun', 'Forvet'),
(15, 'Kerem', 'Kayaarslan', 'Forvet');

-- Başakşehir / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(16, 'Muhammed', 'Şengezer', 'Kaleci'),
(16, 'Doğan', 'Alemdar', 'Kaleci'),
(16, 'Volkan', 'Babacan', 'Kaleci'),
(16, 'Luca', 'Stancic', 'Kaleci');

-- Başakşehir / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(16, 'Jerome', 'Opoku', 'Defans'),
(16, 'Léo', 'Duarte', 'Defans'),
(16, 'Hamza', 'Gürler', 'Defans'),
(16, 'Ousseynou', 'Ba', 'Defans'),
(16, 'Christopher', 'Operi', 'Defans'),
(16, 'Festy', 'Ebosele', 'Defans'),
(16, 'Onur', 'Bulut', 'Defans');

-- Başakşehir / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(16, 'Berat', 'Özdemir', 'Orta Saha'),
(16, 'Jakub', 'Kaluzinski', 'Orta Saha'),
(16, 'Onur', 'Ergin', 'Orta Saha'),
(16, 'Miguel', 'Crespo', 'Orta Saha'),
(16, 'Oliver', 'Kemen', 'Orta Saha'),
(16, 'Umut', 'Güneş', 'Orta Saha'),
(16, 'Ömer Ali', 'Şahiner', 'Orta Saha'),
(16, 'Abbosbek', 'Fayzullaev', 'Orta Saha'),
(16, 'Amine', 'Harit', 'Orta Saha'),
(16, 'Ömer', 'Beyaz', 'Orta Saha');

-- Başakşehir / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(16, 'Ivan', 'Brnic', 'Forvet'),
(16, 'Berkay', 'Aslan', 'Forvet'),
(16, 'Yusuf', 'Sarı', 'Forvet'),
(16, 'Deniz', 'Türüç', 'Forvet'),
(16, 'Eldor', 'Shomurodov', 'Forvet'),
(16, 'Davie', 'Selke', 'Forvet'),
(16, 'Bertuğ', 'Yıldırım', 'Forvet'),
(16, 'Nuno Da', 'Costa', 'Forvet'),
(16, 'Tuğra', 'Turhan', 'Forvet');

-- Göztepe / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(17, 'Mateusz', 'Lis', 'Kaleci'),
(17, 'Ekrem', 'Kılıçarslan', 'Kaleci');

-- Göztepe / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(17, 'Taha', 'Altıkardeş', 'Defans'),
(17, 'Malcom', 'Bokele', 'Defans'),
(17, 'Furkan', 'Bayır', 'Defans'),
(17, 'Héitor', '', 'Defans'),
(17, 'Allan', 'Godói', 'Defans'),
(17, 'Ege', 'Yıldırım', 'Defans');

-- Göztepe / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(17, 'Anthony', 'Dennis', 'Orta Saha'),
(17, 'Novatus', 'Miroshi', 'Orta Saha'),
(17, 'Rhaldney', '', 'Orta Saha'),
(17, 'Ahmed', 'Ildiz', 'Orta Saha'),
(17, 'Amin', 'Cherni', 'Orta Saha'),
(17, 'İsmail', 'Köybaşı', 'Orta Saha'),
(17, 'Efkan', 'Bekiroğlu', 'Orta Saha'),
(17, 'Junior', 'Olaitan', 'Orta Saha');

-- Göztepe / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(17, 'Uğur Kaan', 'Yıldız', 'Forvet'),
(17, 'Oğün', 'Bayrak', 'Forvet'),
(17, 'Ruan', '', 'Forvet'),
(17, 'Arda Okan', 'Kurtulan', 'Forvet'),
(17, 'Juan', '', 'Forvet'),
(17, 'Janderson', '', 'Forvet'),
(17, 'İbrahim', 'Sabra', 'Forvet'),
(17, 'Tibet', 'Durakçay', 'Forvet');

-- Gaziantep FK / Kaleci
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(18, 'Burak', 'Bozan', 'Kaleci'),
(18, 'Zafer', 'Görgen', 'Kaleci');

-- Gaziantep FK / Defans
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(18, 'Tayyip Talha', 'Sanuç', 'Defans'),
(18, 'Semih', 'Güler', 'Defans'),
(18, 'Arda', 'Kızıldağ', 'Defans'),
(18, 'Myenty', 'Abena', 'Defans'),
(18, 'Kévin', 'Rodrigues', 'Defans'),
(18, 'Rob', 'Nizet', 'Defans'),
(18, 'Luis', 'Pérez', 'Defans'),
(18, 'Salem', 'M’Bakata', 'Defans'),
(18, 'Nazım', 'Sangaré', 'Defans');

-- Gaziantep FK / Orta Saha
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(18, 'Melih', 'Kabasakal', 'Orta Saha'),
(18, 'Oğün', 'Özyiğit', 'Orta Saha'),
(18, 'Badou', 'Ndiaye', 'Orta Saha'),
(18, 'Juninho', 'Bacuna', 'Orta Saha'),
(18, 'Drissa', 'Camara', 'Orta Saha'),
(18, 'Kacper', 'Kozlowski', 'Orta Saha'),
(18, 'Alexandru', 'Maxim', 'Orta Saha'),
(18, 'Taha', 'Güneş', 'Orta Saha');

-- Gaziantep FK / Forvet
INSERT IGNORE INTO players (team_id, first_name, last_name, position) VALUES
(18, 'Yusuf', 'Kabadayı', 'Forvet'),
(18, 'Christopher', 'Lungoyi', 'Forvet'),
(18, 'Mehmet', 'Kuzucu', 'Forvet'),
(18, 'Ali Osman', 'Kalın', 'Forvet'),
(18, 'Deian', 'Sorescu', 'Forvet'),
(18, 'Enver', 'Kulašin', 'Forvet'),
(18, 'Ali Mewran', 'Ablak', 'Forvet'),
(18, 'Mohamed', 'Bayo', 'Forvet'),
(18, 'Emmanuel', 'Boateng', 'Forvet'),
(18, 'Kuzey Ege', 'Bulgulu', 'Forvet');


-- Scoring System table
CREATE TABLE IF NOT EXISTS scoring_system (
    id INT AUTO_INCREMENT PRIMARY KEY,
    stat_name VARCHAR(50) NOT NULL UNIQUE,
    stat_display_name VARCHAR(100) NOT NULL,
    points_per_stat DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    is_goalkeeper_only BOOLEAN DEFAULT FALSE,
    is_outfield_only BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Add team player limit column to scoring_system table
ALTER TABLE scoring_system ADD COLUMN IF NOT EXISTS team_player_limit INT DEFAULT 3;

-- Insert default scoring values
INSERT IGNORE INTO scoring_system (stat_name, stat_display_name, points_per_stat, is_goalkeeper_only, is_outfield_only) VALUES 
('minutes_played', 'Dakika', 0.01, FALSE, FALSE),
('goals', 'Gol', 2.00, FALSE, FALSE),
('assists', 'Asist', 1.50, FALSE, FALSE),
('yellow_cards', 'Sarı Kart', -1.00, FALSE, FALSE),
('red_cards', 'Kırmızı Kart', -3.00, FALSE, FALSE),
('own_goals', 'Kendi Kalesine Gol', -2.00, FALSE, FALSE),
('penalties_won', 'Penaltı Kazanma', 1.00, FALSE, FALSE),
('penalties_missed', 'Penaltı Kaçırma', -2.00, FALSE, FALSE),
('penalties_conceded', 'Penaltıya Sebep Olma', -1.00, FALSE, FALSE),
('saves', 'Kurtarış', 0.50, TRUE, FALSE),
('penalties_saved', 'Kurtarılan Penaltı (Kaleci)', 2.00, TRUE, FALSE),
('penalties_saved_outfield', 'Kurtarılan Penaltı (Saha Oyuncusu)', 3.00, FALSE, TRUE);

-- Weekly Scores table (for storing calculated scores)
CREATE TABLE IF NOT EXISTS weekly_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_team_id INT NOT NULL,
    matchweek_id INT NOT NULL,
    total_points DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_team_id) REFERENCES user_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (matchweek_id) REFERENCES matchweeks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_team_matchweek (user_team_id, matchweek_id)
);

-- Player Weekly Scores table (for storing individual player scores)
CREATE TABLE IF NOT EXISTS player_weekly_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_team_id INT NOT NULL,
    player_id INT NOT NULL,
    matchweek_id INT NOT NULL,
    total_points DECIMAL(8,2) NOT NULL DEFAULT 0.00,
    calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_team_id) REFERENCES user_teams(id) ON DELETE CASCADE,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (matchweek_id) REFERENCES matchweeks(id) ON DELETE CASCADE,
    UNIQUE KEY unique_player_team_matchweek (user_team_id, player_id, matchweek_id)
);