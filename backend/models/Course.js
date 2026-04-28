const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleId: String,
  name: String,
  description: String
});

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [moduleSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Course', courseSchema);
