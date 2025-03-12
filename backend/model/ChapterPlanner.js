import mongoose from "mongoose";

const ChapterPlanSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  subtopics: [
    {
      name: { type: String, required: true },
      difficulty: { type: String, required: true },
      date: { type: String, required: true }, // YYYY-MM-DD format
      time: { type: String, required: true }, // e.g., "07:00"
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ChapterPlan = mongoose.model("ChapterPlan", ChapterPlanSchema);
export default ChapterPlan;
