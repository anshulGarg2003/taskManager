import express from "express";
import ChapterPlan from "../model/ChapterPlanner.js";

const router = express.Router();

router.post("/chapter", async (req, res) => {
  const { userId, subject, chapter, subtopics } = req.body;

  if (!userId || !subject || !chapter || !subtopics) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const newPlan = new ChapterPlan({ userId, subject, chapter, subtopics });
    await newPlan.save();

    console.log(newPlan);

    return res
      .status(201)
      .json({ message: "Chapter Plan Saved!", studyPlan: newPlan });
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/chapter", async (req, res) => {
  const { userId } = req.query; // ✅ Extract from query params

  if (!userId) {
    return res.status(400).json({ message: "Missing required userId" });
  }

  try {
    const studyPlans = await ChapterPlan.find({ userId });

    if (!studyPlans.length) {
      return res.status(404).json({ message: "No study plans found" });
    }

    return res.status(200).json(studyPlans);
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
