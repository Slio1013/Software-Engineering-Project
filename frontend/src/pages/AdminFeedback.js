import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminFeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/admin/feedback').then(r => {
      if (!cancelled) { setFeedbacks(r.data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const avg = arr => arr?.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '—';

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Feedback Monitoring</h1>
        <p className="text-muted mb-2">All responses are anonymous. Student identities are not stored.</p>

        {loading && <p className="text-muted">Loading...</p>}

        <div className="card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Professor</th>
                  <th>Teaching avg</th>
                  <th>Engagement avg</th>
                  <th>Assessment avg</th>
                  <th>Overall avg</th>
                  <th>CO covered</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {feedbacks.map(f => {
                  const covered = f.courseOutcomes?.allCoveredAsExpected
                    ? 'All'
                    : (f.courseOutcomes?.moduleCoverage || []).filter(m => m.metExpectations).length + '/' + (f.courseOutcomes?.moduleCoverage || []).length;
                  return (
                    <tr key={f._id}>
                      <td>{f.course?.name || '—'}</td>
                      <td>{f.professor?.name || '—'}</td>
                      <td>{avg(f.ratings?.teachingEffectiveness)}</td>
                      <td>{avg(f.ratings?.engagementCommunication)}</td>
                      <td>{avg(f.ratings?.assessmentFeedback)}</td>
                      <td>{avg(f.ratings?.overallExperience)}</td>
                      <td>{covered}</td>
                      <td style={{ fontSize: 12, color: 'var(--gray-600)' }}>
                        {new Date(f.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!loading && feedbacks.length === 0 && (
              <p className="text-muted" style={{ padding: '1rem' }}>No feedback submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
