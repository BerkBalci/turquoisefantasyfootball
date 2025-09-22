import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const Login = ({ onSwitchToSignup }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    emailOrNickname: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/login', formData);
      
      // Use AuthContext to handle login
      login(response.data.user, response.data.token);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-title">Giriş Yap</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="emailOrNickname">E-posta veya Kullanıcı Adı</label>
          <input
            type="text"
            id="emailOrNickname"
            name="emailOrNickname"
            value={formData.emailOrNickname}
            onChange={handleChange}
            required
            placeholder="ornek@email.com veya kullanici_adi"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Şifre</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Şifrenizi girin"
          />
        </div>
        
        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
        </button>
      </form>
      
      <div className="link-text">
        Üye değil misiniz? <a href="#" onClick={onSwitchToSignup}>Kayıt olun</a>
      </div>
    </div>
  );
};

export default Login;
