import React, { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { courseId: '', name: '', professorId: '' };
const emptyModule = { moduleId: '', name: '', description: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modules, setModules] = useState([{ ...emptyModule }]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    api.get('/admin/courses').then(r => setCourses(r.data));
    api.get('/admin/professors').then(r => setProfessors(r.data));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setMsg('');
    const payload = { courseId: form.courseId, name: form.name, professor: form.professorId, modules };
    try {
      if (editing) {
        await api.put(`/admin/courses/${editing}`, payload);
        setMsg('Course updated.');
      } else {
        await api.post('/admin/courses', payload);
        setMsg('Course created.');
      }
      setForm(emptyForm); setModules([{ ...emptyModule }]); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = c => {
    setEditing(c._id);
    setForm({ courseId: c.courseId, name: c.name, professorId: c.professor?._id || '' });
    setModules(c.modules?.length ? c.modules : [{ ...emptyModule }]);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    await api.delete(`/admin/courses/${id}`); load();
  };

  const setModule = (i, field, val) => {
    setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Manage Courses</h1>

        {msg && <div className="alert success mb-2">{msg}</div>}
        {error && <div className="alert error mb-2">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">{editing ? 'Edit Course' : 'Add Course'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Course ID</label>
                <input value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required placeholder="e.g. CS301" />
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Software Engineering" />
              </div>
            </div>
            <div className="form-group">
              <label>Assign Professor</label>
              <select value={form.professorId} onChange={e => setForm({ ...form, professorId: e.target.value })} required>
                <option value="">Select professor...</option>
                {professors.map(p => <option key={p._id} value={p._id}>{p.name} ({p.studentId})</option>)}
              </select>
            </div>

            <div className="divider" />
            <h3 className="mb-2">Modules</h3>
            {modules.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'start' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>ID</label>
                  <input value={m.moduleId} onChange={e => setModule(i, 'moduleId', e.target.value)} placeholder="m1" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Name</label>
                  <input value={m.name} onChange={e => setModule(i, 'name', e.target.value)} placeholder="Module 1" required />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: 11 }}>Description</label>
                  <input value={m.description} onChange={e => setModule(i, 'description', e.target.value)} placeholder="Optional" />
                </div>
                <button type="button" className="btn danger btn-sm" style={{ marginTop: 20 }} onClick={() => setModules(prev => prev.filter((_, idx) => idx !== i))}>✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm mb-2" onClick={() => setModules(prev => [...prev, { ...emptyModule }])}>+ Add module</button>

            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn primary">Save course</button>
              {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(emptyForm); setModules([{ ...emptyModule }]); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Professor</th><th>Modules</th><th></th></tr></thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td>{c.courseId}</td>
                    <td>{c.name}</td>
                    <td>{c.professor?.name || '—'}</td>
                    <td>{c.modules?.length || 0}</td>
                    <td>
                      <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
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
