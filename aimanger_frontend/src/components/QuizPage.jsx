import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BASIC_URL } from "../utlis/API_calls";
import {
  setAvailableQuizzes,
  setCurrentQuiz,
  setAnswer,
  setLastResult,
  setLoading,
  clearQuiz,
} from "../redux/quizSlice";
import {
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Trophy,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";

// ── Quiz List ─────────────────────────────────────────────────────────────────
function QuizList({ onStart }) {
  const dispatch = useDispatch();
  const { availableQuizzes, loading } = useSelector((s) => s.quiz);
  const userInfo = useSelector((s) => s.user);
  const [filter, setFilter] = useState({ subject: "", difficulty: "" });

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter.subject) params.set("subject", filter.subject);
    if (filter.difficulty) params.set("difficulty", filter.difficulty);
    if (userInfo.grade) params.set("grade", userInfo.grade);

    dispatch(setLoading(true));
    fetch(`${BASIC_URL}/api/quiz?${params}`)
      .then((r) => r.json())
      .then((data) => {
        dispatch(setAvailableQuizzes(Array.isArray(data) ? data : []));
        dispatch(setLoading(false));
      })
      .catch(() => {
        dispatch(setLoading(false));
        toast.error("Failed to load quizzes");
      });
  }, [filter, dispatch, userInfo.grade]);

  const diffColor = { Easy: "text-green-400", Medium: "text-yellow-400", Hard: "text-red-400" };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-8"
        >
          <BookOpen className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-extrabold">Quiz & Assessments</h1>
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
            value={filter.difficulty}
            onChange={(e) => setFilter((f) => ({ ...f, difficulty: e.target.value }))}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {loading && (
          <div className="text-center py-12 text-gray-400">Loading quizzes...</div>
        )}

        {!loading && availableQuizzes.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 text-gray-400"
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p className="text-xl">No quizzes available yet.</p>
            <p className="text-sm mt-2">Ask your teacher to create some quizzes.</p>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableQuizzes.map((quiz, i) => (
            <motion.div
              key={quiz._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-5 hover:border-purple-400/50 transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg">{quiz.title}</h3>
                <span className={`text-sm font-semibold ${diffColor[quiz.difficulty]}`}>
                  {quiz.difficulty}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-1">{quiz.subject} · {quiz.chapter}</p>
              {quiz.description && (
                <p className="text-gray-300 text-sm mb-3">{quiz.description}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {quiz.duration} min
                  </span>
                  <span>{quiz.questions?.length || 0} questions</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onStart(quiz._id)}
                  className="bg-purple-600 hover:bg-purple-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1"
                >
                  Start <ChevronRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Active Quiz ───────────────────────────────────────────────────────────────
function ActiveQuiz({ onSubmit, onExit }) {
  const dispatch = useDispatch();
  const { currentQuiz, currentAnswers } = useSelector((s) => s.quiz);
  const [current, setCurrent] = useState(0);
  const [timeLeft, setTimeLeft] = useState(currentQuiz?.duration * 60 || 1800);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (timeLeft <= 0) {
      onSubmit(Math.round((Date.now() - startTime) / 1000));
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const question = currentQuiz.questions[current];
  const answered = currentAnswers.filter((a) => a.selectedOption !== null).length;
  const progress = ((current + 1) / currentQuiz.questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="font-bold text-xl">{currentQuiz.title}</h2>
            <p className="text-gray-400 text-sm">{currentQuiz.subject} · {currentQuiz.chapter}</p>
          </div>
          <div className={`flex items-center gap-2 text-lg font-mono font-bold ${timeLeft < 120 ? "text-red-400 animate-pulse" : "text-green-400"}`}>
            <Clock className="w-5 h-5" />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
          <div
            className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Question {current + 1} of {currentQuiz.questions.length} · {answered} answered
        </p>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white/10 backdrop-blur border border-white/10 rounded-xl p-6 mb-6"
          >
            <p className="text-lg font-semibold mb-6">
              {current + 1}. {question.questionText}
            </p>
            <div className="grid gap-3">
              {question.options.map((opt, idx) => {
                const selected = currentAnswers[current]?.selectedOption === idx;
                return (
                  <motion.button
                    key={idx}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => dispatch(setAnswer({ questionIndex: current, selectedOption: idx }))}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selected
                        ? "bg-purple-600/50 border-purple-400 text-white"
                        : "bg-gray-800/50 border-gray-600 hover:border-gray-400 text-gray-300"
                    }`}
                  >
                    <span className="font-bold mr-2 text-purple-300">
                      {["A", "B", "C", "D"][idx]}.
                    </span>
                    {opt.text}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
            disabled={current === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 disabled:opacity-30"
          >
            <ArrowLeft className="w-4 h-4" /> Previous
          </button>

          {/* Question dots */}
          <div className="flex gap-1 flex-wrap justify-center max-w-xs">
            {currentQuiz.questions.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all ${
                  i === current
                    ? "bg-purple-600 text-white"
                    : currentAnswers[i]?.selectedOption !== null
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-400"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {current < currentQuiz.questions.length - 1 ? (
            <button
              onClick={() => setCurrent((c) => c + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSubmit(Math.round((Date.now() - startTime) / 1000))}
              className="flex items-center gap-2 px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 font-bold"
            >
              Submit <CheckCircle className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        <button
          onClick={onExit}
          className="mt-4 text-xs text-gray-500 hover:text-gray-300 underline"
        >
          Exit quiz
        </button>
      </div>
    </div>
  );
}

// ── Results Screen ────────────────────────────────────────────────────────────
function ResultScreen({ onRetry, onBack }) {
  const { lastResult } = useSelector((s) => s.quiz);
  const [showReview, setShowReview] = useState(false);

  if (!lastResult) return null;

  const { score, totalMarks, percentage, questions } = lastResult;
  const grade =
    percentage >= 90 ? "A+" : percentage >= 80 ? "A" : percentage >= 70 ? "B" : percentage >= 60 ? "C" : "D";
  const gradeColor =
    percentage >= 80 ? "text-green-400" : percentage >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/10 backdrop-blur border border-white/10 rounded-2xl p-8 text-center mb-6"
        >
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-3xl font-extrabold mb-2">Quiz Completed!</h2>
          <div className={`text-6xl font-black mb-2 ${gradeColor}`}>{grade}</div>
          <p className="text-2xl">
            {score} / {totalMarks}
          </p>
          <p className="text-gray-400 mt-1">{percentage}% correct</p>

          <div className="flex gap-4 justify-center mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowReview(!showReview)}
              className="bg-purple-600 hover:bg-purple-700 px-5 py-2 rounded-full font-semibold"
            >
              {showReview ? "Hide Review" : "Review Answers"}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onBack}
              className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-full font-semibold"
            >
              Back to Quizzes
            </motion.button>
          </div>
        </motion.div>

        {/* Answer Review */}
        {showReview && questions && (
          <div className="space-y-4">
            {questions.map((q, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white/5 border rounded-xl p-4 ${
                  q.isCorrect ? "border-green-500/30" : "border-red-500/30"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {q.isCorrect ? (
                    <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <p className="font-medium">
                    {i + 1}. {q.questionText}
                  </p>
                </div>
                <div className="grid gap-2 pl-7">
                  {q.options.map((opt, j) => (
                    <div
                      key={j}
                      className={`p-2 rounded-lg text-sm ${
                        j === q.correctOption
                          ? "bg-green-600/30 text-green-300"
                          : j === q.selectedOption && !q.isCorrect
                          ? "bg-red-600/30 text-red-300"
                          : "text-gray-400"
                      }`}
                    >
                      {["A", "B", "C", "D"][j]}. {opt}
                      {j === q.correctOption && " ✓"}
                      {j === q.selectedOption && j !== q.correctOption && " ✗"}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-3 pl-7 text-sm text-blue-300 italic">
                    💡 {q.explanation}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main QuizPage Component ───────────────────────────────────────────────────
export default function QuizPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((s) => s.user);
  const { currentQuiz, currentAnswers, lastResult } = useSelector((s) => s.quiz);

  useEffect(() => {
    if (!isAuthenticated) navigate("/");
  }, [isAuthenticated, navigate]);

  const handleStart = async (quizId) => {
    try {
      const res = await fetch(`${BASIC_URL}/api/quiz/${quizId}`);
      const data = await res.json();
      dispatch(setCurrentQuiz(data));
    } catch {
      toast.error("Failed to load quiz");
    }
  };

  const handleSubmit = async (timeTaken) => {
    try {
      const answers = currentAnswers || [];
      const res = await fetch(`${BASIC_URL}/api/quiz/${currentQuiz._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userInfo.id, answers, timeTaken }),
      });

      if (!res.ok) {
        throw new Error("Failed to submit quiz");
      }

      const result = await res.json();
      dispatch(setLastResult(result));
      toast.success(`Quiz submitted! Score: ${result.percentage}%`);
    } catch {
      toast.error("Failed to submit quiz");
    }
  };

  const handleBack = () => dispatch(clearQuiz());

  if (lastResult) return <ResultScreen onBack={handleBack} />;
  if (currentQuiz) return <ActiveQuiz onSubmit={handleSubmit} onExit={handleBack} />;
  return <QuizList onStart={handleStart} />;
}
