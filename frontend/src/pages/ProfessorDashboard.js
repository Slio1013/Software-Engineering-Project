import React, { useEffect, useState } from 'react';
import api from '../api';

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api.get('/professor/courses').then(r => {
      if (!cancelled) { setCourses(r.data); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, []);

  const loadReport = async (course) => {
    setSelected(course);
    setReport(null);
    const r = await api.get(`/professor/feedback/${course._id}`);
    setReport(r.data);
  };

  const groupLabels = {
    teachingEffectiveness: ['Explains clearly', 'Well-structured', 'Subject knowledge', 'Real-world examples', 'Appropriate pace'],
    engagementCommunication: ['Encourages participation', 'Addresses doubts', 'Approachable outside class'],
    assessmentFeedback: ['Reflects teaching', 'Helpful feedback', 'Fair grading', 'Timely evaluation'],
    overallExperience: ['Satisfaction', 'Would recommend', 'Overall rating']
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Feedback Reports</h1>

        {loading && <p className="text-muted">Loading...</p>}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '220px 1fr' : '1fr', gap: '1.5rem' }}>
          {/* Course list */}
          <div>
            {courses.map(c => (
              <div
                key={c._id}
                className="card"
                style={{ cursor: 'pointer', borderColor: selected?._id === c._id ? 'var(--green)' : '', marginBottom: 8 }}
                onClick={() => loadReport(c)}
              >
                <h3>{c.name}</h3>
                <p className="text-muted" style={{ fontSize: 12 }}>{c.courseId}</p>
              </div>
            ))}
          </div>

          {/* Report panel */}
          {selected && (
            <div>
              {!report && <p className="text-muted">Loading report...</p>}
              {report && report.count === 0 && (
                <div className="alert info">No feedback submitted for this course yet.</div>
              )}
              {report && report.count > 0 && (
                <>
                  <div className="stat-grid">
                    <div className="stat-card">
                      <div className="stat-label">Total responses</div>
                      <div className="stat-value">{report.count}</div>
                    </div>
                    {report.averages?.overallExperience?.[2] && (
                      <div className="stat-card">
                        <div className="stat-label">Avg overall rating</div>
                        <div className="stat-value">{report.averages.overallExperience[2].toFixed(1)}</div>
                      </div>
                    )}
                  </div>

                  {Object.entries(groupLabels).map(([group, labels]) => (
                    <div key={group} className="card mt-2">
                      <h3 className="mb-2" style={{ textTransform: 'capitalize' }}>
                        {group.replace(/([A-Z])/g, ' $1')}
                      </h3>
                      {labels.map((label, i) => {
                        const avg = report.averages?.[group]?.[i] || 0;
                        return (
                          <div key={i} style={{ marginBottom: 10 }}>
                            <div className="flex-between mb-1">
                              <span style={{ fontSize: 13 }}>{label}</span>
                              <span style={{ fontSize: 13, fontWeight: 500 }}>{avg.toFixed(1)} / 5</span>
                            </div>
                            <div style={{ height: 6, background: 'var(--gray-200)', borderRadius: 3 }}>
                              <div style={{ height: 6, borderRadius: 3, background: 'var(--green)', width: `${(avg / 5) * 100}%`, transition: 'width 0.4s' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}

                  {/* CO Summary */}
                  {report.coSummary?.length > 0 && (
                    <div className="card mt-2">
                      <h3 className="mb-2">Course outcome coverage</h3>
                      {report.coSummary.map(m => (
                        <div key={m.moduleId} style={{ marginBottom: 12 }}>
                          <div className="flex-between">
                            <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                            <span>
                              <span className="badge green">{m.met} met</span>{' '}
                              <span className="badge red">{m.notMet} not met</span>
                            </span>
                          </div>
                          {m.grievances?.length > 0 && (
                            <details style={{ marginTop: 6 }}>
                              <summary style={{ fontSize: 12, color: 'var(--gray-600)', cursor: 'pointer' }}>
                                View {m.grievances.length} student concern{m.grievances.length > 1 ? 's' : ''}
                              </summary>
                              <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                                {m.grievances.map((g, i) => <li key={i} style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 4 }}>{g}</li>)}
                              </ul>
                            </details>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Comments */}
                  {report.comments?.length > 0 && (
                    <div className="card mt-2">
                      <h3 className="mb-2">Student comments</h3>
                      {report.comments.map((c, i) => (
                        <div key={i} style={{ padding: '8px 12px', background: 'var(--gray-100)', borderRadius: 6, marginBottom: 8, fontSize: 13 }}>
                          {c}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
