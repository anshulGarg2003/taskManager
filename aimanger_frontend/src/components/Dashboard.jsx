import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { BASIC_URL } from "../utlis/API_calls";
import { setOverview } from "../redux/analyticsSlice";
import {
  BookOpen, BarChart2, Zap, Clock, Target, Trophy,
  AlertTriangle, Star, LogOut, ChevronRight,
} from "lucide-react";

function QuickStatCard({ icon: Icon, label, value, color, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -2 }}
      onClick={onClick}
      className={`bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-3 ${onClick ? "cursor-pointer hover:border-white/20" : ""}`}
    >
      <div className={`p-2.5 rounded-full bg-white/10 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </motion.div>
  );
}

function NavCard({ icon: Icon, label, description, path, color }) {
  const navigate = useNavigate();
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(path)}
      className="bg-white/5 border border-white/10 hover:border-white/20 rounded-xl p-4 cursor-pointer flex items-center gap-3 group"
    >
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-300 transition-colors" />
    </motion.div>
  );
}

const Dashboard = () => {
  const { isAuthenticated, isLoading } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const overview = useSelector((s) => s.analytics.overview);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [todayEvents, setTodayEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!userInfo.id) return;
    fetch(`${BASIC_URL}/api/analytics/overview/${userInfo.id}`)
      .then((r) => r.json())
      .then((d) => dispatch(setOverview(d)))
      .catch(() => {});

    const today = new Date().toISOString().split("T")[0];
    fetch(`${BASIC_URL}/api/events?userId=${userInfo.id}&date=${today}`)
      .then((r) => r.json())
      .then((d) => setTodayEvents(Array.isArray(d) ? d.slice(0, 5) : []))
      .catch(() => {});

    fetch(`${BASIC_URL}/api/announcements/active?audience=student`)
      .then((r) => r.json())
      .then((d) => setAnnouncements(Array.isArray(d) ? d.slice(0, 3) : []))
      .catch(() => setAnnouncements([]));
  }, [userInfo.id, dispatch]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Loading...
      </div>
    );
  }

  const priorityDot = { high: "bg-red-400", medium: "bg-yellow-400", low: "bg-green-400" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white p-5 md:p-8 overflow-y-auto">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          {userInfo?.picture ? (
            <img src={userInfo.picture} alt="Profile" className="w-16 h-16 rounded-full border-4 border-purple-400 shadow-lg" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center text-2xl font-bold border-4 border-purple-400">
              {userInfo?.name?.[0] || "S"}
            </div>
          )}
          <div className="flex-1">
            <h2 className="text-2xl font-bold">
              Welcome, <span className="text-purple-400">{userInfo?.name || "Student"}!</span>
            </h2>
            <p className="text-gray-400 text-sm">{userInfo?.email}</p>
            {userInfo.grade && (
              <p className="text-gray-500 text-xs">Grade {userInfo.grade} · {userInfo.school || "School not set"}</p>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/logout")}
            className="flex items-center gap-1 bg-red-600/30 hover:bg-red-600/50 px-3 py-2 rounded-lg text-red-300 text-sm"
          >
            <LogOut className="w-4 h-4" /> Logout
          </motion.button>
        </motion.div>

        {/* Quick Stats */}
        {overview && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <QuickStatCard icon={BarChart2} label="Avg Quiz Score" value={`${overview.avgScore}%`} color="text-purple-400" onClick={() => navigate("/analytics")} />
            <QuickStatCard icon={Clock} label="Study Hours" value={`${overview.totalStudyHours}h`} color="text-blue-400" />
            <QuickStatCard icon={Zap} label="Streak" value={`${overview.currentStreak}d`} color="text-orange-400" />
            <QuickStatCard icon={BookOpen} label="Quizzes Done" value={overview.totalQuizzes} color="text-green-400" />
          </div>
        )}

        {overview?.weakSubjects?.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-red-300 text-sm">Needs attention:</p>
              <p className="text-gray-300 text-sm">{overview.weakSubjects.join(", ")} — below 50% avg. Focus on these today!</p>
            </div>
          </motion.div>
        )}

        {announcements.length > 0 && (
          <div className="mb-6 space-y-2">
            {announcements.map((item) => {
              const tone =
                item.level === "urgent"
                  ? "border-rose-500/40 bg-rose-900/30"
                  : item.level === "warning"
                    ? "border-amber-500/40 bg-amber-900/25"
                    : "border-sky-500/40 bg-sky-900/25";

              return (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-xl border p-4 ${tone}`}
                >
                  <p className="text-sm font-bold text-white">{item.title}</p>
                  <p className="text-sm text-slate-200 mt-1">{item.message}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/5 border border-white/10 rounded-xl p-5"
          >
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" /> Today's Schedule
            </h3>
            {todayEvents.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No events today.{" "}
                <button onClick={() => navigate("/home")} className="text-purple-400 hover:underline">Add one</button>
              </div>
            ) : (
              <div className="space-y-2">
                {todayEvents.map((ev) => (
                  <div key={ev._id} className="flex items-center gap-2 text-sm">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${priorityDot[ev.priority] || "bg-gray-400"}`} />
                    <span className="font-medium truncate">{ev.title}</span>
                    <span className="text-gray-500 ml-auto shrink-0">{ev.time}</span>
                  </div>
                ))}
                <button onClick={() => navigate("/planner")} className="text-purple-400 hover:text-purple-300 text-xs mt-2 flex items-center gap-1">
                  View full planner <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            )}
          </motion.div>

          {overview?.subjectPerformance?.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="bg-white/5 border border-white/10 rounded-xl p-5"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" /> Subject Scores
              </h3>
              <div className="space-y-3">
                {overview.subjectPerformance.slice(0, 4).map((sp) => {
                  const color = sp.avgScore >= 80 ? "bg-green-500" : sp.avgScore >= 60 ? "bg-yellow-500" : "bg-red-500";
                  return (
                    <div key={sp.subject}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="truncate">{sp.subject}</span>
                        <span className="font-bold">{sp.avgScore}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.max(4, sp.avgScore)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <button onClick={() => navigate("/analytics")} className="text-purple-400 hover:text-purple-300 text-xs mt-3 flex items-center gap-1">
                Full analytics <ChevronRight className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-bold text-lg mb-4 text-gray-300">Quick Navigation</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <NavCard icon={BookOpen} label="Take a Quiz" description="Test your knowledge" path="/quiz" color="bg-purple-600" />
            <NavCard icon={BarChart2} label="Analytics" description="Track your progress" path="/analytics" color="bg-blue-600" />
            <NavCard icon={Target} label="Goal Tracker" description="Manage study goals" path="/goals" color="bg-green-600" />
            <NavCard icon={Trophy} label="Leaderboard" description="See top performers" path="/leaderboard" color="bg-yellow-600" />
            <NavCard icon={Clock} label="Study Timer" description="Pomodoro focus sessions" path="/timer" color="bg-orange-600" />
            <NavCard icon={Zap} label="Weekly Planner" description="Plan your week" path="/weekly" color="bg-indigo-600" />
            <NavCard icon={Clock} label="Holiday Request" description="Submit leave request" path="/holiday-request" color="bg-emerald-600" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
