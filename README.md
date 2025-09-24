# 🏆 Turquoise Fantasy Football

A comprehensive Fantasy Football management platform developed using modern web technologies. A full-featured application that allows users to create teams, manage players, and track match weeks.

## ✨ Features

### 👥 User Management
- 🔐 Secure user registration and login system
- 🛡️ JWT token-based authentication
- 🔒 Password hashing with Bcrypt
- 👑 User management with the admin panel

### ⚽ Team and Player Management
- 🏟️ Team creation and editing
- 👤 Add, edit, and delete players
- 📊 Position-based player categories (Goalkeeper, Defender, Midfielder, Forward)
- 🎯 Team builder interface

### 🗓️ Match and Week Management
- 📅 Match week creation and management
- ⚽ Match scheduling and results entry
- 🏆 Scoring system
- 📈 Statistics tracking

### 🎨 Modern Interface
- 📱 Responsive design
- 🎯 User-friendly interface
- ⚡ Fast and smooth experience
- 🔔 Real-time notifications

## 🛠️ Technologies

### Backend
- **Node.js** - Server-side JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Relational database
- **JWT** - Token-based authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - User interface library
- **React Router** - Page routing
- **Axios** - HTTP requests
- **CSS3** - Modern style design

## 🚀 Installation

### Requirements
- Node.js (v14 or later)
- MySQL (included with XAMPP)
- npm or yarn

### 1. Database Installation
1. Start XAMPP and start the MySQL service Run
2. Go to phpMyAdmin (http://localhost/phpmyadmin)
3. Create the database by running `backend/database.sql`.

### 2. Backend Installation
```bash
cd backend
npm install
npm start
```
The backend will run at http://localhost:5000.

### 3. Frontend Installation
```bash
cd frontend
npm install
npm start
```
The frontend will run at http://localhost:3000.

## 📖 Usage

1. After launching the application, go to http://localhost:3000
2. Create a new account by clicking the "Sign Up" link
3. Log in with the information you created
4. If you are an admin, the administration panel will appear, and if you are a user, the dashboard will appear.

## 📁 Project Structure

```
TurquoiseFantasyFootball/
├── backend/
│ ├── config.js # Database configuration
│ ├── database.sql # Database schema
│ ├── db.js # Database connection
│ ├── server.js # Main server file
│ └── package.json # Backend dependencies
├── frontend/
│ ├── public/
│ │ └── index.html # Main HTML file
│ ├── src/
│ │ ├── components/ # React components
│ │ │ ├── AdminPanel.js
│ │ │ ├── Dashboard.js
│ │ │ ├── Login.js
│ │ │ ├── Signup.js
│ │ │ ├── TeamManagement.js
│ │ │ ├── PlayerManagement.js
│ │ │ ├── MatchManagement.js
│ │ │ │ └── ...
│ │ ├── contexts/
│ │ │ └── AuthContext.js
│ │ ├── App.js # Main application component
│ │ └── index.js # Application entry point
│ └── package.json # Frontend dependencies
└── README.md
```

## 🎯 Feature Details

### Admin Panel
- User management
- Add/edit teams and players
- Create match week schedules
- Match results entry
- Scoring system management

### User Dashboard
- Team creation
- Player selection
- View match results
- Track points

### Project Usage
- You can manage live match results and statistics completely manually.
- If you plan to use any API for live match results and statistics, you can integrate it.
- You can manually enter fixtures and allow users to create their fantasy teams.
- After matches are completed, you can manually enter each player's statistics and calculate points at the end of the week.
- Users' team points are calculated, and you can enjoy your own fantasy league with your friends.
- With the points system, you can change the points assigned to each statistic and design your own league.
