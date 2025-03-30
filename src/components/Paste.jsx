import { Calendar, Copy, Eye, PencilLine, Trash2, Bell } from "lucide-react";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FormatDate } from "../utlis/formatDate";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { BASIC_URL } from "../utlis/API_calls";

const Paste = () => {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [nextEvent, setNextEvent] = useState(null); // Holds the nearest event
  const userInfo = useSelector((state) => state.user);
  const { isAuthenticated } = useAuth0();
  const formattedTime =
    nextEvent?.time && nextEvent.time.includes(":") // Check if time is valid
      ? (() => {
          const [hours, minutes] = nextEvent.time.split(":").map(Number);
          return `${hours % 12 || 12}:${minutes.toString().padStart(2, "0")} ${
            hours >= 12 ? "PM" : "AM"
          }`;
        })()
      : "Time Not Available"; // Default fallback

  useEffect(() => {
    const userId = isAuthenticated ? userInfo.id : "";
    if (userId == "") return toast.error("Login to ");

    fetch(`${BASIC_URL}/api/events?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        setEvents(data);
        findNextEvent(data); // Find the upcoming event
      })
      .catch((error) => console.error("Error fetching events:", error));
  }, []);

  const findNextEvent = (events) => {
    const now = new Date();
    const today = now.toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD format

    const upcomingEvents = events.filter((event) => {
      let eventDateTime;

      // Handle "always" case by setting an artificial high date
      if (event.date === "always") {
        eventDateTime = new Date(`${today}T${event.time}`); // Assume today's time for "always"
      } else {
        eventDateTime = new Date(`${event.date}T${event.time}`);
      }

      // Ensure the event is valid and upcoming
      return (
        !isNaN(eventDateTime.getTime()) &&
        (eventDateTime > now ||
          (event.date === today && eventDateTime.getTime() >= now.getTime()))
      );
    });

    // Sorting events based on their date & time
    const sortedEvents = upcomingEvents.sort((a, b) => {
      let aDateTime, bDateTime;

      // Handle "always" events by setting an artificial date (e.g., today)
      if (a.date === "always") {
        aDateTime = new Date(`${today}T${a.time}`);
      } else {
        aDateTime = new Date(`${a.date}T${a.time}`);
      }

      if (b.date === "always") {
        bDateTime = new Date(`${today}T${b.time}`);
      } else {
        bDateTime = new Date(`${b.date}T${b.time}`);
      }

      return aDateTime - bDateTime;
    });

    if (sortedEvents.length > 0) {
      setNextEvent(sortedEvents[0]); // Get the earliest event
    } else {
      setNextEvent(null);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${BASIC_URL}/api/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        const updatedEvents = events.filter((event) => event._id !== id);
        setEvents(updatedEvents);
        findNextEvent(updatedEvents);
        toast.success("Event deleted successfully!");
      } else {
        toast.error("Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("An error occurred while deleting.");
    }
  };

  const filteredPastes = events?.filter((paste) =>
    paste.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full py-10 max-w-[1200px] mx-auto px-5 lg:px-0">
      {/* 🔔 Notification Bar */}
      {nextEvent && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-yellow-300 text-black text-lg font-semibold flex items-center gap-3 px-5 py-3 rounded-md shadow-lg"
        >
          <Bell size={22} className="text-red-600" />
          <span>
            📅 Upcoming Event: <strong>{nextEvent.title}</strong> at{" "}
            {formattedTime} {nextEvent.date !== "always" && nextEvent.date}
          </span>
        </motion.div>
      )}

      <div className="flex flex-col gap-y-6 mt-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full flex gap-3 px-4 py-3 rounded-md border border-gray-300 shadow-md bg-white"
        >
          <input
            type="search"
            placeholder="Search events..."
            className="focus:outline-none w-full bg-transparent text-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </motion.div>

        {/* All Events */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col border border-gray-300 shadow-lg bg-white py-6 rounded-lg"
        >
          <h2 className="px-6 text-4xl font-bold border-b border-gray-300 pb-4">
            All Events
          </h2>
          <div className="w-full px-6 pt-4 flex flex-col gap-y-5">
            {filteredPastes.length > 0 ? (
              filteredPastes.map((paste) => (
                <motion.div
                  key={paste?._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="border border-gray-300 shadow-md w-full flex flex-col sm:flex-row justify-between p-5 rounded-lg bg-white hover:shadow-xl transition-all duration-300"
                >
                  {/* heading and Description */}
                  <div className="w-[50%] flex flex-col space-y-3">
                    <p className="text-2xl font-semibold text-gray-800">
                      {paste?.title}
                    </p>
                    <p className="text-sm font-normal line-clamp-3 max-w-[80%] text-gray-600">
                      {paste?.content}
                    </p>
                    <div className="flex gap-3">
                      <p className="text-sm font-normal line-clamp-3 max-w-[80%] text-gray-600">
                        {paste?.date}
                      </p>
                      <p className="text-sm font-normal line-clamp-3 max-w-[80%] text-gray-600">
                        {paste?.duration} hr
                      </p>
                    </div>
                  </div>

                  {/* icons */}
                  <div className="flex flex-col gap-y-4 sm:items-end">
                    <div className="flex gap-3">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-md bg-gray-100 border hover:bg-blue-100 hover:border-blue-500 transition"
                      >
                        <a href={`/home?pasteId=${paste?._id}`}>
                          <PencilLine
                            className="text-gray-700 hover:text-blue-500"
                            size={22}
                          />
                        </a>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-md bg-gray-100 border hover:bg-red-100 hover:border-red-500 transition"
                        onClick={() => handleDelete(paste?._id)}
                      >
                        <Trash2
                          className="text-gray-700 hover:text-red-500"
                          size={22}
                        />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-md bg-gray-100 border hover:bg-orange-100 hover:border-orange-500 transition"
                      >
                        <a href={`/pastes/${paste?._id}`} target="_blank">
                          <Eye
                            className="text-gray-700 hover:text-orange-500"
                            size={22}
                          />
                        </a>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="p-3 rounded-md bg-gray-100 border hover:bg-green-100 hover:border-green-500 transition"
                        onClick={() => {
                          navigator.clipboard.writeText(paste?.content);
                          toast.success("Copied to Clipboard");
                        }}
                      >
                        <Copy
                          className="text-gray-700 hover:text-green-500"
                          size={22}
                        />
                      </motion.button>
                    </div>

                    <div className="gap-x-2 flex items-center text-gray-700">
                      <Calendar size={22} />
                      <span>{FormatDate(paste?.createdAt)}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div className="text-2xl text-center w-full text-red-500">
                No Data Found
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Paste;
