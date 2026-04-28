import React, { useEffect, useState, useRef } from 'react';
import api from '../api';

const empty = { studentId: '', name: '', email: '', password: '', photo: '' };

export default function AdminProfessors() {
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState({ ...empty });
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const photoRef = useRef();

  const load = () => { api.get('/admin/professors').then(r => setProfessors(r.data)); };
  useEffect(() => { load(); }, []);

  const handlePhoto = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setForm(f => ({ ...f, photo: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setMsg('');
    try {
      if (editing) {
        await api.put(`/admin/professors/${editing}`, form);
        setMsg('Professor updated.');
      } else {
        await api.post('/admin/professors', form);
        setMsg('Professor account created.');
      }
      setForm({ ...empty }); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  const handleEdit = p => {
    setEditing(p._id);
    setForm({ studentId: p.studentId, name: p.name, email: p.email, password: '', photo: p.photo || '' });
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this professor?')) return;
    try { await api.delete(`/admin/professors/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Manage Professors</h1>
        {msg && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">{editing ? 'Edit Professor' : 'Add Professor'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Staff ID</label>
                <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required placeholder="PROF001" disabled={!!editing} />
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
                <label>{editing ? 'New Password (leave blank to keep)' : 'Password'}</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required={!editing} placeholder="••••••••" />
              </div>
            </div>

            <div className="form-group">
              <label>Profile Photo</label>
              <div className="flex gap-2" style={{ alignItems: 'center' }}>
                {form.photo
                  ? <img src={form.photo} alt="preview" className="prof-avatar" />
                  : <div className="prof-avatar-placeholder">{form.name?.[0] || '?'}</div>}
                <button type="button" className="btn btn-sm" onClick={() => photoRef.current.click()}>
                  {form.photo ? 'Change photo' : 'Upload photo'}
                </button>
                {form.photo && <button type="button" className="btn btn-sm danger" onClick={() => setForm(f => ({ ...f, photo: '' }))}>Remove</button>}
                <input ref={photoRef} type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn primary">{editing ? 'Update professor' : 'Create account'}</button>
              {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm({ ...empty }); setError(''); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Photo</th><th>Staff ID</th><th>Name</th><th>Email</th><th></th></tr></thead>
              <tbody>
                {professors.map(p => (
                  <tr key={p._id}>
                    <td>
                      {p.photo
                        ? <img src={p.photo} alt={p.name} className="prof-avatar" />
                        : <div className="prof-avatar-placeholder">{p.name?.[0]}</div>}
                    </td>
                    <td>{p.studentId}</td>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>
                      <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => handleEdit(p)}>Edit</button>
                      <button className="btn danger btn-sm" onClick={() => handleDelete(p._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {professors.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text2)' }}>No professors yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
