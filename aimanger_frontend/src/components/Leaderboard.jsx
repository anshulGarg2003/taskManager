import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import { Trophy, Medal, Star, User } from "lucide-react";
import { useDispatch } from "react-redux";
import { setLeaderboard, setAnalyticsLoading } from "../redux/analyticsSlice";

const RANK_STYLES = [
  "bg-gradient-to-r from-yellow-500/30 to-yellow-600/30 border-yellow-500/50",
  "bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50",
  "bg-gradient-to-r from-orange-700/20 to-orange-800/20 border-orange-700/50",
];
const RANK_ICONS = [
  <Trophy key={0} className="w-5 h-5 text-yellow-400" />,
  <Medal key={1} className="w-5 h-5 text-gray-400" />,
  <Medal key={2} className="w-5 h-5 text-orange-500" />,
];

export default function Leaderboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);
  const leaderboard = useSelector((s) => s.analytics.leaderboard);
  const loading = useSelector((s) => s.analytics.loading);
  const [filter, setFilter] = useState({ subject: "", grade: "" });

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    dispatch(setAnalyticsLoading(true));
    const params = new URLSearchParams();
    if (filter.subject) params.set("subject", filter.subject);
    if (filter.grade) params.set("grade", filter.grade);

    fetch(`${BASIC_URL}/api/analytics/leaderboard?${params}`)
      .then((r) => r.json())
      .then((data) => {
        dispatch(setLeaderboard(Array.isArray(data) ? data : []));
        dispatch(setAnalyticsLoading(false));
      })
      .catch(() => dispatch(setAnalyticsLoading(false)));
  }, [filter, dispatch]);

  const myRank = leaderboard.findIndex((u) => u.userId?.toString() === userInfo.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <Trophy className="w-8 h-8 text-yellow-400" />
          <div>
            <h1 className="text-3xl font-extrabold">Leaderboard</h1>
            <p className="text-gray-400 text-sm">Top performers by quiz average</p>
          </div>
        </motion.div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap">
          <select
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            value={filter.subject}
            onChange={(e) => setFilter((f) => ({ ...f, subject: e.target.value }))}
          >
            <option value="">All Subjects</option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Physical Chemistry">Physical Chemistry</option>
          </select>
          <select
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white"
            value={filter.grade}
            onChange={(e) => setFilter((f) => ({ ...f, grade: e.target.value }))}
          >
            <option value="">All Grades</option>
            <option value="11th">11th</option>
            <option value="12th">12th</option>
          </select>
        </div>

        {/* My rank */}
        {myRank >= 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-purple-600/30 border border-purple-500/50 rounded-xl p-4 mb-4 flex items-center gap-3"
          >
            <Star className="w-5 h-5 text-purple-300" />
            <span className="text-purple-200 font-semibold">
              Your rank: #{myRank + 1} with {leaderboard[myRank].avgPercentage}% average
            </span>
          </motion.div>
        )}

        {loading && (
          <div className="text-center py-12 text-gray-400 animate-pulse">Loading leaderboard...</div>
        )}

        {!loading && leaderboard.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Trophy className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No data yet.</p>
            <p className="text-sm mt-2">Be the first to attempt quizzes!</p>
          </div>
        )}

        <div className="space-y-3">
          {leaderboard.map((student, i) => {
            const isMe = student.userId?.toString() === userInfo.id;
            const rankStyle = i < 3 ? RANK_STYLES[i] : "bg-white/5 border-white/10";
            return (
              <motion.div
                key={student.userId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-4 border rounded-xl p-4 ${rankStyle} ${
                  isMe ? "ring-2 ring-purple-500" : ""
                }`}
              >
                {/* Rank */}
                <div className="w-8 text-center font-bold shrink-0">
                  {i < 3 ? RANK_ICONS[i] : <span className="text-gray-400">#{i + 1}</span>}
                </div>

                {/* Avatar */}
                {student.picture ? (
                  <img
                    src={student.picture}
                    alt={student.name}
                    className="w-10 h-10 rounded-full border-2 border-white/20 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-purple-600/50 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold truncate ${isMe ? "text-purple-300" : ""}`}>
                      {student.name} {isMe && "(You)"}
                    </span>
                    {student.grade && (
                      <span className="text-xs bg-gray-700 px-2 py-0.5 rounded-full text-gray-400">
                        {student.grade}
                      </span>
                    )}
                  </div>
                  {student.school && (
                    <p className="text-xs text-gray-500 truncate">{student.school}</p>
                  )}
                </div>

                {/* Stats */}
                <div className="text-right shrink-0">
                  <div className="font-bold text-xl text-purple-300">
                    {student.avgPercentage}%
                  </div>
                  <div className="text-xs text-gray-400">
                    {student.attempts} quiz{student.attempts !== 1 ? "zes" : ""}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
