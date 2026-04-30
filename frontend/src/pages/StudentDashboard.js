import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/courses/my').then(r => {
      if (!cancelled) { setCourses(r.data); setLoading(false); }
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <div className="container">
        <div className="flex-between mb-2">
          <div>
            <h1>My Courses</h1>
            <p className="text-muted">Select a course to submit feedback</p>
          </div>
          <span className="badge green">{user.studentId}</span>
        </div>

        {loading && <p className="text-muted">Loading courses...</p>}

        {!loading && courses.length === 0 && (
          <div className="alert info">You are not enrolled in any courses yet.</div>
        )}

        {courses.map(c => (
          <div key={c._id} className="card mt-2">
            <div className="flex-between">
              <div>
                <h3>{c.name}</h3>
                <p className="text-muted mt-1">
                  {c.courseId} &nbsp;·&nbsp; Prof. {c.professor?.name}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                {c.attendancePercentage !== null ? (
                  <span className={`badge ${c.eligible ? 'green' : 'red'}`}>
                    {c.attendancePercentage}% attendance
                  </span>
                ) : (
                  <span className="badge gray">No attendance data</span>
                )}
              </div>
            </div>

            <div className="divider" />

            <div className="flex-between">
              <span>
                {c.submitted
                  ? <span className="badge green">Feedback submitted</span>
                  : c.eligible
                  ? <span className="badge amber">Pending feedback</span>
                  : <span className="badge red">Not eligible (need ≥75%)</span>}
              </span>
              <button
                className="btn primary btn-sm"
                disabled={!c.eligible || c.submitted}
                onClick={() => navigate(`/feedback/${c._id}`)}
              >
                {c.submitted ? 'Submitted' : 'Give feedback'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
