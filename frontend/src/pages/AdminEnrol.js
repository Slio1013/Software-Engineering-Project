import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminEnrol() {
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [attendance, setAttendance] = useState(75);
  const [roster, setRoster] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/admin/courses').then(r => setCourses(r.data));
    api.get('/admin/students').then(r => setStudents(r.data));
  }, []);

  const loadRoster = async courseId => {
    if (!courseId) { setRoster(null); return; }
    const r = await api.get(`/admin/courses/${courseId}/students`);
    setRoster(r.data);
  };

  const handleCourseChange = e => {
    setSelectedCourse(e.target.value);
    loadRoster(e.target.value);
    setMsg(''); setError('');
  };

  const handleEnroll = async () => {
    if (!selectedStudent || !selectedCourse) { setError('Please select both a student and a course.'); return; }
    setError(''); setMsg('');
    try {
      await api.post('/admin/enroll', { studentId: selectedStudent, courseId: selectedCourse, attendancePercentage: Number(attendance) });
      setMsg('Student enrolled successfully.');
      setSelectedStudent('');
      loadRoster(selectedCourse);
    } catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  const handleUnenroll = async studentId => {
    if (!window.confirm('Remove this student from the course?')) return;
    setError(''); setMsg('');
    try {
      await api.post('/admin/unenroll', { studentId, courseId: selectedCourse });
      setMsg('Student removed.');
      loadRoster(selectedCourse);
    } catch (err) { setError(err.response?.data?.message || 'Error.'); }
  };

  const enrolledIds = new Set((roster?.students || []).map(s => s._id));
  const unenrolledStudents = students.filter(s => !enrolledIds.has(s._id));

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Student Enrolment</h1>
        {msg && <div className="alert success">{msg}</div>}
        {error && <div className="alert error">{error}</div>}

        <div className="card mb-2">
          <h3 className="mb-2">Select Course</h3>
          <div className="form-group">
            <select value={selectedCourse} onChange={handleCourseChange}>
              <option value="">Choose a course...</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.courseId})</option>)}
            </select>
          </div>
        </div>

        {selectedCourse && (
          <>
            {/* Submission stats */}
            {roster && (
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card">
                  <div className="stat-label">Enrolled students</div>
                  <div className="stat-value">{roster.totalEnrolled}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Submitted feedback</div>
                  <div className="stat-value" style={{ color: 'var(--green)' }}>{roster.submittedCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending submission</div>
                  <div className="stat-value" style={{ color: 'var(--amber)' }}>{roster.totalEnrolled - roster.submittedCount}</div>
                </div>
              </div>
            )}

            {/* Enroll new student */}
            <div className="card mb-2">
              <h3 className="mb-2">Enroll a Student</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px auto', gap: '1rem', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Student</label>
                  <select value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)}>
                    <option value="">Select student...</option>
                    {unenrolledStudents.map(s => (
                      <option key={s._id} value={s._id}>{s.name} ({s.studentId}){s.section ? ` · ${s.section}` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Attendance %</label>
                  <input type="number" min={0} max={100} value={attendance} onChange={e => setAttendance(e.target.value)} />
                </div>
                <button className="btn primary" style={{ marginBottom: 1 }} onClick={handleEnroll}>Enroll</button>
              </div>
            </div>

            {/* Current roster */}
            {roster && (
              <div className="card">
                <h3 className="mb-2">Current Roster</h3>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Student ID</th><th>Name</th><th>Section</th><th>Attendance</th><th>Feedback</th><th></th></tr>
                    </thead>
                    <tbody>
                      {roster.students.map(s => (
                        <tr key={s._id}>
                          <td><code style={{ fontSize: 12 }}>{s.studentId}</code></td>
                          <td>{s.name}</td>
                          <td>{s.section ? <span className="badge blue">{s.section}</span> : '—'}</td>
                          <td>
                            <span className={`badge ${s.attendance >= 75 ? 'green' : 'red'}`}>
                              {s.attendance !== null ? `${s.attendance}%` : 'N/A'}
                            </span>
                          </td>
                          <td>
                            {s.submitted
                              ? <span className="badge green">Submitted</span>
                              : <span className="badge amber">Pending</span>}
                          </td>
                          <td>
                            <button className="btn danger btn-sm" onClick={() => handleUnenroll(s._id)}>Remove</button>
                          </td>
                        </tr>
                      ))}
                      {roster.students.length === 0 && (
                        <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text2)' }}>No students enrolled yet.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
