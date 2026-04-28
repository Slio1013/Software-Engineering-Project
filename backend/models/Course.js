const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  moduleId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: '' }
});

const courseSchema = new mongoose.Schema({
  courseId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  modules: [moduleSchema],
  enrolledStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Drop any legacy 'code' index if it exists on startup
courseSchema.post('init', () => {});

module.exports = mongoose.model('Course', courseSchema);
