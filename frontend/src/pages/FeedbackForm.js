import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import StarRating from '../components/StarRating';

const STEPS = ['Teaching Effectiveness', 'Engagement & Communication', 'Assessment & Feedback', 'Overall Experience', 'Course Outcomes'];

const QUESTIONS = {
  teachingEffectiveness: [
    'The professor explains concepts clearly.',
    'The lectures are well-structured and organized.',
    'The professor demonstrates strong knowledge of the subject.',
    'The professor uses real-world applications/examples to explain topics.',
    'The pace of teaching is appropriate.'
  ],
  engagementCommunication: [
    'The professor encourages student participation.',
    'Doubts are addressed clearly and patiently.',
    'The professor is approachable outside class hours.'
  ],
  assessmentFeedback: [
    'Assignments and exams reflect what was taught in class.',
    'Feedback on assignments is helpful.',
    'Grading is fair and transparent.',
    'The professor provides timely evaluation of work.'
  ],
  overallExperience: [
    'I am satisfied with the teaching quality of this professor.',
    'I would recommend this professor to other students.',
    'Overall rating of the professor.'
  ]
};

const GROUP_KEYS = ['teachingEffectiveness', 'engagementCommunication', 'assessmentFeedback', 'overallExperience'];

function initRatings() {
  const r = {};
  GROUP_KEYS.forEach(k => { r[k] = QUESTIONS[k].map(() => 0); });
  return r;
}

