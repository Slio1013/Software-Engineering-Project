import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import logo from '../mahindra-logo.png';

export default function Login() {
  const { login, darkMode } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ studentId: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, { name: data.name, role: data.role, studentId: data.studentId });
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'professor') navigate('/professor');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <img
            src={logo}
            alt="Mahindra University"
            style={{
              height: 56,
              width: 'auto',
              objectFit: 'contain',
              marginBottom: 12,
              
            }}
          />
          <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 4 }}>
            Course Outcome Feedback System
          </p>
        </div>

        <div className="card">
          <h2 className="mb-2">Sign in</h2>
          {error && <div className="alert error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Student / Staff ID</label>
              <input
                value={form.studentId}
                onChange={e => setForm({ ...form, studentId: e.target.value })}
                placeholder="e.g. SE23UCSE200"
                required
                autoComplete="username"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>
            <button className="btn primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text3)', marginTop: 16 }}>
          © {new Date().getFullYear()} Mahindra University. All rights reserved.
        </p>
      </div>
    </div>
  );
}
