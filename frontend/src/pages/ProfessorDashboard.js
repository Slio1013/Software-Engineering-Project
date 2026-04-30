import React, { useEffect, useState } from 'react';
import api from '../api';

const GROUP_LABELS = {
  teachingEffectiveness: ['Explains clearly', 'Well-structured lectures', 'Subject knowledge', 'Real-world examples', 'Appropriate pace'],
  engagementCommunication: ['Encourages participation', 'Addresses doubts', 'Approachable outside class'],
  assessmentFeedback: ['Reflects teaching', 'Helpful feedback', 'Fair grading', 'Timely evaluation'],
  overallExperience: ['Satisfaction', 'Would recommend', 'Overall rating']
};
const GROUP_NAMES = {
  teachingEffectiveness: 'Teaching Effectiveness',
  engagementCommunication: 'Engagement & Communication',
  assessmentFeedback: 'Assessment & Feedback',
  overallExperience: 'Overall Experience'
};

function MiniStars({ value }) {
  return (
    <div className="mini-stars">
      {[1,2,3,4,5].map(v => <div key={v} className={`mini-star${value >= v ? ' active' : ''}`}>{v}</div>)}
    </div>
  );
}

function ResponseCard({ response, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="response-card">
      <div className="rc-header" style={{ cursor: 'pointer' }} onClick={() => setOpen(o => !o)}>
        <span style={{ fontWeight: 500, fontSize: 14 }}>{response.respondent}</span>
        <div className="flex gap-2">
          <span className="text-muted" style={{ fontSize: 12 }}>{new Date(response.submittedAt).toLocaleDateString()}</span>
          <span style={{ fontSize: 12 }}>{open ? '−' : '+'}</span>
        </div>
      </div>
      {open && (
        <>
          {Object.entries(GROUP_LABELS).map(([key, labels]) => (
            <div key={key} className="rc-section">
              <div className="rc-section-title">{GROUP_NAMES[key]}</div>
              {labels.map((label, i) => (
                <div key={i} className="flex-between" style={{ marginBottom: 6 }}>
                  <span style={{ fontSize: 13, flex: 1 }}>{label}</span>
                  <MiniStars value={response.ratings?.[key]?.[i] || 0} />
                </div>
              ))}
            </div>
          ))}

          {response.comments && (
            <div className="rc-section">
              <div className="rc-section-title">Comments</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', background: 'var(--bg3)', borderRadius: 6, padding: '8px 12px' }}>{response.comments}</div>
            </div>
          )}

          {response.courseOutcomes?.moduleCoverage?.length > 0 && (
            <div className="rc-section">
              <div className="rc-section-title">Course Outcome Coverage</div>
              {response.courseOutcomes.allCoveredAsExpected
                ? <span className="badge green">All modules covered as expected</span>
                : response.courseOutcomes.moduleCoverage.map(m => (
                  <div key={m.moduleId} style={{ marginBottom: 6 }}>
                    <div className="flex-between">
                      <span style={{ fontSize: 13 }}>{m.moduleName}</span>
                      <span className={`badge ${m.metExpectations ? 'green' : 'amber'}`}>{m.metExpectations ? 'met' : 'not met'}</span>
                    </div>
                    {!m.metExpectations && m.grievance && (
                      <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, paddingLeft: 8, borderLeft: '2px solid var(--amber)' }}>{m.grievance}</div>
                    )}
                  </div>
                ))
              }
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function ProfessorDashboard() {
  const [courses, setCourses] = useState([]);
  const [selected, setSelected] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('summary'); // 'summary' | 'responses'

  useEffect(() => {
    let cancelled = false;
    api.get('/professor/courses').then(r => { if (!cancelled) { setCourses(r.data); setLoading(false); } });
    return () => { cancelled = true; };
  }, []);

  const loadReport = async course => {
    setSelected(course); setReport(null); setTab('summary');
    const r = await api.get(`/professor/feedback/${course._id}`);
    setReport(r.data);
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="mb-2">Feedback Reports</h1>
        {loading && <p className="text-muted">Loading...</p>}

        <div style={{ display: 'grid', gridTemplateColumns: selected ? '220px 1fr' : '1fr', gap: '1.5rem' }}>
          <div>
            {courses.map(c => (
              <div key={c._id} className="card" style={{ cursor: 'pointer', borderColor: selected?._id === c._id ? 'var(--green)' : '', marginBottom: 8 }} onClick={() => loadReport(c)}>
                <h3>{c.name}</h3>
                <p className="text-muted" style={{ fontSize: 12 }}>{c.courseId}</p>
              </div>
            ))}
            {!loading && courses.length === 0 && <div className="alert info">No courses assigned to you yet.</div>}
          </div>

          {selected && (
            <div>
              {!report && <p className="text-muted">Loading report...</p>}
              {report && report.count === 0 && <div className="alert info">No feedback submitted for this course yet.</div>}
              {report && report.count > 0 && (
                <>
                  <div className="stat-grid">
                    <div className="stat-card"><div className="stat-label">Total responses</div><div className="stat-value">{report.count}</div></div>
                    {report.averages?.overallExperience?.[2] != null && (
                      <div className="stat-card"><div className="stat-label">Avg overall rating</div><div className="stat-value">{report.averages.overallExperience[2].toFixed(1)}</div></div>
                    )}
                  </div>

                  <div className="tabs">
                    <button className={`tab${tab === 'summary' ? ' active' : ''}`} onClick={() => setTab('summary')}>Summary</button>
                    <button className={`tab${tab === 'responses' ? ' active' : ''}`} onClick={() => setTab('responses')}>Individual responses ({report.count})</button>
                  </div>

                  {tab === 'summary' && (
                    <>
                      {Object.entries(GROUP_LABELS).map(([group, labels]) => (
                        <div key={group} className="card mt-2">
                          <h3 className="mb-2">{GROUP_NAMES[group]}</h3>
                          {labels.map((label, i) => {
                            const avg = report.averages?.[group]?.[i] || 0;
                            return (
                              <div key={i} style={{ marginBottom: 10 }}>
                                <div className="flex-between mb-1">
                                  <span style={{ fontSize: 13 }}>{label}</span>
                                  <span style={{ fontSize: 13, fontWeight: 500 }}>{avg.toFixed(1)} / 5</span>
                                </div>
                                <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                                  <div style={{ height: 6, borderRadius: 3, background: 'var(--green)', width: `${(avg / 5) * 100}%`, transition: 'width 0.4s' }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}

                      {report.coSummary?.length > 0 && (
                        <div className="card mt-2">
                          <h3 className="mb-2">Course Outcome Coverage</h3>
                          {report.coSummary.map(m => (
                            <div key={m.moduleId} style={{ marginBottom: 12 }}>
                              <div className="flex-between">
                                <span style={{ fontSize: 14, fontWeight: 500 }}>{m.name}</span>
                                <span><span className="badge green">{m.met} met</span>{' '}<span className="badge red">{m.notMet} not met</span></span>
                              </div>
                              {m.grievances?.length > 0 && (
                                <details style={{ marginTop: 6 }}>
                                  <summary style={{ fontSize: 12, color: 'var(--text2)', cursor: 'pointer' }}>View {m.grievances.length} concern{m.grievances.length > 1 ? 's' : ''}</summary>
                                  <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                                    {m.grievances.map((g, i) => <li key={i} style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{g}</li>)}
                                  </ul>
                                </details>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {tab === 'responses' && (
                    <div className="mt-2">
                      <p className="text-muted mb-2" style={{ fontSize: 13 }}>All responses are anonymous. Click a card to expand.</p>
                      {(report.responses || []).map((r, i) => <ResponseCard key={i} response={r} index={i} />)}
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
