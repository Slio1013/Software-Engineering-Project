import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminProfessors() {
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState({ studentId: '', name: '', email: '', password: '' });
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => { api.get('/admin/professors').then(r => setProfessors(r.data)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      await api.post('/admin/professors', form);
      setMsg('Professor account created.');
      setForm({ studentId: '', name: '', email: '', password: '' });
      load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Manage Professors</h1>
        {msg && <div className="alert success mb-2">{msg}</div>}
        {error && <div className="alert error mb-2">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">Add Professor</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Staff ID</label>
                <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required placeholder="PROF001" />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Dr. John Smith" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="professor@university.edu" />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required placeholder="Initial password" />
              </div>
            </div>
            <button type="submit" className="btn primary mt-1">Create account</button>
          </form>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Staff ID</th><th>Name</th><th>Email</th></tr></thead>
              <tbody>
                {professors.map(p => (
                  <tr key={p._id}>
                    <td>{p.studentId}</td>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
