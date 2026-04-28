const router = require('express').Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

router.post('/', auth(['student']), async (req, res) => {
  try {
    const { courseId, ratings, comments, courseOutcomes } = req.body;

    const att = await Attendance.findOne({ student: req.user.id, course: courseId });
    if (!att || att.percentage < 75)
      return res.status(403).json({ message: 'Your attendance is below 75%. You are not eligible to submit feedback for this course.' });

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found.' });

    const studentHash = crypto.createHash('sha256').update(req.user.id + courseId).digest('hex');

    // If no module selected and allCoveredAsExpected is false, mark ALL as not covered
    let finalCO = courseOutcomes;
    if (courseOutcomes && !courseOutcomes.allCoveredAsExpected) {
      const anySelected = courseOutcomes.moduleCoverage?.some(m => m.metExpectations);
      if (!anySelected) {
        finalCO = {
          allCoveredAsExpected: false,
          moduleCoverage: (courseOutcomes.moduleCoverage || []).map(m => ({
            ...m,
            metExpectations: false
          }))
        };
      }
    }

    const feedback = new Feedback({ studentHash, course: courseId, professor: course.professor, ratings, comments, courseOutcomes: finalCO });
    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully.' });
  } catch (err) {
    if (err.code === 11000)
      return res.status(409).json({ message: 'You have already submitted feedback for this course.' });
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
