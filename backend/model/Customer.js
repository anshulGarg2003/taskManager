const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hash this before saving
  grade: { type: String, enum: ["11th", "12th", "Dropper"], required: true },
  jee_exam_type: {
    type: String,
    enum: ["JEE Main", "JEE Advanced"],
    required: true,
  },
  jee_exam_date: { type: Date, required: true },

  // Study Preferences
  available_hours_per_day: { type: Number, required: true },
  preferred_study_time: {
    type: String,
    enum: ["Morning", "Afternoon", "Night"],
    required: true,
  },
  break_times: { type: Boolean, default: false },

  // Subject Proficiency
  strong_subjects: [{ type: String, enum: ["Physics", "Chemistry", "Math"] }],
  weak_subjects: [{ type: String, enum: ["Physics", "Chemistry", "Math"] }],

  // Study Resources
  follows_ncert: { type: Boolean, default: true },
  study_materials: [{ type: String }], // Coaching, YouTube, etc.
  mock_test_frequency: {
    type: String,
    enum: ["Weekly", "Bi-weekly", "Monthly"],
    required: true,
  },

  // Goal & Motivation
  target_rank: { type: Number, required: true },
  daily_motivation: { type: Boolean, default: false },
  progress_tracking: { type: Boolean, default: true },

  // Study Plan & Progress
  study_plan: [
    {
      topic_id: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
      start_date: { type: Date },
      end_date: { type: Date },
      status: {
        type: String,
        enum: ["Pending", "Completed", "In Progress"],
        default: "Pending",
      },
    },
  ],
  mock_test_scores: [
    {
      date: { type: Date },
      scores: {
        Physics: { type: Number, default: 0 },
        Chemistry: { type: Number, default: 0 },
        Math: { type: Number, default: 0 },
      },
      weak_topics: [{ type: String }],
    },
  ],
});

module.exports = mongoose.model("User", userSchema);
