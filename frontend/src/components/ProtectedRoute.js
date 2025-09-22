import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from './Login';
import Signup from './Signup';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return children;
};

export default ProtectedRoute;
