const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');

// --- Users ---
router.get('/users', auth(['admin']), async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// --- Courses ---
router.get('/courses', auth(['admin']), async (req, res) => {
  const courses = await Course.find().populate('professor', 'name studentId');
  res.json(courses);
});

router.post('/courses', auth(['admin']), async (req, res) => {
  try {
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/courses/:id', auth(['admin']), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/courses/:id', auth(['admin']), async (req, res) => {
  await Course.findByIdAndDelete(req.params.id);
  res.json({ message: 'Course deleted' });
});

// --- Professors ---
router.get('/professors', auth(['admin']), async (req, res) => {
  const profs = await User.find({ role: 'professor' }).select('-password');
  res.json(profs);
});

router.post('/professors', auth(['admin']), async (req, res) => {
  try {
    const prof = new User({ ...req.body, role: 'professor' });
    await prof.save();
    res.status(201).json({ message: 'Professor created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Assign professor to course
router.put('/courses/:id/assign-professor', auth(['admin']), async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, { professor: req.body.professorId }, { new: true });
    res.json(course);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Enroll student in course + set attendance
router.post('/enroll', auth(['admin']), async (req, res) => {
  try {
    const { studentId, courseId, attendancePercentage } = req.body;
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: studentId } });
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
    await Attendance.findOneAndUpdate(
      { student: studentId, course: courseId },
      { percentage: attendancePercentage },
      { upsert: true }
    );
    res.json({ message: 'Enrolled and attendance set' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// --- Feedback monitoring ---
router.get('/feedback', auth(['admin']), async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('course', 'name courseId')
      .populate('professor', 'name');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Stats overview
router.get('/stats', auth(['admin']), async (req, res) => {
  try {
    const [totalFeedback, totalCourses, totalStudents, totalProfessors] = await Promise.all([
      Feedback.countDocuments(),
      Course.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'professor' })
    ]);
    res.json({ totalFeedback, totalCourses, totalStudents, totalProfessors });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
