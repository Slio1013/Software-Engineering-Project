const router = require('express').Router();
const auth = require('../middleware/auth');
const crypto = require('crypto');
const Feedback = require('../models/Feedback');
const Attendance = require('../models/Attendance');
const Course = require('../models/Course');

// POST /api/feedback  — submit feedback (student)
router.post('/', auth(['student']), async (req, res) => {
  try {
    const { courseId, ratings, comments, courseOutcomes } = req.body;

    // Verify attendance eligibility
    const att = await Attendance.findOne({ student: req.user.id, course: courseId });
    if (!att || att.percentage < 75) {
      return res.status(403).json({ message: 'Attendance below 75%. Not eligible to submit feedback.' });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    // Anonymise: hash of studentId + courseId
    const studentHash = crypto.createHash('sha256')
      .update(req.user.id + courseId).digest('hex');

    const feedback = new Feedback({
      studentHash,
      course: courseId,
      professor: course.professor,
      ratings,
      comments,
      courseOutcomes
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this course.' });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
