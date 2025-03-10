import express from "express";
import Event from "../model/event.js";

const router = express.Router();

// Add an event
router.post("/add-event", async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ message: "Event added successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all events
router.get("/events", async (req, res) => {
  try {
    const { userId, date } = req.query;
    // console.log("Received userId:", userId, "Received date:", date);

    // Check if userId is missing (this is a mandatory parameter)
    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    let events;

    // If date is provided, filter by both userId and date
    if (date) {
      events = await Event.find({
        userId,
        $or: [{ date: date }, { date: "always" }],
      });
    } else {
      // If date is missing, fetch all events for the user
      events = await Event.find({ userId });
    }

    console.log(events);

    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// Delete an event
router.delete("/events/:id", async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Event deleted successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
