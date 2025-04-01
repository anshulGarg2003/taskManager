import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { BASIC_URL } from "../utlis/API_calls";

const DayPlanner2 = () => {
  const [events, setEvents] = useState([]);
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);

  const selectedDate = new Date();
  console.log(selectedDate);

  const formattedSelectedDate = new Date(selectedDate)
    .toISOString()
    .split("T")[0];

  function parseTime(timeStr) {
    let [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes; // Convert to minutes
  }

  function formatTime(minutes) {
    let hours = Math.floor(minutes / 60);
    let mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  const userId = isAuthenticated ? userInfo.id : "";

  const priorityColors = {
    high: "bg-red-500 text-white",
    medium: "bg-yellow-400 text-black",
    low: "bg-green-500 text-white",
  };

  useEffect(() => {
    if (!userId) return;

    // Fetch both events and schedule chapter first
    Promise.all([
      fetch(
        `${BASIC_URL}/api/events?userId=${userId}&date=${formattedSelectedDate}`
      ).then((res) => res.json()),
      fetch(`${BASIC_URL}/api/schedule/chapter?userId=${userId}`).then((res) =>
        res.json()
      ),
    ])
      .then(([eventsData, scheduleData]) => {
        console.log("Raw Events Data:", eventsData);
        console.log("Raw Chapter Data:", scheduleData);
        // console.log("Raw Schedule Data:", scheduleData);

        const todayDate = formattedSelectedDate;

        // Process scheduleData into events format
        let scheduleEvents = [];

        if (scheduleData.length > 0) {
          scheduleEvents = scheduleData.flatMap((plan) =>
            plan.subtopics
              .filter((subtopic) => subtopic.date === todayDate)
              .map((subtopic) => ({
                title: plan.chapter,
                content: `${subtopic.name} - ${plan.subject}`,
                duration: "1",
                priority: subtopic.difficulty,
                time: subtopic.time,
              }))
          );
        }

        // Merge all events
        let mergedEvents = [...eventsData, ...scheduleEvents];

        // Step 1: Sort by priority and then by title lexicographically
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        mergedEvents.sort((a, b) => {
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          }
          return a.title.localeCompare(b.title);
        });

        let scheduled = [];
        let occupiedTimes = new Set();

        for (let event of mergedEvents) {
          let scheduledTime = parseTime(event.time);

          // If the time is occupied, extend by 1 hour
          while (occupiedTimes.has(scheduledTime)) {
            scheduledTime += 60;
          }

          // Schedule the event
          scheduled.push({
            ...event,
            scheduledTime: formatTime(scheduledTime),
          });
          occupiedTimes.add(scheduledTime);
        }

        setEvents(scheduled);
        console.log("Final Scheduled Events:", events);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, [formattedSelectedDate, userId]);

  // Assign available time slots (7:00 to 23:00)
  const scheduledEvents = {};
  const assignedHours = new Set();

  const cleanTime = (time) => {
    // Ensure time is properly formatted as "HH:MM"
    const match = time.match(/^(\d{1,2}):(\d{2})$/); // Matches "H:MM" or "HH:MM"
    if (!match) return null; // Invalid time format
    let [_, hours, minutes] = match;

    hours = hours.padStart(2, "0"); // Ensure two-digit hours
    return `${hours}:${minutes}`;
  };

  events.forEach((event) => {
    let eventHour = parseInt(event?.time?.split(":")[0]);
    // console.log(eventHour);d

    if (eventHour >= 7) {
      scheduledEvents[`${eventHour}:00`] = event; // Ensure key format matches rendering loop
      assignedHours.add(eventHour);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-800 text-white p-6">
      <motion.h1
        className="text-3xl font-extrabold text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        📅 Today's Schedule - {formattedSelectedDate}
      </motion.h1>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(24).keys()].map((hour) => {
          const hourStr = hour + ":00";
          const event = scheduledEvents[hourStr];
          const isSleepingTime = hour < 7;

          return (
            <motion.div
              key={hour}
              className={`p-4 bg-white bg-opacity-20 backdrop-blur-lg rounded-lg shadow-lg ${
                isSleepingTime ? "opacity-50" : ""
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: hour * 0.05 }}
            >
              <h4 className="text-lg font-semibold text-white">{hourStr}</h4>
              {isSleepingTime ? (
                <p className="text-gray-300 italic">Sleeping Time 😴</p>
              ) : event ? (
                (() => {
                  const eventDateTime = new Date(
                    `${formattedSelectedDate}T${cleanTime(event.scheduledTime)}`
                  );
                  const isPastEvent = eventDateTime < new Date();

                  return (
                    <motion.div
                      className={`mt-2 p-3 rounded-lg shadow-md transition-transform transform hover:scale-105 ${
                        priorityColors[event.priority]
                      } ${isPastEvent ? "line-through opacity-50" : ""}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h5 className="text-xl font-bold">{event.title}</h5>
                      <p className="text-sm">{event.content}</p>
                      <p className="text-xs">
                        ⏳ Duration: {event.duration} hrs
                      </p>
                    </motion.div>
                  );
                })()
              ) : (
                <p className="text-gray-300">No events</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DayPlanner2;
