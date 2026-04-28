const mongoose = require('mongoose');

const ratingGroupSchema = new mongoose.Schema({
  // Teaching Effectiveness (5 questions)
  teachingEffectiveness: [Number],
  // Engagement & Communication (3 questions)
  engagementCommunication: [Number],
  // Assessment & Feedback (4 questions)
  assessmentFeedback: [Number],
  // Overall Experience (3 questions)
  overallExperience: [Number]
}, { _id: false });

const moduleOutcomeSchema = new mongoose.Schema({
  moduleId: String,
  moduleName: String,
  metExpectations: Boolean,
  grievance: { type: String, default: null }
}, { _id: false });

const feedbackSchema = new mongoose.Schema({
  // We store a hash of the studentId + courseId for anonymity,
  // not the actual student reference.
  studentHash: { type: String, required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  professor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: ratingGroupSchema,
  comments: { type: String, default: '' },
  courseOutcomes: {
    allCoveredAsExpected: Boolean,
    moduleCoverage: [moduleOutcomeSchema]
  },
  submittedAt: { type: Date, default: Date.now }
});

// Prevent duplicate submissions: one hash per course
feedbackSchema.index({ studentHash: 1, course: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
