import express from "express";
import User from "../model/User.js";
const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { auth0Id, name, email, picture } = req.body;

    let user = await User.findOne({ auth0Id });

    if (!user) {
      user = new User({ auth0Id, name, email, picture });
      await user.save();
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:userId/addTask", async (req, res) => {
  try {
    const { taskId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { $push: { tasks: taskId } },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to add task" });
  }
});

export default router;
