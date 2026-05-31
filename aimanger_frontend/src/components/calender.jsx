import React, { useEffect, useMemo, useState } from "react";
import { format, isAfter, isBefore, startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth0 } from "@auth0/auth0-react";
import { useSelector } from "react-redux";
import { BASIC_URL } from "../utlis/API_calls";
import {
  CalendarDays,
  AlarmClock,
  Flame,
  AlertTriangle,
  ChevronRight,
  Clock3,
  Target,
} from "lucide-react";

const YearPlanner = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const userId = isAuthenticated ? userInfo.id : "";

  const handleDateChange = (date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ); // Adjust to local time
    setSelectedDate(localDate);
  };

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    fetch(`${BASIC_URL}/api/events?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setEvents(Array.isArray(data) ? data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [userId]);

  const selectedDateKey = format(selectedDate, "yyyy-MM-dd");
  const selectedDayStart = startOfDay(selectedDate);

  const monthlyEvents = useMemo(() => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);

    return events.filter((event) => {
      if (event.date === "always") return true;
      const eventDate = new Date(event.date);
      return !Number.isNaN(eventDate) && eventDate >= monthStart && eventDate <= monthEnd;
    });
  }, [events, selectedDate]);

  const agendaEvents = useMemo(() => {
    const filtered = events.filter((event) => {
      const onSelectedDay = event.date === selectedDateKey || event.date === "always";
      const priorityPass = priorityFilter === "all" || event.priority === priorityFilter;
      return onSelectedDay && priorityPass;
    });

    return filtered.sort((a, b) => (a.time || "00:00").localeCompare(b.time || "00:00"));
  }, [events, selectedDateKey, priorityFilter]);

  const stats = useMemo(() => {
    const highPriority = monthlyEvents.filter((e) => e.priority === "high").length;
    const now = new Date();

    const upcomingWeek = monthlyEvents.filter((e) => {
      if (e.date === "always") return true;
      const d = new Date(e.date);
      if (Number.isNaN(d)) return false;
      return isAfter(d, startOfDay(now)) && isBefore(d, endOfDay(new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000)));
    }).length;

    const overdue = events.filter((e) => {
      if (e.date === "always") return false;
      const d = new Date(e.date);
      return !Number.isNaN(d) && isBefore(d, startOfDay(now));
    }).length;

    return {
      totalMonthly: monthlyEvents.length,
      highPriority,
      upcomingWeek,
      overdue,
    };
  }, [events, monthlyEvents]);

  const eventCountByDate = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      if (event.date && event.date !== "always") {
        map[event.date] = (map[event.date] || 0) + 1;
      }
    });
    return map;
  }, [events]);

  const jumpToPlanner = () => {
    navigate("/planner", { state: { date: selectedDateKey } });
  };

  const priorityTone = {
    high: "border-red-300 bg-red-50/80 text-red-800",
    medium: "border-amber-300 bg-amber-50/80 text-amber-900",
    low: "border-emerald-300 bg-emerald-50/80 text-emerald-800",
  };

  return (
    <div className="planner-shell min-h-screen p-4 md:p-8 text-slate-900">
      <div className="planner-glow" />
      <div className="max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 md:mb-8"
        >
          <h1 className="text-3xl md:text-5xl font-black tracking-tight planner-title">
            Academic Command Calendar
          </h1>
          <p className="text-sm md:text-base mt-2 text-slate-700 max-w-3xl">
            Plan smarter with a unified monthly view, priority intelligence, and one-click transfer into your day planner.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-8 planner-card p-4 md:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-slate-700">
                <CalendarDays className="w-5 h-5" />
                <p className="font-semibold">Month View</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedDate(new Date())}
                  className="planner-chip"
                >
                  Today
                </button>
                <button
                  onClick={() => {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    setSelectedDate(tomorrow);
                  }}
                  className="planner-chip"
                >
                  Tomorrow
                </button>
                <button
                  onClick={jumpToPlanner}
                  className="planner-chip planner-chip-primary"
                >
                  Open Day Planner
                </button>
              </div>
            </div>

            <div className="planner-calendar-wrap">
              <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileClassName={({ date }) => {
                  const key = format(date, "yyyy-MM-dd");
                  if (key === selectedDateKey) return "planner-tile-active";
                  if ((eventCountByDate[key] || 0) > 0) return "planner-tile-has-events";
                  return "";
                }}
                tileContent={({ date, view }) => {
                  if (view !== "month") return null;
                  const key = format(date, "yyyy-MM-dd");
                  const count = eventCountByDate[key] || 0;
                  if (!count) return null;
                  return <span className="planner-tile-badge">{count}</span>;
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-4 text-xs text-slate-600">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Has tasks</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-fuchsia-500" /> Selected day</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="lg:col-span-4 planner-card p-4 md:p-5"
          >
            <h3 className="font-bold text-lg mb-3">Monthly Insights</h3>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="planner-stat">
                <Target className="w-4 h-4" />
                <p className="text-xs">This Month</p>
                <p className="text-xl font-black">{stats.totalMonthly}</p>
              </div>
              <div className="planner-stat">
                <Flame className="w-4 h-4" />
                <p className="text-xs">High Priority</p>
                <p className="text-xl font-black">{stats.highPriority}</p>
              </div>
              <div className="planner-stat">
                <AlarmClock className="w-4 h-4" />
                <p className="text-xs">Next 7 Days</p>
                <p className="text-xl font-black">{stats.upcomingWeek}</p>
              </div>
              <div className="planner-stat">
                <AlertTriangle className="w-4 h-4" />
                <p className="text-xs">Overdue</p>
                <p className="text-xl font-black">{stats.overdue}</p>
              </div>
            </div>

            {!userId && (
              <p className="text-sm text-slate-600">
                Login to view your personalized calendar intelligence.
              </p>
            )}
            {loading && userId && <p className="text-sm text-slate-600">Syncing your events...</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="lg:col-span-12 planner-card p-4 md:p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-xl font-bold">Agenda for {format(selectedDate, "EEEE, MMM d")}</h3>
                <p className="text-sm text-slate-600">Your focused timeline for the selected date.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  { label: "All", value: "all" },
                  { label: "High", value: "high" },
                  { label: "Medium", value: "medium" },
                  { label: "Low", value: "low" },
                ].map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setPriorityFilter(f.value)}
                    className={`planner-chip ${priorityFilter === f.value ? "planner-chip-primary" : ""}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {agendaEvents.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
                No tasks planned for this day and filter.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {agendaEvents.map((event) => (
                  <div
                    key={event._id || `${event.title}-${event.time}-${event.date}`}
                    className={`rounded-2xl border p-4 shadow-sm ${priorityTone[event.priority] || "border-slate-300 bg-white"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-bold leading-tight">{event.title}</p>
                      <span className="text-xs uppercase font-semibold tracking-wide">{event.priority || "low"}</span>
                    </div>
                    <p className="text-sm mt-1 opacity-80 line-clamp-2">{event.content || "No description"}</p>
                    <div className="mt-3 text-xs flex items-center justify-between">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="w-3.5 h-3.5" /> {event.time || "00:00"}
                      </span>
                      <span>{event.duration || 1}h</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex justify-end">
              <button onClick={jumpToPlanner} className="planner-chip planner-chip-primary inline-flex items-center gap-1">
                Deep Plan This Day <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default YearPlanner;
