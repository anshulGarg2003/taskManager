import mongoose from "mongoose";

const EventSchema = new mongoose.Schema({
  userId: String,
  title: String,
  content: String,
  time: String, // e.g., "07:00"
  duration: Number,
  date: String,
  priority: { type: String, enum: ["low", "medium", "high"], default: "low" },
  createdAt: { type: Date, default: Date.now },
});

const Event = mongoose.model("Event", EventSchema);

export default Event;
