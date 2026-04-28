const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { studentId, password } = req.body;
    const user = await User.findOne({ studentId }).populate('enrolledCourses');
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const match = await user.comparePassword(password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign(
      { id: user._id, studentId: user.studentId, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    res.json({ token, role: user.role, name: user.name, studentId: user.studentId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/register  (admin use / seeding)
router.post('/register', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json({ message: 'User created' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
