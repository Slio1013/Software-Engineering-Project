import React, { useEffect, useState } from 'react';
import api from '../api';

const SECTIONS = ['CSE', 'AI', 'ECE', 'EEE', 'MECH', 'CIVIL', 'MBA', 'Other'];
const empty = { studentId: '', name: '', email: '', password: '', section: '' };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => { api.get('/admin/students').then(r => setStudents(r.data)); };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      if (editing) {
        await api.put(`/admin/students/${editing}`, form);
        setMsg('Student updated.');
      } else {
        await api.post('/admin/students', form);
        setMsg('Student account created.');
      }
      setForm({ ...empty }); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  const handleEdit = s => {
    setEditing(s._id);
    setForm({ studentId: s.studentId, name: s.name, email: s.email, password: '', section: s.section || '' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this student?')) return;
    try { await api.delete(`/admin/students/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Manage Students</h1>
        {msg && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">{editing ? 'Edit Student' : 'Add Student'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Student ID</label>
                <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required placeholder="SE23UCSE001" disabled={!!editing} />
              </div>
              <div className="form-group">
                <label>Full Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="Full Name" />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required placeholder="student@university.edu" />
              </div>
              <div className="form-group">
                <label>{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} placeholder="••••••••" />
              </div>
            </div>
            <div className="form-group">
              <label>Section / Branch</label>
              <select value={form.section} onChange={e => setForm({ ...form, section: e.target.value })}>
                <option value="">Select section...</option>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn primary">{editing ? 'Update student' : 'Create account'}</button>
              {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm({ ...empty }); setError(''); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Student ID</th><th>Name</th><th>Email</th><th>Section</th><th>Courses</th><th></th></tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s._id}>
                    <td><code style={{ fontSize: 12 }}>{s.studentId}</code></td>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>{s.section ? <span className="badge blue">{s.section}</span> : <span className="text-muted">—</span>}</td>
                    <td><span className="badge gray">{s.enrolledCourses?.length || 0}</span></td>
                    <td>
                      <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => handleEdit(s)}>Edit</button>
                      <button className="btn danger btn-sm" onClick={() => handleDelete(s._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {students.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)' }}>No students yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
