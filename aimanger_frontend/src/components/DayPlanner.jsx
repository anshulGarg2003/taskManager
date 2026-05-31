import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  CalendarClock,
  Plus,
  Filter,
  ArrowUp,
  ArrowDown,
  Clock3,
  Trash2,
  Sparkles,
  Timer,
  Target,
  Flame,
  AlertTriangle,
  Wand2,
  Repeat,
  Zap,
} from "lucide-react";
import { BASIC_URL } from "../utlis/API_calls";

const WORK_START = 6;
const WORK_END = 23;

function toMinutes(timeStr = "00:00") {
  const [h, m] = timeStr.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function toTimeString(totalMinutes = 0) {
  const normalized = Math.max(0, Math.min(totalMinutes, 23 * 60 + 59));
  const h = Math.floor(normalized / 60);
  const m = normalized % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function clampAndShift(timeStr, minutes) {
  return toTimeString(toMinutes(timeStr) + minutes);
}

function addDaysToDateString(dateStr, daysToAdd) {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + daysToAdd);
  return date.toISOString().split("T")[0];
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function isFreeSlot(start, durationMinutes, intervals) {
  const end = start + durationMinutes;
  return !intervals.some((i) => overlaps(start, end, i.start, i.end));
}

const DayPlanner2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    time: "08:00",
    duration: 1,
    priority: "medium",
    recurrence: "none",
    repeatCount: 1,
  });

  const selectedDate = useMemo(() => {
    const routeDate = location.state?.date;
    if (!routeDate) return new Date();
    const parsed = new Date(routeDate);
    return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [location.state]);

  const formattedSelectedDate = new Date(selectedDate)
    .toISOString()
    .split("T")[0];

  const userId = isAuthenticated ? userInfo.id : "";

  const priorityStyles = {
    high: "border-red-300 bg-red-50 text-red-900",
    medium: "border-amber-300 bg-amber-50 text-amber-900",
    low: "border-emerald-300 bg-emerald-50 text-emerald-900",
  };

  const fetchPlannerData = async () => {
    if (!userId) {
      setEvents([]);
      return;
    }

    try {
      setLoading(true);
      const [eventsData, scheduleData] = await Promise.all([
        fetch(
          `${BASIC_URL}/api/events?userId=${userId}&date=${formattedSelectedDate}`
        ).then((res) => res.json()),
        fetch(`${BASIC_URL}/api/schedule/chapter?userId=${userId}`).then((res) =>
          res.json()
        ),
      ]);

      const safeEvents = Array.isArray(eventsData) ? eventsData : [];
      const safeSchedules = Array.isArray(scheduleData) ? scheduleData : [];

      const chapterEvents = safeSchedules.flatMap((plan) =>
        (plan.subtopics || [])
          .filter((subtopic) => subtopic.date === formattedSelectedDate)
          .map((subtopic, idx) => ({
            _id: `chapter-${plan._id || plan.chapter}-${idx}`,
            title: plan.chapter,
            content: `${subtopic.name} • ${plan.subject}`,
            duration: 1,
            priority: subtopic.difficulty || "medium",
            time: subtopic.time || "10:00",
            source: "chapter",
            readonly: true,
          }))
      );

      const normalizedDbEvents = safeEvents.map((event) => ({
        ...event,
        source: "event",
        readonly: false,
      }));

      const merged = [...normalizedDbEvents, ...chapterEvents].sort(
        (a, b) => toMinutes(a.time) - toMinutes(b.time)
      );

      setEvents(merged);
    } catch {
      toast.error("Failed to load planner data");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlannerData();
  }, [formattedSelectedDate, userId]);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const passPriority =
        priorityFilter === "all" || event.priority === priorityFilter;
      const q = search.trim().toLowerCase();
      const passSearch =
        q.length === 0 ||
        event.title?.toLowerCase().includes(q) ||
        event.content?.toLowerCase().includes(q);
      return passPriority && passSearch;
    });
  }, [events, priorityFilter, search]);

  const metrics = useMemo(() => {
    const total = filteredEvents.length;
    const totalHours = filteredEvents.reduce(
      (sum, e) => sum + Number(e.duration || 0),
      0
    );
    const high = filteredEvents.filter((e) => e.priority === "high").length;
    const now = new Date();
    const progress = filteredEvents.filter((e) => {
      const eventDateTime = new Date(`${formattedSelectedDate}T${e.time}`);
      return eventDateTime <= now;
    }).length;

    return {
      total,
      totalHours,
      high,
      progress:
        total === 0 ? 0 : Math.round((progress / Math.max(total, 1)) * 100),
    };
  }, [filteredEvents, formattedSelectedDate]);

  const conflictPairs = useMemo(() => {
    const enriched = events.map((event) => {
      const start = toMinutes(event.time || "00:00");
      const durationMinutes = Math.max(30, Number(event.duration || 1) * 60);
      return {
        ...event,
        start,
        end: start + durationMinutes,
      };
    });

    const conflicts = [];
    for (let i = 0; i < enriched.length; i++) {
      for (let j = i + 1; j < enriched.length; j++) {
        if (overlaps(enriched[i].start, enriched[i].end, enriched[j].start, enriched[j].end)) {
          conflicts.push([enriched[i], enriched[j]]);
        }
      }
    }

    return conflicts;
  }, [events]);

  const suggestedSlots = useMemo(() => {
    const intervals = events.map((event) => {
      const start = toMinutes(event.time || "00:00");
      const durationMinutes = Math.max(30, Number(event.duration || 1) * 60);
      return { start, end: start + durationMinutes };
    });

    const durationMinutes = Math.max(30, Number(form.duration || 1) * 60);
    const slots = [];

    for (let minute = WORK_START * 60; minute <= WORK_END * 60; minute += 30) {
      if (isFreeSlot(minute, durationMinutes, intervals)) {
        slots.push(toTimeString(minute));
      }
      if (slots.length >= 5) break;
    }

    return slots;
  }, [events, form.duration]);

  const quickAddEvent = async () => {
    if (!userId) {
      toast.error("Login required");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Please add event title");
      return;
    }

    try {
      setSaving(true);
      const safeRepeatCount = Math.max(1, Math.min(30, Number(form.repeatCount || 1)));
      const dayStep = form.recurrence === "daily" ? 1 : form.recurrence === "weekly" ? 7 : 0;

      const payloads = Array.from({ length: safeRepeatCount }, (_, idx) => ({
        userId,
        title: form.title,
        content: form.content,
        time: form.time,
        duration: Number(form.duration),
        priority: form.priority,
        date: addDaysToDateString(formattedSelectedDate, dayStep * idx),
      }));

      const responses = await Promise.all(
        payloads.map((payload) =>
          fetch(`${BASIC_URL}/api/add-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        )
      );

      if (responses.some((res) => !res.ok)) throw new Error();

      toast.success(
        payloads.length > 1
          ? `${payloads.length} recurring events added`
          : "Event added to planner"
      );
      setForm({
        title: "",
        content: "",
        time: "08:00",
        duration: 1,
        priority: "medium",
        recurrence: "none",
        repeatCount: 1,
      });
      setShowQuickAdd(false);
      await fetchPlannerData();
    } catch {
      toast.error("Could not add event");
    } finally {
      setSaving(false);
    }
  };

  const autoResolveConflicts = async () => {
    const readonlyIntervals = events
      .filter((e) => e.readonly)
      .map((e) => {
        const start = toMinutes(e.time || "00:00");
        const durationMinutes = Math.max(30, Number(e.duration || 1) * 60);
        return { start, end: start + durationMinutes };
      });

    const editable = events
      .filter((e) => !e.readonly && e.source === "event")
      .map((e) => {
        const start = toMinutes(e.time || "00:00");
        const durationMinutes = Math.max(30, Number(e.duration || 1) * 60);
        return { ...e, start, durationMinutes };
      })
      .sort((a, b) => a.start - b.start);

    const occupied = [...readonlyIntervals];
    const updates = [];

    for (const event of editable) {
      let start = event.start;
      const latestStart = WORK_END * 60;

      while (!isFreeSlot(start, event.durationMinutes, occupied) && start <= latestStart) {
        start += 30;
      }

      if (start > latestStart) {
        continue;
      }

      occupied.push({ start, end: start + event.durationMinutes });

      if (start !== event.start) {
        updates.push({ eventId: event._id, time: toTimeString(start) });
      }
    }

    if (updates.length === 0) {
      toast("No auto-fix needed");
      return;
    }

    try {
      await Promise.all(
        updates.map((u) =>
          fetch(`${BASIC_URL}/api/events/${u.eventId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ time: u.time }),
          })
        )
      );

      toast.success(`Auto-fixed ${updates.length} conflicts`);
      await fetchPlannerData();
    } catch {
      toast.error("Failed to auto-resolve conflicts");
    }
  };

  const rescheduleEvent = async (event, deltaMinutes) => {
    if (event.readonly || event.source !== "event") {
      toast("Chapter plan items are read-only here");
      return;
    }

    const newTime = clampAndShift(event.time, deltaMinutes);

    try {
      const res = await fetch(`${BASIC_URL}/api/events/${event._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: newTime }),
      });

      if (!res.ok) throw new Error();

      setEvents((prev) =>
        prev
          .map((e) => (e._id === event._id ? { ...e, time: newTime } : e))
          .sort((a, b) => toMinutes(a.time) - toMinutes(b.time))
      );
      toast.success("Rescheduled");
    } catch {
      toast.error("Failed to reschedule");
    }
  };

  const deleteEvent = async (event) => {
    if (event.readonly || event.source !== "event") {
      toast("Chapter plan items cannot be deleted from this view");
      return;
    }

    try {
      const res = await fetch(`${BASIC_URL}/api/events/${event._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();

      setEvents((prev) => prev.filter((e) => e._id !== event._id));
      toast.success("Event removed");
    } catch {
      toast.error("Failed to delete event");
    }
  };

  const timelineMap = useMemo(() => {
    const slots = {};
    for (let h = WORK_START; h <= WORK_END; h++) {
      slots[h] = [];
    }

    filteredEvents.forEach((event) => {
      const hour = Math.max(WORK_START, Math.min(WORK_END, Math.floor(toMinutes(event.time) / 60)));
      slots[hour].push(event);
    });

    return slots;
  }, [filteredEvents]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-6 bg-slate-100 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Planner Access</h2>
          <p className="text-slate-600 mb-5">Please login to access your daily planning workspace.</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 rounded-full bg-sky-600 text-white font-semibold"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 text-slate-900 bg-[radial-gradient(circle_at_15%_20%,rgba(14,165,233,0.20),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(249,115,22,0.15),transparent_28%),linear-gradient(135deg,#fefce8,#eff6ff)]">
      <div className="max-w-7xl mx-auto space-y-5">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur border border-slate-200 rounded-3xl p-5 md:p-6 shadow-lg"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-4xl font-black tracking-tight inline-flex items-center gap-2">
                <CalendarClock className="w-7 h-7 text-sky-600" />
                Daily Planner Studio
              </h1>
              <p className="text-slate-600 mt-1">
                {formattedSelectedDate} • Build focus blocks, reschedule fast, and track your day momentum.
              </p>
            </div>

            <button
              onClick={() => setShowQuickAdd((v) => !v)}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-sky-500 to-fuchsia-500 text-white font-semibold inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Quick Add
            </button>
          </div>

          {showQuickAdd && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 grid grid-cols-1 md:grid-cols-8 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200"
            >
              <input
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Event title"
                className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
              <input
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Description"
                className="md:col-span-2 px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
              <input
                type="number"
                min="1"
                max="8"
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              />
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <select
                value={form.recurrence}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recurrence: e.target.value,
                    repeatCount: e.target.value === "none" ? 1 : Math.max(2, Number(f.repeatCount || 2)),
                  }))
                }
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white"
              >
                <option value="none">No Repeat</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
              <input
                type="number"
                min="1"
                max="30"
                disabled={form.recurrence === "none"}
                value={form.repeatCount}
                onChange={(e) => setForm((f) => ({ ...f, repeatCount: e.target.value }))}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white disabled:opacity-40"
                title="Number of occurrences"
              />
              <button
                onClick={quickAddEvent}
                disabled={saving}
                className="px-3 py-2 rounded-xl bg-slate-900 text-white font-semibold"
              >
                {saving ? "Saving..." : "Add Event"}
              </button>

              <div className="md:col-span-8 mt-1">
                <p className="text-xs text-slate-600 mb-1 inline-flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Smart free slots
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSlots.length === 0 && (
                    <span className="text-xs text-slate-500">No free slots found for selected duration</span>
                  )}
                  {suggestedSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setForm((f) => ({ ...f, time: slot }))}
                      className="px-2.5 py-1 rounded-full text-xs font-semibold border border-sky-300 bg-sky-50 text-sky-800"
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Target className="w-3.5 h-3.5" /> Planned Blocks</p>
            <p className="text-2xl font-black">{metrics.total}</p>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Timer className="w-3.5 h-3.5" /> Total Hours</p>
            <p className="text-2xl font-black">{metrics.totalHours}</p>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Flame className="w-3.5 h-3.5" /> High Priority</p>
            <p className="text-2xl font-black">{metrics.high}</p>
          </div>
          <div className="bg-white/80 border border-slate-200 rounded-2xl p-4">
            <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Sparkles className="w-3.5 h-3.5" /> Day Progress</p>
            <p className="text-2xl font-black">{metrics.progress}%</p>
          </div>
        </div>

        <div className="bg-white/80 border border-slate-200 rounded-3xl p-4 md:p-5 shadow-lg">
          {conflictPairs.length > 0 && (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-3 flex flex-wrap items-center gap-3 justify-between">
              <p className="text-sm text-rose-800 inline-flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {conflictPairs.length} time conflict(s) detected in this planner day.
              </p>
              <button
                onClick={autoResolveConflicts}
                className="px-3 py-1.5 rounded-full text-sm font-semibold bg-rose-600 text-white inline-flex items-center gap-1"
              >
                <Wand2 className="w-4 h-4" /> Auto-fix
              </button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-600" />
              {["all", "high", "medium", "low"].map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                    priorityFilter === p
                      ? "bg-slate-900 text-white border-slate-900"
                      : "bg-white text-slate-700 border-slate-300"
                  }`}
                >
                  {p.charAt(0).toUpperCase() + p.slice(1)}
                </button>
              ))}
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title or description"
              className="px-3 py-2 rounded-xl border border-slate-300 bg-white min-w-[240px]"
            />
          </div>

          <p className="text-xs text-slate-500 mb-3 inline-flex items-center gap-1">
            <Repeat className="w-3.5 h-3.5" /> Recurring add, smart slot suggestion, and auto conflict fixing are enabled.
          </p>

          {loading ? (
            <p className="text-slate-600">Loading planner timeline...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {Array.from({ length: WORK_END - WORK_START + 1 }, (_, i) => WORK_START + i).map((hour) => {
                const label = `${String(hour).padStart(2, "0")}:00`;
                const slotEvents = timelineMap[hour] || [];

                return (
                  <div key={hour} className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-bold text-slate-700 mb-2">{label}</p>

                    {slotEvents.length === 0 ? (
                      <p className="text-xs text-slate-400">No blocks</p>
                    ) : (
                      <div className="space-y-2">
                        {slotEvents.map((event) => (
                          <div
                            key={event._id}
                            className={`rounded-xl border p-2.5 ${priorityStyles[event.priority] || "border-slate-300 bg-slate-50 text-slate-900"}`}
                          >
                            <p className="font-bold text-sm leading-tight">{event.title}</p>
                            <p className="text-xs mt-0.5 opacity-85">{event.content || "No details"}</p>
                            <div className="mt-2 flex items-center justify-between text-xs">
                              <span className="inline-flex items-center gap-1">
                                <Clock3 className="w-3 h-3" />
                                {event.time}
                              </span>
                              <span>{event.duration || 1}h</span>
                            </div>

                            <div className="mt-2 flex items-center gap-1.5">
                              <button
                                onClick={() => rescheduleEvent(event, -30)}
                                className="px-2 py-1 rounded-lg bg-white/80 border border-slate-300 text-slate-700 inline-flex items-center gap-1"
                                title="Move 30 mins earlier"
                              >
                                <ArrowUp className="w-3.5 h-3.5" /> -30m
                              </button>
                              <button
                                onClick={() => rescheduleEvent(event, 30)}
                                className="px-2 py-1 rounded-lg bg-white/80 border border-slate-300 text-slate-700 inline-flex items-center gap-1"
                                title="Move 30 mins later"
                              >
                                <ArrowDown className="w-3.5 h-3.5" /> +30m
                              </button>
                              <button
                                onClick={() => deleteEvent(event)}
                                className="ml-auto px-2 py-1 rounded-lg bg-white/80 border border-slate-300 text-slate-700 inline-flex items-center gap-1"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {event.readonly && (
                              <p className="text-[11px] mt-1.5 font-semibold opacity-80">Chapter-plan block (read-only)</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayPlanner2;
