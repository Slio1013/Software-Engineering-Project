const router = require('express').Router();
const auth = require('../middleware/auth');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const crypto = require('crypto');

// GET /api/courses/my  — enrolled courses for student with attendance + submission status
router.get('/my', auth(['student']), async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id })
      .populate('professor', 'name studentId');

    const results = await Promise.all(courses.map(async (c) => {
      const att = await Attendance.findOne({ student: req.user.id, course: c._id });
      const hash = crypto.createHash('sha256').update(req.user.id + c._id.toString()).digest('hex');
      const submitted = await Feedback.exists({ studentHash: hash, course: c._id });
      return {
        _id: c._id,
        courseId: c.courseId,
        name: c.name,
        professor: c.professor,
        modules: c.modules,
        attendancePercentage: att ? att.percentage : null,
        eligible: att ? att.percentage >= 75 : false,
        submitted: !!submitted
      };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/courses/:id/modules
router.get('/:id/modules', auth(['student']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).select('modules name courseId');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
