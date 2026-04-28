import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
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
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-box">
        <div className="auth-logo">
          <h1>Professor Feedback</h1>
          <p>Mahindra University — Course Outcome System</p>
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
              />
            </div>
            <button className="btn primary w-full mt-2" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
