import React, { useEffect, useState } from 'react';
import api from '../api';

const emptyForm = { courseId: '', name: '', professorId: '' };
const emptyModule = { moduleId: '', name: '', description: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [modules, setModules] = useState([emptyModule, emptyModule, emptyModule].map(m => ({ ...m })));
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
    if (modules.length < 3) { setError('You must add at least 3 modules.'); return; }
    const payload = { courseId: form.courseId, name: form.name, professor: form.professorId, modules };
    try {
      if (editing) { await api.put(`/admin/courses/${editing}`, payload); setMsg('Course updated.'); }
      else { await api.post('/admin/courses', payload); setMsg('Course created.'); }
      setForm(emptyForm); setModules([{...emptyModule},{...emptyModule},{...emptyModule}]); setEditing(null); load();
    } catch (err) { setError(err.response?.data?.message || 'Error saving course.'); }
  };

  const handleEdit = c => {
    setEditing(c._id);
    setForm({ courseId: c.courseId, name: c.name, professorId: c.professor?._id || '' });
    setModules(c.modules?.length ? c.modules.map(m => ({ ...m })) : [{...emptyModule},{...emptyModule},{...emptyModule}]);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this course?')) return;
    try { await api.delete(`/admin/courses/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || 'Error deleting course.'); }
  };

  const setModule = (i, field, val) => setModules(prev => prev.map((m, idx) => idx === i ? { ...m, [field]: val } : m));
  const addModule = () => setModules(prev => [...prev, { ...emptyModule }]);
  const removeModule = i => { if (modules.length <= 3) { setError('Minimum 3 modules required.'); return; } setModules(prev => prev.filter((_, idx) => idx !== i)); };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Manage Courses</h1>
        {msg && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">{editing ? 'Edit Course' : 'Add Course'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label>Course ID</label>
                <input value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required placeholder="e.g. CS301" disabled={!!editing} />
              </div>
              <div className="form-group">
                <label>Course Name</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Software Engineering" />
              </div>
            </div>
            <div className="form-group">
              <label>Assign Professor (a professor can teach multiple courses)</label>
              <select value={form.professorId} onChange={e => setForm({ ...form, professorId: e.target.value })} required>
                <option value="">Select professor...</option>
                {professors.map(p => (
                  <option key={p._id} value={p._id}>
                    {p.name} ({p.studentId})
                  </option>
                ))}
              </select>
            </div>

            <div className="divider" />
            <div className="flex-between mb-2">
              <h3>Modules <span className="badge amber" style={{ marginLeft: 6 }}>minimum 3 required</span></h3>
              <span className="text-muted">{modules.length} module{modules.length !== 1 ? 's' : ''}</span>
            </div>

            {modules.map((m, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '90px 1fr 1fr auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
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
                <button type="button" className="btn danger btn-sm" onClick={() => removeModule(i)} title="Remove module">✕</button>
              </div>
            ))}
            <button type="button" className="btn btn-sm mb-2" onClick={addModule}>+ Add module</button>

            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn primary">Save course</button>
              {editing && <button type="button" className="btn" onClick={() => { setEditing(null); setForm(emptyForm); setModules([{...emptyModule},{...emptyModule},{...emptyModule}]); setError(''); }}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>ID</th><th>Name</th><th>Professor</th><th>Modules</th><th>Enrolled</th><th></th></tr>
              </thead>
              <tbody>
                {courses.map(c => (
                  <tr key={c._id}>
                    <td><code style={{ fontSize: 12 }}>{c.courseId}</code></td>
                    <td>{c.name}</td>
                    <td>
                      <div className="flex gap-2">
                        {c.professor?.photo
                          ? <img src={c.professor.photo} alt="" className="prof-avatar" style={{ width: 28, height: 28 }} />
                          : <div className="prof-avatar-placeholder" style={{ width: 28, height: 28, fontSize: 13 }}>{c.professor?.name?.[0] || '?'}</div>}
                        {c.professor?.name || '—'}
                      </div>
                    </td>
                    <td><span className="badge gray">{c.modules?.length || 0}</span></td>
                    <td><span className="badge blue">{c.enrolledStudents?.length || 0}</span></td>
                    <td>
                      <button className="btn btn-sm" style={{ marginRight: 6 }} onClick={() => handleEdit(c)}>Edit</button>
                      <button className="btn danger btn-sm" onClick={() => handleDelete(c._id)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {courses.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)' }}>No courses yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