export default function FeedbackForm() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [course, setCourse] = useState(null);
  const [ratings, setRatings] = useState(initRatings());
  const [comments, setComments] = useState('');
  const [allGood, setAllGood] = useState(false);
  const [checkedModules, setCheckedModules] = useState({});
  const [grievances, setGrievances] = useState({});
  const [coPhase, setCoPhase] = useState('select'); // 'select' | 'grievance'
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get(`/courses/${courseId}/modules`).then(r => {
      if (cancelled) return;
      setCourse(r.data);
      const init = {};
      r.data.modules.forEach(m => { init[m.moduleId] = false; });
      setCheckedModules(init);
    });
    return () => { cancelled = true; };
  }, [courseId]);

  const currentGroupKey = GROUP_KEYS[step];
  const currentQuestions = step < 4 ? QUESTIONS[currentGroupKey] : [];

  const setRating = (qi, val) => {
    setRatings(prev => {
      const updated = { ...prev };
      updated[currentGroupKey] = [...prev[currentGroupKey]];
      updated[currentGroupKey][qi] = val;
      return updated;
    });
  };

  const validateRatingStep = () => {
    return ratings[currentGroupKey].every(v => v > 0);
  };

  const goNext = () => {
    setError('');
    if (step < 4) {
      if (!validateRatingStep()) { setError('Please rate all questions before continuing.'); return; }
      setStep(s => s + 1);
    }
  };

  const goBack = () => {
    setError('');
    if (coPhase === 'grievance') { setCoPhase('select'); return; }
    setStep(s => Math.max(0, s - 1));
  };

  const handleAllGood = () => {
    const next = !allGood;
    setAllGood(next);
    if (next) {
      const all = {};
      (course?.modules || []).forEach(m => { all[m.moduleId] = true; });
      setCheckedModules(all);
    }
  };

  const toggleModule = (id) => {
    if (allGood) return;
    setCheckedModules(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCoNext = () => {
    setError('');
    if (!allGood && !Object.values(checkedModules).some(Boolean)) {
      setError('Please select at least one module or mark everything as covered.'); return;
    }
    if (allGood) { doSubmit(); return; }
    const uncovered = (course?.modules || []).filter(m => !checkedModules[m.moduleId]);
    if (uncovered.length === 0) { doSubmit(); return; }
    setCoPhase('grievance');
  };

  const handleGrievanceSubmit = () => {
    setError('');
    const uncovered = (course?.modules || []).filter(m => !checkedModules[m.moduleId]);
    const allFilled = uncovered.every(m => grievances[m.moduleId]?.trim());
    if (!allFilled) { setError('Please provide feedback for each uncovered module.'); return; }
    doSubmit();
  };

  const doSubmit = async () => {
    setSubmitting(true);
    try {
      const moduleCoverage = (course?.modules || []).map(m => ({
        moduleId: m.moduleId,
        moduleName: m.name,
        metExpectations: allGood ? true : (checkedModules[m.moduleId] || false),
        grievance: (!allGood && !checkedModules[m.moduleId]) ? (grievances[m.moduleId] || '') : null
      }));

      await api.post('/feedback', {
        courseId,
        ratings,
        comments,
        courseOutcomes: { allCoveredAsExpected: allGood, moduleCoverage }
      });
      setDone(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="page">
      <div className="container" style={{ maxWidth: 480, textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: 48, marginBottom: '1rem' }}>✅</div>
        <h2>Feedback Submitted</h2>
        <p className="text-muted mt-1">Your response has been recorded anonymously. Thank you!</p>
        <button className="btn primary mt-3" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  );

  if (!course) return <div className="page"><div className="container"><p className="text-muted">Loading...</p></div></div>;

  const progressBar = (
    <div className="step-progress">
      {STEPS.map((_, i) => <span key={i} className={i < step ? 'done' : i === step ? 'active' : ''} />)}
    </div>
  );

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 600 }}>
        <p className="text-muted mb-1" style={{ fontSize: 13 }}>
          {course.courseId} — {course.name}
        </p>
        <h2 className="mb-2">{STEPS[step]}</h2>
        {progressBar}
        <p className="text-muted mb-2" style={{ fontSize: 12 }}>Step {step + 1} of {STEPS.length}</p>

        {error && <div className="alert error mb-2">{error}</div>}

        {/* Rating steps 0–3 */}
        {step < 4 && (
          <div className="card">
            {currentQuestions.map((q, i) => (
              <div key={i} className="form-group">
                <label style={{ fontSize: 14, fontWeight: 400, color: 'var(--gray-800)' }}>{q}</label>
                <StarRating value={ratings[currentGroupKey][i]} onChange={v => setRating(i, v)} />
              </div>
            ))}
            {step === 3 && (
              <div className="form-group mt-2">
                <label>Additional comments (optional)</label>
                <textarea value={comments} onChange={e => setComments(e.target.value)} placeholder="Share any thoughts about this professor or course..." />
              </div>
            )}
            <div className="flex-between mt-2">
              <button className="btn" onClick={goBack} disabled={step === 0}>← Back</button>
              <button className="btn primary" onClick={goNext}>Next →</button>
            </div>
          </div>
        )}

        {/* CO step — select phase */}
        {step === 4 && coPhase === 'select' && (
          <div className="card">
            <p className="text-muted mb-2" style={{ fontSize: 13 }}>
              Tick each module that was covered up to your expectations. Or use the button below if everything was satisfactory.
            </p>

            <button
              className={`btn w-full mb-2${allGood ? ' primary' : ''}`}
              style={{ justifyContent: 'center' }}
              onClick={handleAllGood}
            >
              {allGood ? '✓ Everything covered up to expectations' : '○ Everything covered up to expectations'}
            </button>

            {(course.modules || []).map(m => (
              <div
                key={m.moduleId}
                className={`module-card${checkedModules[m.moduleId] && !allGood ? ' checked' : ''}`}
                onClick={() => toggleModule(m.moduleId)}
                style={allGood ? { opacity: 0.45, pointerEvents: 'none' } : {}}
              >
                <input
                  type="checkbox"
                  checked={!!(checkedModules[m.moduleId])}
                  onChange={() => toggleModule(m.moduleId)}
                  disabled={allGood}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{m.name}</div>
                  {m.description && <div className="text-muted" style={{ fontSize: 12 }}>{m.description}</div>}
                </div>
                <span className={`badge ${checkedModules[m.moduleId] ? 'green' : 'amber'}`}>
                  {checkedModules[m.moduleId] ? '✓ met' : 'not yet'}
                </span>
              </div>
            ))}

            <div className="flex-between mt-2">
              <button className="btn" onClick={goBack}>← Back</button>
              <button className="btn primary" onClick={handleCoNext}>Next →</button>
            </div>
          </div>
        )}

        {/* CO step — grievance phase */}
        {step === 4 && coPhase === 'grievance' && (
          <div className="card">
            <p className="text-muted mb-2" style={{ fontSize: 13 }}>
              Please describe your concerns for each module that wasn't fully covered.
            </p>

            {(course.modules || []).filter(m => !checkedModules[m.moduleId]).map(m => (
              <div key={m.moduleId} className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {m.name} <span className="badge amber" style={{ fontSize: 11 }}>not met</span>
                </label>
                <textarea
                  value={grievances[m.moduleId] || ''}
                  onChange={e => setGrievances(prev => ({ ...prev, [m.moduleId]: e.target.value }))}
                  placeholder="E.g., key topics were skipped, insufficient time was spent..."
                />
              </div>
            ))}

            <div className="flex-between mt-2">
              <button className="btn" onClick={goBack}>← Back</button>
              <button className="btn primary" onClick={handleGrievanceSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit feedback'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
