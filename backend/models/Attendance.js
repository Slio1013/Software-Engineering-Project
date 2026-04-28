const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  percentage: { type: Number, required: true, min: 0, max: 100 }
});

// Unique per student+course
attendanceSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
