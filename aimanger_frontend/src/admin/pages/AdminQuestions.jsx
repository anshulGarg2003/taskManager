import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusCircle,
  Search,
  BookCopy,
  ListChecks,
  Filter,
  Sparkles,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const SUBJECTS = ["Mathematics", "Physics", "Physical Chemistry"];

const chapterRouteBySubject = {
  Mathematics: `${BASIC_URL}/api/maths/all-chapters`,
  Physics: `${BASIC_URL}/api/physics/all-chapters`,
  "Physical Chemistry": `${BASIC_URL}/api/physicalchem/all-chapters`,
};

export default function AdminQuestions() {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [subject, setSubject] = useState("Mathematics");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [question, setQuestion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("All");
  const [chaptersBySubject, setChaptersBySubject] = useState({
    Mathematics: [],
    Physics: [],
    "Physical Chemistry": [],
  });

  const fetchQuestions = async () => {
    try {
      const res = await fetch(`${BASIC_URL}/api/questions`);
      const data = await res.json();
      setQuestions(Array.isArray(data) ? data : []);
    } catch {
      setQuestions([]);
    }
  };

  const fetchChapters = async () => {
    const entries = await Promise.all(
      SUBJECTS.map(async (sub) => {
        try {
          const res = await fetch(chapterRouteBySubject[sub]);
          const data = await res.json();
          const chapters = Array.isArray(data)
            ? data
                .map((item) => item.chapter)
                .filter(Boolean)
                .sort((a, b) => a.localeCompare(b))
            : [];
          return [sub, chapters];
        } catch {
          return [sub, []];
        }
      })
    );

    setChaptersBySubject(Object.fromEntries(entries));
  };

  useEffect(() => {
    fetchQuestions();
    fetchChapters();
  }, []);

  useEffect(() => {
    const currentSubjectChapters = chaptersBySubject[subject] || [];
    if (currentSubjectChapters.length > 0 && !currentSubjectChapters.includes(chapter)) {
      setChapter(currentSubjectChapters[0]);
    }
    if (currentSubjectChapters.length === 0) {
      setChapter("");
    }
  }, [subject, chaptersBySubject, chapter]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userInfo.id) return toast.error("Login first to add question");

    if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
      return toast.error("You are not authorized to add question");
    }

    if (!chapter) {
      return toast.error("Please create/select a chapter first");
    }

    setLoading(true);
    try {
      const response = await fetch(`${BASIC_URL}/api/questions/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userInfo.id,
          subject,
          chapter,
          difficulty,
          question,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Failed to add question");
      }

      toast.success("Question added successfully");
      setQuestion("");
      await fetchQuestions();
    } catch (error) {
      toast.error(error.message || "Error adding question");
    } finally {
      setLoading(false);
    }
  };

  const subjectStats = useMemo(() => {
    return SUBJECTS.map((sub) => ({
      subject: sub,
      count: questions.filter((q) => q.subject === sub).length,
    }));
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchesSubject = subjectFilter === "All" || q.subject === subjectFilter;
      const qText = `${q.question || ""} ${q.chapter || ""} ${q.difficulty || ""}`.toLowerCase();
      const matchesSearch = !searchTerm || qText.includes(searchTerm.toLowerCase());
      return matchesSubject && matchesSearch;
    });
  }, [questions, subjectFilter, searchTerm]);

  const deleteQuestion = async (questionId) => {
    const yes = window.confirm("Delete this question permanently?");
    if (!yes) return;

    try {
      const response = await fetch(`${BASIC_URL}/api/questions/${questionId}`, {
        method: "DELETE",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Failed to delete question");

      toast.success("Question deleted");
      setQuestions((prev) => prev.filter((item) => item._id !== questionId));
    } catch (error) {
      toast.error(error.message || "Could not delete question");
    }
  };

  if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700 font-semibold">Only teachers/admin can access Question Bank.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_14%_8%,rgba(59,130,246,0.20),transparent_32%),radial-gradient(circle_at_86%_12%,rgba(16,185,129,0.20),transparent_30%),linear-gradient(140deg,#f8fafc,#f0fdfa)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Teacher Question Bank
            </p>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Create Questions</h1>
            <p className="text-sm text-slate-600 mt-1">Add questions and instantly see current inventory by subject.</p>

            <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                {(chaptersBySubject[subject] || []).length === 0 && <option value="">No chapters found</option>}
                {(chaptersBySubject[subject] || []).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>

              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>

              <textarea
                rows={5}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Type your question"
                className="w-full p-3 rounded-xl border border-slate-300 bg-white"
                required
              />

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-3 py-2 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <PlusCircle className="w-4 h-4" /> {loading ? "Adding..." : "Add Question"}
                </button>
              </div>
            </form>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
            <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
              <BookCopy className="w-5 h-5 text-emerald-600" /> Current Questions by Subject
            </h2>
            <div className="mt-3 space-y-2">
              {subjectStats.map((item) => (
                <div key={item.subject} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">{item.subject}</span>
                  <span className="text-sm font-black text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <div className="flex flex-wrap gap-2 items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 inline-flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-indigo-600" /> Question Inventory
            </h2>

            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search question/chapter"
                  className="pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                />
              </div>

              <div className="relative">
                <Filter className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="All">All Subjects</option>
                  {SUBJECTS.map((sub) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-3 max-h-[70vh] overflow-auto pr-1 space-y-2">
            {filteredQuestions.map((q) => (
              <div key={q._id} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500">{q.subject} • {q.chapter} • {q.difficulty}</p>
                <p className="text-sm text-slate-800 mt-1">{q.question}</p>
                <p className="text-[11px] text-slate-400 mt-1">By: {q.FacultyId?.name || "Faculty"}</p>
                <button
                  onClick={() => deleteQuestion(q._id)}
                  className="mt-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white"
                >
                  Delete Question
                </button>
              </div>
            ))}

            {filteredQuestions.length === 0 && (
              <p className="text-sm text-slate-500">No questions found for this filter.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
