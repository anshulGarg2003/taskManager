import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  Clock3,
  Flag,
  NotebookPen,
  PlusCircle,
} from "lucide-react";
import { BASIC_URL } from "../utlis/API_calls";

const Home = () => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");
  const [time, setTime] = useState("0");
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [always, setAlways] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const pasteId = searchParams.get("pasteId");
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);

  useEffect(() => {
    if (!pasteId) return;

    fetch(`${BASIC_URL}/api/events/${pasteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data) return;

        setTitle(data.title || "");
        setContent(data.content || "");
        setPriority(data.priority || "low");
        setTime(data.time ? data.time.split(":")[0] : "0");
        setDuration(data.duration || 0);
        setDate(data.date || "");
        setAlways(data.date === "always");
      })
      .catch((error) => console.error("Error fetching event:", error));
  }, [pasteId]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("low");
    setTime("0");
    setDuration(0);
    setDate("");
    setAlways(false);
    setSearchParams({});
  };

  const handleSave = async () => {
    if (!userInfo?.id) {
      toast.error("Please log in to save your event.");
      return;
    }

    if (!title.trim() || (!always && !date)) {
      toast.error("Please add a title and select a date or always.");
      return;
    }

    const eventData = {
      title,
      content,
      priority,
      time: `${time}:00`,
      duration: Number(duration),
      date: always ? "always" : date,
      userId: isAuthenticated ? userInfo.id : "",
    };

    try {
      let response;
      if (pasteId) {
        response = await fetch(`${BASIC_URL}/api/events/${pasteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch(`${BASIC_URL}/api/add-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.error || "Failed to save event");
      }

      toast.success(pasteId ? "Event updated!" : "Event added!");
      resetForm();
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error saving event");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_18%_16%,rgba(14,165,233,0.20),transparent_28%),radial-gradient(circle_at_82%_20%,rgba(249,115,22,0.20),transparent_30%),linear-gradient(130deg,#f8fafc,#fefce8)]">
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white/80 backdrop-blur p-5 md:p-6 shadow-xl"
        >
          <p className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1 rounded-full bg-sky-100 text-sky-700">
            <NotebookPen className="w-4 h-4" />
            Planner Composer
          </p>
          <h2 className="text-3xl font-black mt-4 text-slate-900">
            {pasteId ? "Update Study Event" : "Create Study Event"}
          </h2>
          <p className="mt-2 text-slate-600">
            Plan your study blocks with clear priorities, timing, and notes.
          </p>

          <div className="mt-6 space-y-3">
            {[
              {
                title: "Clear Priority",
                text: "Choose low, medium, or high focus.",
              },
              {
                title: "Smart Timing",
                text: "Set exact time and total duration.",
              },
              {
                title: "Long-term Mode",
                text: "Use Always for recurring reminders.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-slate-200 bg-white p-3"
              >
                <p className="font-semibold text-slate-900">{item.title}</p>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-5 md:p-6 shadow-xl"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">Title</label>
              <input
                type="text"
                placeholder="Ex: Physics revision + numericals"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
                <CalendarDays className="w-4 h-4" /> Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={always}
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3 disabled:opacity-50"
              />
            </div>

            <div className="flex items-end">
              <label className="w-full flex items-center gap-2 text-slate-700 text-sm font-semibold rounded-xl border border-slate-300 bg-slate-50 p-3">
                <input
                  type="checkbox"
                  checked={always}
                  onChange={() => setAlways(!always)}
                />
                Always remind me
              </label>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
                <Flag className="w-4 h-4" /> Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3"
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
                <Clock3 className="w-4 h-4" /> Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3"
              >
                {[...Array(24).keys()].map((hour) => (
                  <option key={hour} value={hour}>
                    {String(hour).padStart(2, "0")}:00
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Duration (hours)
              </label>
              <input
                type="number"
                value={duration}
                min="0"
                max="24"
                onChange={(e) => setDuration(e.target.value)}
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your event details here..."
                className="mt-1 w-full bg-white text-slate-900 border border-slate-300 rounded-xl p-3"
                rows={5}
              />
            </div>
          </div>

          <div className="w-full flex justify-end mt-6">
            <button
              className="inline-flex items-center gap-2 text-white bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 font-semibold rounded-xl text-sm px-6 py-3"
              onClick={handleSave}
            >
              <PlusCircle className="w-4 h-4" />
              {pasteId ? "Update Event" : "Create Event"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
