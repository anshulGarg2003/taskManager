import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import toast from "react-hot-toast";
import { CalendarDays, Plus, Trash2, ChevronLeft, ChevronRight, Clock, Flag } from "lucide-react";

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6:00 – 22:00
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const priorityColors = {
  high: "bg-red-500/80 border-red-400",
  medium: "bg-yellow-500/80 border-yellow-400",
  low: "bg-green-500/80 border-green-400",
};

function getWeekDates(offset = 0) {
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });
}

function formatDate(d) {
  return d.toISOString().split("T")[0];
}

// ── Add Event Modal ───────────────────────────────────────────────────────────
function AddEventModal({ date, onClose, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    content: "",
    time: "08:00",
    duration: 60,
    priority: "medium",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form, date });
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 border border-white/10 rounded-2xl p-6 w-full max-w-md text-white"
      >
        <h3 className="font-bold text-xl mb-4">Add Event — {date}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Title"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            placeholder="Description"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Time</label>
              <input
                type="time"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Duration (min)</label>
              <input
                type="number"
                min={15}
                max={480}
                step={15}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Priority</label>
            <select
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
              value={form.priority}
              onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold"
            >
              Add Event
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function WeeklyPlanner() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);
  const [weekOffset, setWeekOffset] = useState(0);
  const [events, setEvents] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null); // { date }

  const weekDates = getWeekDates(weekOffset);
  const today = formatDate(new Date());

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!userInfo.id) return;
    setLoading(true);
    const from = formatDate(weekDates[0]);
    const to = formatDate(weekDates[6]);

    // Fetch all events for the week
    const datePromises = weekDates.map((d) =>
      fetch(`${BASIC_URL}/api/events?userId=${userInfo.id}&date=${formatDate(d)}`)
        .then((r) => r.json())
        .then((data) => ({ date: formatDate(d), data: Array.isArray(data) ? data : [] }))
    );

    Promise.all(datePromises)
      .then((results) => {
        const map = {};
        results.forEach(({ date, data }) => { map[date] = data; });
        setEvents(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userInfo.id, weekOffset]);

  const handleAddEvent = async (eventData) => {
    if (!userInfo.id) return toast.error("Please login first");
    try {
      const res = await fetch(`${BASIC_URL}/api/add-event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...eventData, userId: userInfo.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Event added!");
      // Refresh that day's events
      const updated = await fetch(
        `${BASIC_URL}/api/events?userId=${userInfo.id}&date=${eventData.date}`
      ).then((r) => r.json());
      setEvents((prev) => ({ ...prev, [eventData.date]: Array.isArray(updated) ? updated : [] }));
    } catch {
      toast.error("Failed to add event");
    }
  };

  const handleDelete = async (eventId, date) => {
    try {
      await fetch(`${BASIC_URL}/api/events/${eventId}`, { method: "DELETE" });
      setEvents((prev) => ({
        ...prev,
        [date]: prev[date].filter((e) => e._id !== eventId),
      }));
      toast.success("Event removed");
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Build grid: for each hour, which event is occurring?
  const getEventsAtHour = (date, hour) => {
    const dayEvents = events[date] || [];
    return dayEvents.filter((e) => {
      const eHour = parseInt(e.time?.split(":")[0] || "0");
      return eHour === hour;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-6">
      {/* Header */}
      <div className="max-w-full">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-2xl font-extrabold">Weekly Planner</h1>
              <p className="text-gray-400 text-sm">
                {weekDates[0].toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                {weekDates[6].toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 bg-purple-600/50 hover:bg-purple-600 rounded-lg text-sm font-semibold"
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        {/* Day Headers */}
        <div className="grid grid-cols-8 gap-1 mb-1 sticky top-0 z-10">
          <div className="text-xs text-gray-500 text-center py-2">TIME</div>
          {weekDates.map((d, i) => {
            const isToday = formatDate(d) === today;
            return (
              <div
                key={i}
                className={`text-center py-2 rounded-lg text-sm font-semibold ${
                  isToday ? "bg-purple-600/40 text-purple-300" : "text-gray-300"
                }`}
              >
                <div>{DAYS[d.getDay()]}</div>
                <div className={`text-xl font-bold ${isToday ? "text-white" : ""}`}>
                  {d.getDate()}
                </div>
                <button
                  onClick={() => setModal({ date: formatDate(d) })}
                  className="mt-1 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-0.5 mx-auto"
                >
                  <Plus className="w-3 h-3" /> Add
                </button>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        {loading ? (
          <div className="text-center py-12 text-gray-400 animate-pulse">Loading...</div>
        ) : (
          <div className="overflow-auto max-h-[calc(100vh-220px)]">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-8 gap-1 min-h-16 border-t border-gray-700/50">
                {/* Hour label */}
                <div className="text-xs text-gray-500 text-right pr-2 pt-1 shrink-0">
                  {hour.toString().padStart(2, "0")}:00
                </div>

                {/* Day cells */}
                {weekDates.map((d) => {
                  const date = formatDate(d);
                  const cellEvents = getEventsAtHour(date, hour);
                  return (
                    <div key={date} className="relative min-h-16 border-l border-gray-700/30 p-0.5">
                      {cellEvents.map((ev) => (
                        <motion.div
                          key={ev._id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`rounded p-1.5 border text-xs mb-0.5 group relative ${
                            priorityColors[ev.priority] || "bg-blue-500/80 border-blue-400"
                          }`}
                        >
                          <div className="font-semibold truncate">{ev.title}</div>
                          <div className="flex items-center gap-1 text-white/70 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {ev.time} · {ev.duration}min
                          </div>
                          <button
                            onClick={() => handleDelete(ev._id, date)}
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-3 h-3 text-white/80 hover:text-red-300" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      <AnimatePresence>
        {modal && (
          <AddEventModal
            date={modal.date}
            onClose={() => setModal(null)}
            onAdd={handleAddEvent}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
