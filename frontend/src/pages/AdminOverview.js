import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminOverview() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.get('/admin/stats').then(r => { if (!cancelled) setStats(r.data); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Admin Overview</h1>
        {stats && (
          <div className="stat-grid">
            <div className="stat-card"><div className="stat-label">Total feedback</div><div className="stat-value">{stats.totalFeedback}</div></div>
            <div className="stat-card"><div className="stat-label">Courses</div><div className="stat-value">{stats.totalCourses}</div></div>
            <div className="stat-card"><div className="stat-label">Students</div><div className="stat-value">{stats.totalStudents}</div></div>
            <div className="stat-card"><div className="stat-label">Professors</div><div className="stat-value">{stats.totalProfessors}</div></div>
          </div>
        )}
        <div className="alert info">Use the navigation links above to manage courses, professors, and view feedback reports.</div>
      </div>
    </div>
  );
}
