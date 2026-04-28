const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const Attendance = require('../models/Attendance');
const Feedback = require('../models/Feedback');
const crypto = require('crypto');

function friendlyError(err) {
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || '';
    if (field === 'courseId') return 'Course ID already exists. Please use a different ID.';
    if (field === 'studentId') return 'A user with that ID already exists.';
    if (field === 'email') return 'That email address is already registered.';
    return 'A record with that value already exists.';
  }
  if (err.name === 'ValidationError') {
    return Object.values(err.errors).map(e => e.message).join('. ');
  }
  return err.message || 'An unexpected error occurred.';
}

// Users
router.get('/users', auth(['admin']), async (req, res) => {
  try { res.json(await User.find().select('-password')); }
  catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Students
router.get('/students', auth(['admin']), async (req, res) => {
  try {
    res.json(await User.find({ role: 'student' }).select('-password').populate('enrolledCourses', 'name courseId'));
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

router.post('/students', auth(['admin']), async (req, res) => {
  try {
    const student = new User({ ...req.body, role: 'student' });
    await student.save();
    res.status(201).json({ message: 'Student account created.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.put('/students/:id', auth(['admin']), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const student = await User.findById(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found.' });
    Object.assign(student, rest);
    if (password) student.password = password;
    await student.save();
    res.json({ message: 'Student updated.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.delete('/students/:id', auth(['admin']), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted.' });
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Courses
router.get('/courses', auth(['admin']), async (req, res) => {
  try { res.json(await Course.find().populate('professor', 'name studentId photo')); }
  catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

router.post('/courses', auth(['admin']), async (req, res) => {
  try {
    if (!req.body.modules || req.body.modules.length < 3)
      return res.status(400).json({ message: 'Each course must have at least 3 modules.' });
    const course = new Course(req.body);
    await course.save();
    res.status(201).json(course);
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.put('/courses/:id', auth(['admin']), async (req, res) => {
  try {
    if (req.body.modules && req.body.modules.length < 3)
      return res.status(400).json({ message: 'Each course must have at least 3 modules.' });
    res.json(await Course.findByIdAndUpdate(req.params.id, req.body, { new: true }));
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.delete('/courses/:id', auth(['admin']), async (req, res) => {
  try { await Course.findByIdAndDelete(req.params.id); res.json({ message: 'Course deleted.' }); }
  catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Course enrollment roster with submission counts
router.get('/courses/:id/students', auth(['admin']), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('enrolledStudents', 'name studentId section');
    if (!course) return res.status(404).json({ message: 'Course not found.' });
    const feedbacks = await Feedback.find({ course: req.params.id });
    const attendances = await Attendance.find({ course: req.params.id });
    const students = (course.enrolledStudents || []).map(s => {
      const hash = crypto.createHash('sha256').update(s._id.toString() + req.params.id).digest('hex');
      const submitted = feedbacks.some(f => f.studentHash === hash);
      const attRec = attendances.find(a => a.student.toString() === s._id.toString());
      return { _id: s._id, name: s.name, studentId: s.studentId, section: s.section, submitted, attendance: attRec?.percentage ?? null };
    });
    res.json({ students, submittedCount: students.filter(s => s.submitted).length, totalEnrolled: students.length });
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Professors
router.get('/professors', auth(['admin']), async (req, res) => {
  try { res.json(await User.find({ role: 'professor' }).select('-password')); }
  catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

router.post('/professors', auth(['admin']), async (req, res) => {
  try {
    const prof = new User({ ...req.body, role: 'professor' });
    await prof.save();
    res.status(201).json({ message: 'Professor account created.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.put('/professors/:id', auth(['admin']), async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    const prof = await User.findById(req.params.id);
    if (!prof) return res.status(404).json({ message: 'Professor not found.' });
    Object.assign(prof, rest);
    if (password) prof.password = password;
    await prof.save();
    res.json({ message: 'Professor updated.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.delete('/professors/:id', auth(['admin']), async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: 'Professor deleted.' }); }
  catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Enroll / unenroll
router.post('/enroll', auth(['admin']), async (req, res) => {
  try {
    const { studentId, courseId, attendancePercentage } = req.body;
    await Course.findByIdAndUpdate(courseId, { $addToSet: { enrolledStudents: studentId } });
    await User.findByIdAndUpdate(studentId, { $addToSet: { enrolledCourses: courseId } });
    await Attendance.findOneAndUpdate({ student: studentId, course: courseId }, { percentage: attendancePercentage ?? 0 }, { upsert: true });
    res.json({ message: 'Student enrolled successfully.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

router.post('/unenroll', auth(['admin']), async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, { $pull: { enrolledStudents: studentId } });
    await User.findByIdAndUpdate(studentId, { $pull: { enrolledCourses: courseId } });
    await Attendance.deleteOne({ student: studentId, course: courseId });
    res.json({ message: 'Student removed from course.' });
  } catch (err) { res.status(400).json({ message: friendlyError(err) }); }
});

// Feedback monitoring
router.get('/feedback', auth(['admin']), async (req, res) => {
  try {
    res.json(await Feedback.find().populate('course', 'name courseId modules').populate('professor', 'name photo'));
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

router.get('/feedback/course/:courseId', auth(['admin', 'professor']), async (req, res) => {
  try {
    res.json(await Feedback.find({ course: req.params.courseId }).populate('course', 'name courseId modules'));
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

// Stats
router.get('/stats', auth(['admin']), async (req, res) => {
  try {
    const [totalFeedback, totalCourses, totalStudents, totalProfessors] = await Promise.all([
      Feedback.countDocuments(), Course.countDocuments(),
      User.countDocuments({ role: 'student' }), User.countDocuments({ role: 'professor' })
    ]);
    res.json({ totalFeedback, totalCourses, totalStudents, totalProfessors });
  } catch (err) { res.status(500).json({ message: friendlyError(err) }); }
});

module.exports = router;
