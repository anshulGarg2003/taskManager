import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import toast from "react-hot-toast";
import { Target, Plus, Trash2, CheckCircle, Clock, TrendingUp, Flame } from "lucide-react";

const GOAL_TYPE_LABELS = {
  "study-hours": "Study Hours",
  "quiz-score": "Quiz Score (%)",
  "chapter-completion": "Chapters Completed",
  streak: "Day Streak",
  custom: "Custom",
};

const STATUS_COLORS = {
  active: "border-blue-500/30 bg-blue-900/20",
  completed: "border-green-500/30 bg-green-900/20",
  failed: "border-red-500/30 bg-red-900/20",
  paused: "border-gray-500/30 bg-gray-800/30",
};

const PRIORITY_BADGE = {
  high: "bg-red-500/20 text-red-300",
  medium: "bg-yellow-500/20 text-yellow-300",
  low: "bg-green-500/20 text-green-300",
};

function ProgressRing({ percentage, size = 80 }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ - (percentage / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#374151" strokeWidth={6} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#a855f7"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: dash }}
        transition={{ duration: 1 }}
      />
    </svg>
  );
}

function AddGoalModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    goalType: "study-hours",
    targetValue: "",
    unit: "hours",
    deadline: "",
    priority: "medium",
  });

  const unitMap = {
    "study-hours": "hours",
    "quiz-score": "%",
    "chapter-completion": "chapters",
    streak: "days",
    custom: "",
  };

  const handleTypeChange = (type) => {
    setForm((f) => ({ ...f, goalType: type, unit: unitMap[type] || "" }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(form);
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
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gray-800 border border-white/10 rounded-2xl p-6 w-full max-w-md text-white"
      >
        <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
          <Target className="w-5 h-5 text-purple-400" /> Create New Goal
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            placeholder="Goal title (e.g., Score 90% in Physics)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <input
            placeholder="Description (optional)"
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Goal Type</label>
              <select
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.goalType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {Object.entries(GOAL_TYPE_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Target ({form.unit})</label>
              <input
                required
                type="number"
                min="1"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.targetValue}
                onChange={(e) => setForm((f) => ({ ...f, targetValue: +e.target.value }))}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Subject (optional)</label>
              <input
                placeholder="e.g. Physics"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Deadline</label>
              <input
                type="date"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                value={form.deadline}
                onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))}
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
            <button type="button" onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg font-semibold">
              Create Goal
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function GoalCard({ goal, onDelete, onUpdateProgress }) {
  const pct = Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100));
  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status === "active";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`border rounded-xl p-5 ${STATUS_COLORS[goal.status]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg">{goal.title}</h3>
            <span className={`text-xs px-2 py-0.5 rounded-full ${PRIORITY_BADGE[goal.priority]}`}>
              {goal.priority}
            </span>
            {goal.subject && (
              <span className="text-xs bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded-full">
                {goal.subject}
              </span>
            )}
            {isOverdue && (
              <span className="text-xs bg-red-600/30 text-red-300 px-2 py-0.5 rounded-full">
                Overdue
              </span>
            )}
          </div>
          {goal.description && (
            <p className="text-gray-400 text-sm mt-1">{goal.description}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {GOAL_TYPE_LABELS[goal.goalType]}
            {goal.deadline && ` · Due: ${goal.deadline}`}
          </p>
        </div>
        <div className="relative shrink-0 ml-3">
          <ProgressRing percentage={pct} />
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold rotate-90">
            {pct}%
          </span>
        </div>
      </div>

      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-xs text-gray-400">
          <span>Progress</span>
          <span>
            {goal.currentValue} / {goal.targetValue} {goal.unit}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              goal.status === "completed"
                ? "bg-green-500"
                : goal.status === "failed"
                ? "bg-red-500"
                : "bg-purple-500"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {goal.status === "active" && (
        <div className="flex gap-2 mt-3">
          <input
            type="number"
            min="0"
            max={goal.targetValue}
            defaultValue={goal.currentValue}
            className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm"
            id={`progress-${goal._id}`}
          />
          <button
            onClick={() => {
              const val = parseFloat(document.getElementById(`progress-${goal._id}`).value);
              onUpdateProgress(goal._id, val);
            }}
            className="bg-purple-600 hover:bg-purple-700 px-3 py-1.5 rounded-lg text-sm font-semibold"
          >
            Update
          </button>
          <button
            onClick={() => onDelete(goal._id)}
            className="bg-red-600/30 hover:bg-red-600/50 p-1.5 rounded-lg text-red-400"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {goal.status === "completed" && (
        <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" /> Completed!
        </div>
      )}
    </motion.div>
  );
}

export default function GoalTracker() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState("active");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/"); return; }
  }, [isAuthenticated, navigate]);

  const fetchGoals = () => {
    if (!userInfo.id) return;
    setLoading(true);
    fetch(`${BASIC_URL}/api/goals/${userInfo.id}?status=${filter}`)
      .then((r) => r.json())
      .then((data) => { setGoals(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(fetchGoals, [userInfo.id, filter]);

  const handleAddGoal = async (formData) => {
    try {
      const res = await fetch(`${BASIC_URL}/api/goals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, userId: userInfo.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Goal created!");
      fetchGoals();
    } catch {
      toast.error("Failed to create goal");
    }
  };

  const handleUpdateProgress = async (goalId, value) => {
    try {
      const res = await fetch(`${BASIC_URL}/api/goals/${goalId}/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue: value }),
      });
      const data = await res.json();
      if (data.goal.status === "completed") toast.success("🎉 Goal completed!");
      else toast.success("Progress updated!");
      fetchGoals();
    } catch {
      toast.error("Failed to update progress");
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await fetch(`${BASIC_URL}/api/goals/${goalId}`, { method: "DELETE" });
      toast.success("Goal deleted");
      fetchGoals();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const active = goals.filter((g) => g.status === "active").length;
  const completed = goals.filter((g) => g.status === "completed").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-400" />
            <div>
              <h1 className="text-3xl font-extrabold">Goal Tracker</h1>
              <p className="text-gray-400 text-sm">
                {active} active · {completed} completed
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-full font-semibold flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Goal
          </motion.button>
        </motion.div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["active", "completed", "failed", "paused"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize transition-all ${
                filter === s
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 text-gray-300 hover:bg-white/20"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400 animate-pulse">Loading goals...</div>
        )}

        {!loading && goals.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No {filter} goals.</p>
            {filter === "active" && (
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-purple-400 hover:text-purple-300 underline"
              >
                Create your first goal
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <GoalCard
              key={goal._id}
              goal={goal}
              onDelete={handleDelete}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <AddGoalModal onClose={() => setShowModal(false)} onAdd={handleAddGoal} />
        )}
      </AnimatePresence>
    </div>
  );
}
