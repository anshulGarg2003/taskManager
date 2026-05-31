import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import {
  setOverview,
  setWeeklyData,
  setSubjectData,
  setAnalyticsLoading,
} from "../redux/analyticsSlice";
import {
  BarChart2,
  TrendingUp,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  Star,
  BookOpen,
} from "lucide-react";

// ── Simple bar chart using divs ───────────────────────────────────────────────
function BarChart({ data, valueKey, labelKey, color = "bg-purple-500", max }) {
  const chartMax = max || Math.max(...data.map((d) => d[valueKey] || 0), 1);
  return (
    <div className="flex items-end gap-2 h-32">
      {data.map((d, i) => {
        const height = chartMax > 0 ? Math.max(4, (d[valueKey] / chartMax) * 100) : 4;
        return (
          <div key={i} className="flex flex-col items-center flex-1 gap-1">
            <span className="text-xs text-gray-400">{d[valueKey] ?? "-"}</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              className={`w-full rounded-t-md ${color} min-h-1`}
              style={{ height: `${height}%` }}
            />
            <span className="text-xs text-gray-500 truncate w-full text-center">
              {d[labelKey]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color = "text-purple-400", delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center gap-4"
    >
      <div className={`p-3 rounded-full bg-white/10 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-gray-400 text-xs">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </motion.div>
  );
}

// ── Subject performance row ───────────────────────────────────────────────────
function SubjectRow({ subject, avgScore, attempts, delay }) {
  const bar = Math.max(4, avgScore);
  const color =
    avgScore >= 80 ? "bg-green-500" : avgScore >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <span className="text-sm w-36 shrink-0 truncate">{subject}</span>
      <div className="flex-1 bg-gray-700 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color} transition-all`}
          style={{ width: `${bar}%` }}
        />
      </div>
      <span className="text-sm font-bold w-12 text-right">{avgScore}%</span>
      <span className="text-xs text-gray-500 w-16 text-right">{attempts} attempt{attempts !== 1 ? "s" : ""}</span>
    </motion.div>
  );
}

export default function AnalyticsDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);
  const { overview, weeklyData, loading } = useSelector((s) => s.analytics);
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (!userInfo.id) return;
    dispatch(setAnalyticsLoading(true));

    Promise.all([
      fetch(`${BASIC_URL}/api/analytics/overview/${userInfo.id}`).then((r) => r.json()),
      fetch(`${BASIC_URL}/api/analytics/weekly/${userInfo.id}`).then((r) => r.json()),
    ])
      .then(([ov, wk]) => {
        dispatch(setOverview(ov));
        dispatch(setWeeklyData(wk));
        dispatch(setAnalyticsLoading(false));
      })
      .catch(() => dispatch(setAnalyticsLoading(false)));
  }, [userInfo.id, dispatch]);

  useEffect(() => {
    if (!userInfo.id || !selectedSubject) return;
    fetch(`${BASIC_URL}/api/analytics/subject/${userInfo.id}?subject=${selectedSubject}`)
      .then((r) => r.json())
      .then((data) => dispatch(setSubjectData(data)));
  }, [selectedSubject, userInfo.id, dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white flex items-center justify-center">
        <div className="text-xl animate-pulse">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <BarChart2 className="w-8 h-8 text-purple-400" />
          <div>
            <h1 className="text-3xl font-extrabold">Performance Analytics</h1>
            <p className="text-gray-400 text-sm">Track your academic progress</p>
          </div>
        </motion.div>

        {!overview && (
          <div className="text-center py-16 text-gray-400">
            <BarChart2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No data yet.</p>
            <p className="text-sm mt-2">Start taking quizzes and logging study sessions to see your analytics.</p>
          </div>
        )}

        {overview && (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                icon={BarChart2}
                label="Avg Quiz Score"
                value={`${overview.avgScore}%`}
                color="text-purple-400"
                delay={0}
              />
              <StatCard
                icon={Clock}
                label="Total Study Hours"
                value={`${overview.totalStudyHours}h`}
                color="text-blue-400"
                delay={0.1}
              />
              <StatCard
                icon={Zap}
                label="Current Streak"
                value={`${overview.currentStreak}d`}
                sub="consecutive days"
                color="text-orange-400"
                delay={0.2}
              />
              <StatCard
                icon={BookOpen}
                label="Quizzes Done"
                value={overview.totalQuizzes}
                color="text-green-400"
                delay={0.3}
              />
            </div>

            {/* Weak Subjects Alert */}
            {overview.weakSubjects?.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/30 border border-red-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
              >
                <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-red-300">Subjects needing attention</p>
                  <p className="text-sm text-gray-300 mt-1">
                    You're scoring below 50% in:{" "}
                    <span className="text-red-300 font-medium">
                      {overview.weakSubjects.join(", ")}
                    </span>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Focus more study time and practice quizzes in these subjects.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Strong subjects */}
            {overview.subjectPerformance?.filter((s) => s.avgScore >= 80).length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-green-900/30 border border-green-500/30 rounded-xl p-4 mb-6 flex items-start gap-3"
              >
                <Star className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-green-300">Strong subjects</p>
                  <p className="text-sm text-gray-300 mt-1">
                    {overview.subjectPerformance
                      .filter((s) => s.avgScore >= 80)
                      .map((s) => s.subject)
                      .join(", ")}
                  </p>
                </div>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Weekly quiz scores */}
              {weeklyData?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" /> Weekly Quiz Scores
                  </h3>
                  <BarChart
                    data={weeklyData.map((d) => ({ ...d, avgScore: d.avgScore ?? 0 }))}
                    valueKey="avgScore"
                    labelKey="day"
                    color="bg-purple-500"
                    max={100}
                  />
                </motion.div>
              )}

              {/* Weekly study hours */}
              {weeklyData?.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-5"
                >
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-400" /> Daily Study Hours
                  </h3>
                  <BarChart
                    data={weeklyData}
                    valueKey="studyHours"
                    labelKey="day"
                    color="bg-blue-500"
                  />
                </motion.div>
              )}
            </div>

            {/* Subject-wise performance */}
            {overview.subjectPerformance?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6"
              >
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400" /> Subject Performance
                </h3>
                <div className="space-y-4">
                  {overview.subjectPerformance.map((sp, i) => (
                    <SubjectRow
                      key={sp.subject}
                      subject={sp.subject}
                      avgScore={sp.avgScore}
                      attempts={sp.attempts}
                      delay={i * 0.05}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Study hours by subject */}
            {overview.studyHoursPerSubject?.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6"
              >
                <h3 className="font-bold text-lg mb-5">Study Hours by Subject</h3>
                <div className="space-y-3">
                  {overview.studyHoursPerSubject.map((s, i) => {
                    const maxHrs = Math.max(...overview.studyHoursPerSubject.map((x) => x.hours));
                    const pct = maxHrs > 0 ? Math.max(4, (s.hours / maxHrs) * 100) : 4;
                    return (
                      <motion.div
                        key={s.subject}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3"
                      >
                        <span className="text-sm w-36 shrink-0 truncate">{s.subject}</span>
                        <div className="flex-1 bg-gray-700 rounded-full h-3">
                          <div
                            className="h-3 rounded-full bg-blue-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-16 text-right">{s.hours}h</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* AI Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/30 rounded-xl p-5"
            >
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" /> AI Study Recommendations
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {overview.weakSubjects?.map((sub) => (
                  <li key={sub} className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <span>
                      Practice more quizzes in <strong className="text-white">{sub}</strong> — your score is below 50%.
                      Try to study this subject for at least 2 hours today.
                    </span>
                  </li>
                ))}
                {overview.currentStreak < 3 && (
                  <li className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-yellow-400 mt-0.5 shrink-0" />
                    <span>
                      Build a daily study habit. Study every day to maintain a streak — even 30 minutes counts!
                    </span>
                  </li>
                )}
                {overview.totalStudyHours < 10 && (
                  <li className="flex items-start gap-2">
                    <Clock className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
                    <span>
                      You've studied {overview.totalStudyHours} hours total. Aim for at least 3–4 hours per day for optimal preparation.
                    </span>
                  </li>
                )}
                {overview.weakSubjects?.length === 0 && overview.totalStudyHours >= 10 && (
                  <li className="flex items-start gap-2">
                    <Star className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    <span>Great performance! Keep revising strong subjects and challenge yourself with harder quizzes.</span>
                  </li>
                )}
              </ul>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
