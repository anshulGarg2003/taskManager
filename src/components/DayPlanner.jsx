import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

// const socket = io("http://localhost:5001");

const DayPlanner2 = () => {
  const [events, setEvents] = useState([]);
  const user = useAuth0().user;

  const location = useLocation();
  const selectedDate = location.state?.date || new Date();

  const formattedSelectedDate = new Date(selectedDate)
    .toISOString()
    .split("T")[0];

  const userId = user?.sub || "";

  const priorityColors = {
    high: "bg-red-500 text-white",
    medium: "bg-yellow-400 text-black",
    low: "bg-green-500 text-white",
  };

  useEffect(() => {
    if (!userId) return;

    fetch(
      `http://localhost:5001/api/events?userId=${userId}&date=${formattedSelectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        const sortedEvents = [...data].sort((a, b) => {
          const priorityOrder = { high: 1, medium: 2, low: 3 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
        setEvents(sortedEvents);
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, [formattedSelectedDate, userId]);

  console.log("Selected Date:", formattedSelectedDate);

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
    let eventHour = parseInt(event.time.split(":")[0]);
    console.log(eventHour);

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
                    `${formattedSelectedDate}T${cleanTime(event.time)}`
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
