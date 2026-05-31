import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import toast from "react-hot-toast";
import { Play, Pause, RotateCcw, CheckCircle, Coffee, BookOpen, Timer } from "lucide-react";

const MODES = {
  study: { label: "Study", duration: 25 * 60, color: "from-purple-800 to-indigo-900", icon: BookOpen },
  shortBreak: { label: "Short Break", duration: 5 * 60, color: "from-green-800 to-teal-900", icon: Coffee },
  longBreak: { label: "Long Break", duration: 15 * 60, color: "from-blue-800 to-cyan-900", icon: Coffee },
};

function formatTime(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, "0");
  const s = (secs % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export default function StudyTimer() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);

  const [mode, setMode] = useState("study");
  const [timeLeft, setTimeLeft] = useState(MODES.study.duration);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0); // completed pomodoros
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [topic, setTopic] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [customMinutes, setCustomMinutes] = useState("");
  const [todaySummary, setTodaySummary] = useState(null);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!userInfo.id) return;
    fetch(`${BASIC_URL}/api/sessions/${userInfo.id}/today/summary`)
      .then((r) => r.json())
      .then((d) => setTodaySummary(d))
      .catch(() => {});
  }, [userInfo.id, sessions]);

  const startTimer = useCallback(async () => {
    // Start a study session in DB when starting study mode
    if (mode === "study" && !sessionId && userInfo.id && subject) {
      try {
        const res = await fetch(`${BASIC_URL}/api/sessions/start`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: userInfo.id,
            subject,
            chapter,
            topic,
            date: new Date().toISOString().split("T")[0],
          }),
        });
        const data = await res.json();
        setSessionId(data.sessionId);
      } catch {
        // Continue even if session logging fails
      }
    }
    startTimeRef.current = Date.now();
    setRunning(true);
  }, [mode, sessionId, userInfo.id, subject, chapter, topic]);

  const pauseTimer = () => setRunning(false);

  const endSession = useCallback(async (productivity = 3) => {
    if (sessionId) {
      try {
        await fetch(`${BASIC_URL}/api/sessions/end/${sessionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productivity }),
        });
      } catch {}
      setSessionId(null);
    }
  }, [sessionId]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            if (mode === "study") {
              setSessions((s) => s + 1);
              endSession(4);
              toast.success("🎉 Pomodoro complete! Take a break.");
            } else {
              toast.success("Break over! Back to studying.");
            }
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running, mode, endSession]);

  const switchMode = (newMode) => {
    if (running) {
      endSession();
      setRunning(false);
    }
    setMode(newMode);
    const mins = customMinutes && newMode === "study" ? parseInt(customMinutes) * 60 : MODES[newMode].duration;
    setTimeLeft(mins);
    setSessionId(null);
  };

  const reset = () => {
    if (running) endSession();
    setRunning(false);
    const mins = customMinutes && mode === "study" ? parseInt(customMinutes) * 60 : MODES[mode].duration;
    setTimeLeft(mins);
    setSessionId(null);
  };

  const currentMode = MODES[mode];
  const totalDuration = customMinutes && mode === "study" ? parseInt(customMinutes) * 60 : currentMode.duration;
  const progress = 1 - timeLeft / totalDuration;

  const r = 110;
  const circ = 2 * Math.PI * r;

  return (
    <div className={`min-h-screen bg-gradient-to-br ${currentMode.color} text-white p-6 transition-all duration-700`}>
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Timer className="w-8 h-8 text-white/80" />
          <h1 className="text-3xl font-extrabold">Study Timer</h1>
        </motion.div>

        {/* Mode switcher */}
        <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-full">
          {Object.entries(MODES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => switchMode(key)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold transition-all ${
                mode === key ? "bg-white/20 text-white" : "text-white/60 hover:text-white/80"
              }`}
            >
              {val.label}
            </button>
          ))}
        </div>

        {/* Subject selector (study mode only) */}
        {mode === "study" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 gap-2 mb-6"
          >
            <input
              placeholder="Subject"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/40"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
            <input
              placeholder="Chapter"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/40"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            />
            <input
              placeholder="Topic"
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm placeholder-white/40"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </motion.div>
        )}

        {/* Custom duration (study mode) */}
        {mode === "study" && (
          <div className="flex items-center gap-2 mb-6 justify-center">
            <span className="text-sm text-white/60">Custom duration (min):</span>
            <input
              type="number"
              min="1"
              max="120"
              placeholder="25"
              className="w-16 bg-white/10 border border-white/20 rounded-lg px-2 py-1 text-sm text-center"
              value={customMinutes}
              onChange={(e) => {
                setCustomMinutes(e.target.value);
                if (!running && e.target.value) {
                  setTimeLeft(parseInt(e.target.value) * 60);
                }
              }}
            />
          </div>
        )}

        {/* Circular Timer */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <svg width="260" height="260" className="-rotate-90">
              <circle cx="130" cy="130" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={12} />
              <motion.circle
                cx="130"
                cy="130"
                r={r}
                fill="none"
                stroke="rgba(255,255,255,0.8)"
                strokeWidth={12}
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - progress)}
                transition={{ duration: 0.5 }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-black font-mono">{formatTime(timeLeft)}</span>
              <span className="text-white/60 text-sm mt-1">{currentMode.label}</span>
              {mode === "study" && sessions > 0 && (
                <div className="flex gap-1 mt-2">
                  {Array.from({ length: Math.min(sessions, 8) }).map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-green-400 rounded-full" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={reset}
            className="p-4 rounded-full bg-white/10 hover:bg-white/20"
          >
            <RotateCcw className="w-6 h-6" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={running ? pauseTimer : startTimer}
            className="p-5 rounded-full bg-white/20 hover:bg-white/30 shadow-lg"
          >
            {running ? (
              <Pause className="w-8 h-8" />
            ) : (
              <Play className="w-8 h-8 ml-0.5" />
            )}
          </motion.button>
          {running && mode === "study" && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => endSession(5)}
              className="p-4 rounded-full bg-green-500/30 hover:bg-green-500/50"
            >
              <CheckCircle className="w-6 h-6" />
            </motion.button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="bg-black/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-300">{sessions}</p>
            <p className="text-sm text-white/60 mt-1">Sessions today</p>
          </div>
          <div className="bg-black/20 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-300">
              {todaySummary ? `${todaySummary.totalHours}h` : "—"}
            </p>
            <p className="text-sm text-white/60 mt-1">Total studied</p>
          </div>
        </div>

        {todaySummary?.bySubject && Object.keys(todaySummary.bySubject).length > 0 && (
          <div className="bg-black/20 rounded-xl p-4 mt-4">
            <p className="text-sm font-semibold text-white/60 mb-3">Today by subject</p>
            {Object.entries(todaySummary.bySubject).map(([sub, mins]) => (
              <div key={sub} className="flex items-center justify-between mb-2">
                <span className="text-sm">{sub}</span>
                <span className="text-sm font-bold text-purple-300">
                  {Math.round((mins / 60) * 10) / 10}h
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
