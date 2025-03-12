import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";
import moment from "moment";
import eventRoute from "./api/eventRoute.js";
import userRoute from "./api/userRoute.js";
import chapterRoute from "./api/chapterRoute.js";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173/" }, // Allow React frontend
});

// Middleware
app.use(express.json());
app.use(cors());

// Connect MongoDB
mongoose.connect(
  "mongodb+srv://anshul2003garg:Z1qVywqNV61FeZU2@cluster0.ajpjkj2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

app.use("/api", eventRoute);
app.use("/api/users", userRoute);
app.use("/api/schedule", chapterRoute);

// Start Notification Cron Job
cron.schedule("* * * * *", async () => {
  console.log("🔄 Checking for upcoming events...");
  const currentHour = moment().format("H:mm");

  const upcomingEvents = await Event.find({ time: currentHour });
  upcomingEvents.forEach(async (event) => {
    io.emit("receiveNotification", {
      title: `Reminder: ${event.title}`,
      message: `Your event '${event.title}' is starting now!`,
    });
    console.log(`📢 Notification sent for '${event.title}'`);
  });
});

// Start Server
server.listen(5001, () => {
  console.log("🚀 Server running on port 5001");
});
