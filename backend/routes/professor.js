const router = require('express').Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');

// GET /api/professor/courses  — courses assigned to professor
router.get('/courses', auth(['professor']), async (req, res) => {
  try {
    const courses = await Course.find({ professor: req.user.id });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/professor/feedback/:courseId  — aggregated feedback for a course
router.get('/feedback/:courseId', auth(['professor']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course || course.professor.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const feedbacks = await Feedback.find({ course: req.params.courseId });
    if (!feedbacks.length) return res.json({ count: 0, averages: {}, coSummary: [] });

    // Compute averages for each rating group
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

    // CO summary per module
    const moduleMap = {};
    feedbacks.forEach(f => {
      (f.courseOutcomes?.moduleCoverage || []).forEach(m => {
        if (!moduleMap[m.moduleId]) moduleMap[m.moduleId] = { moduleId: m.moduleId, name: m.moduleName, met: 0, notMet: 0, grievances: [] };
        if (m.metExpectations) moduleMap[m.moduleId].met++;
        else { moduleMap[m.moduleId].notMet++; if (m.grievance) moduleMap[m.moduleId].grievances.push(m.grievance); }
      });
    });

    res.json({
      count: feedbacks.length,
      averages,
      coSummary: Object.values(moduleMap),
      comments: feedbacks.filter(f => f.comments).map(f => f.comments)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
