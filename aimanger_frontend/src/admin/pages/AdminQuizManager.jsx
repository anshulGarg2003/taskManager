import { useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../../utlis/API_calls";
import toast from "react-hot-toast";
import { Plus, Trash2, BookOpen } from "lucide-react";

const emptyQuestion = () => ({
  questionText: "",
  options: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  explanation: "",
  difficulty: "Medium",
  marks: 1,
});

export default function AdminQuizManager() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    subject: "",
    chapter: "",
    description: "",
    duration: 30,
    difficulty: "Medium",
    grade: "",
  });
  const [questions, setQuestions] = useState([emptyQuestion()]);

  const updateQuestion = (qi, field, value) => {
    setQuestions((qs) =>
      qs.map((q, i) => (i === qi ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (qi, oi, field, value) => {
    setQuestions((qs) =>
      qs.map((q, i) =>
        i === qi
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === oi
                  ? { ...opt, [field]: value }
                  : field === "isCorrect" && value === true
                  ? { ...opt, isCorrect: false } // deselect others on correct answer
                  : opt
              ),
            }
          : q
      )
    );
  };

  const addQuestion = () => setQuestions((qs) => [...qs, emptyQuestion()]);
  const removeQuestion = (qi) =>
    setQuestions((qs) => qs.filter((_, i) => i !== qi));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
      return toast.error("Not authorized");
    }
    if (questions.length === 0) return toast.error("Add at least one question");
    for (const [i, q] of questions.entries()) {
      if (!q.questionText.trim()) return toast.error(`Question ${i + 1} is empty`);
      if (!q.options.some((o) => o.isCorrect)) {
        return toast.error(`Question ${i + 1} has no correct answer`);
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASIC_URL}/api/quiz/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, questions, createdBy: userInfo.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Quiz created successfully!");
      setForm({ title: "", subject: "", chapter: "", description: "", duration: 30, difficulty: "Medium", grade: "" });
      setQuestions([emptyQuestion()]);
    } catch {
      toast.error("Failed to create quiz");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <BookOpen className="w-7 h-7 text-purple-400" />
          <h1 className="text-2xl font-extrabold">Create Quiz</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Quiz metadata */}
          <div className="bg-gray-800 rounded-xl p-5 space-y-4">
            <h2 className="font-bold text-lg">Quiz Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                required
                placeholder="Quiz Title"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              />
              <input
                placeholder="Description (optional)"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
              <select
                required
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              >
                <option value="">Select Subject</option>
                <option>Mathematics</option>
                <option>Physics</option>
                <option>Physical Chemistry</option>
              </select>
              <input
                required
                placeholder="Chapter"
                className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                value={form.chapter}
                onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))}
              />
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Duration (minutes)</label>
                <input
                  type="number"
                  min="5"
                  max="180"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2"
                  value={form.duration}
                  onChange={(e) => setForm((f) => ({ ...f, duration: +e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <select
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  value={form.difficulty}
                  onChange={(e) => setForm((f) => ({ ...f, difficulty: e.target.value }))}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
                <select
                  className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2"
                  value={form.grade}
                  onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                >
                  <option value="">All Grades</option>
                  <option value="11th">11th</option>
                  <option value="12th">12th</option>
                </select>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            {questions.map((q, qi) => (
              <motion.div
                key={qi}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-800 rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Question {qi + 1}</h3>
                  <div className="flex gap-2 items-center">
                    <select
                      className="bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm"
                      value={q.difficulty}
                      onChange={(e) => updateQuestion(qi, "difficulty", e.target.value)}
                    >
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="w-16 bg-gray-700 border border-gray-600 rounded-lg px-2 py-1 text-sm text-center"
                      value={q.marks}
                      onChange={(e) => updateQuestion(qi, "marks", +e.target.value)}
                      title="Marks"
                    />
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <textarea
                  required
                  placeholder="Question text..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 mb-4 resize-none"
                  rows={2}
                  value={q.questionText}
                  onChange={(e) => updateQuestion(qi, "questionText", e.target.value)}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name={`correct-${qi}`}
                        checked={opt.isCorrect}
                        onChange={() => updateOption(qi, oi, "isCorrect", true)}
                        className="w-4 h-4 accent-green-500"
                        title="Mark as correct"
                      />
                      <input
                        required
                        placeholder={`Option ${["A", "B", "C", "D"][oi]}`}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-sm"
                        value={opt.text}
                        onChange={(e) => updateOption(qi, oi, "text", e.target.value)}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  ◉ Select the radio button next to the correct option.
                </p>

                <input
                  placeholder="Explanation (optional)"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-sm"
                  value={q.explanation}
                  onChange={(e) => updateQuestion(qi, "explanation", e.target.value)}
                />
              </motion.div>
            ))}

            <button
              type="button"
              onClick={addQuestion}
              className="w-full border-2 border-dashed border-gray-600 hover:border-purple-500 rounded-xl py-4 text-gray-400 hover:text-purple-400 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add Question
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 py-3 rounded-xl font-bold text-lg"
          >
            {loading ? "Creating..." : `Create Quiz (${questions.length} questions)`}
          </motion.button>
        </form>
      </div>
    </div>
  );
}
