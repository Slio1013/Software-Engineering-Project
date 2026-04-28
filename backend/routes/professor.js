const router = require('express').Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');

router.get('/courses', auth(['professor']), async (req, res) => {
  try {
    res.json(await Course.find({ professor: req.user.id }));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/feedback/:courseId', auth(['professor', 'admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    if (req.user.role === 'professor' && course.professor.toString() !== req.user.id)
      return res.status(403).json({ message: 'Access denied.' });

    const feedbacks = await Feedback.find({ course: req.params.courseId });
    if (!feedbacks.length) return res.json({ count: 0, averages: {}, coSummary: [], responses: [] });

    const groups = ['teachingEffectiveness', 'engagementCommunication', 'assessmentFeedback', 'overallExperience'];
    const averages = {};
    groups.forEach(g => {
      const all = feedbacks.map(f => f.ratings[g] || []).filter(a => a.length);
      if (!all.length) { averages[g] = []; return; }
      const len = all[0].length;
      averages[g] = Array.from({ length: len }, (_, i) => {
        const sum = all.reduce((acc, a) => acc + (a[i] || 0), 0);
        return parseFloat((sum / all.length).toFixed(2));
      });
    });

    const moduleMap = {};
    feedbacks.forEach(f => {
      (f.courseOutcomes?.moduleCoverage || []).forEach(m => {
        if (!moduleMap[m.moduleId]) moduleMap[m.moduleId] = { moduleId: m.moduleId, name: m.moduleName, met: 0, notMet: 0, grievances: [] };
        if (m.metExpectations) moduleMap[m.moduleId].met++;
        else { moduleMap[m.moduleId].notMet++; if (m.grievance) moduleMap[m.moduleId].grievances.push(m.grievance); }
      });
    });

    // Anonymous numbered responses for the detailed view
    const responses = feedbacks.map((f, i) => ({
      respondent: `Anonymous Student ${i + 1}`,
      ratings: f.ratings,
      comments: f.comments,
      courseOutcomes: f.courseOutcomes,
      submittedAt: f.submittedAt
    }));

    res.json({ count: feedbacks.length, averages, coSummary: Object.values(moduleMap), comments: feedbacks.filter(f => f.comments).map(f => f.comments), responses });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
