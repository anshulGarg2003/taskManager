import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  PlusCircle,
  BookOpen,
  Layers3,
  Sparkles,
  Trash2,
  Pencil,
  Save,
  X,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const SUBJECTS = ["Mathematics", "Physics", "Physical Chemistry"];

const endpointBySubject = {
  Mathematics: `${BASIC_URL}/api/maths`,
  Physics: `${BASIC_URL}/api/physics`,
  "Physical Chemistry": `${BASIC_URL}/api/physicalchem`,
};

const emptySubtopic = { topic: "", difficulty: "easy", duration: "" };

const calcOverallDifficulty = (rows) => {
  const count = { easy: 0, medium: 0, hard: 0 };
  rows.forEach((row) => {
    if (count[row.difficulty] !== undefined) count[row.difficulty] += 1;
  });

  if (count.hard >= count.medium && count.hard >= count.easy) return "hard";
  if (count.medium >= count.easy) return "medium";
  return "easy";
};

const parseResponseSafely = async (res) => {
  const raw = await res.text();
  try {
    return JSON.parse(raw);
  } catch {
    return { raw };
  }
};

export default function AddChapter() {
  const navigate = useNavigate();

  const [selectedSubject, setSelectedSubject] = useState("Mathematics");
  const [chapter, setChapter] = useState("");
  const [grade, setGrade] = useState("11th");
  const [subtopics, setSubtopics] = useState([{ ...emptySubtopic }]);
  const [loading, setLoading] = useState(false);
  const [chaptersBySubject, setChaptersBySubject] = useState({
    Mathematics: [],
    Physics: [],
    "Physical Chemistry": [],
  });
  const [editingChapterId, setEditingChapterId] = useState("");

  const overallDifficulty = useMemo(() => calcOverallDifficulty(subtopics), [subtopics]);
  const currentChapters = chaptersBySubject[selectedSubject] || [];
  const isEditMode = !!editingChapterId;

  const fetchAllSubjects = async () => {
    const entries = await Promise.all(
      SUBJECTS.map(async (subject) => {
        try {
          const res = await fetch(`${endpointBySubject[subject]}/all-chapters`);
          const data = await res.json();
          return [subject, Array.isArray(data) ? data : []];
        } catch {
          return [subject, []];
        }
      })
    );

    setChaptersBySubject(Object.fromEntries(entries));
  };

  useEffect(() => {
    fetchAllSubjects();
  }, []);

  useEffect(() => {
    // Reset editor when subject changes to avoid editing wrong collection.
    setEditingChapterId("");
    setChapter("");
    setGrade("11th");
    setSubtopics([{ ...emptySubtopic }]);
  }, [selectedSubject]);

  const setSubtopicField = (index, field, value) => {
    setSubtopics((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addSubtopic = () => {
    setSubtopics((prev) => [...prev, { ...emptySubtopic }]);
  };

  const removeSubtopic = (index) => {
    setSubtopics((prev) => {
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : [{ ...emptySubtopic }];
    });
  };

  const resetForm = () => {
    setEditingChapterId("");
    setChapter("");
    setGrade("11th");
    setSubtopics([{ ...emptySubtopic }]);
  };

  const getCleanSubtopics = () => {
    return subtopics
      .map((item) => ({
        topic: item.topic.trim(),
        difficulty: item.difficulty,
        duration: Number(item.duration),
      }))
      .filter((item) => item.topic && Number.isFinite(item.duration) && item.duration > 0);
  };

  const handleCreate = async () => {
    if (!chapter.trim()) return toast.error("Please enter chapter title");

    const cleaned = getCleanSubtopics();
    if (cleaned.length < 1) {
      return toast.error("Please add at least 1 valid subtopic");
    }

    setLoading(true);
    try {
      const res = await fetch(`${endpointBySubject[selectedSubject]}/add-chapter`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: chapter.trim(),
          grade,
          overallDifficulty,
          subtopics: cleaned,
        }),
      });

      const data = await parseResponseSafely(res);
      if (!res.ok) {
        const routeHint = data?.raw?.includes("Cannot POST")
          ? "Backend route missing in running server. Restart backend once."
          : "";
        throw new Error(data.error || data.message || routeHint || "Failed to add chapter");
      }

      toast.success("Chapter added successfully");
      resetForm();
      await fetchAllSubjects();
    } catch (error) {
      toast.error(error.message || "Could not add chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingChapterId) return;
    if (!chapter.trim()) return toast.error("Please enter chapter title");

    const cleaned = getCleanSubtopics();
    if (cleaned.length < 1) {
      return toast.error("Please add at least 1 valid subtopic");
    }

    setLoading(true);
    try {
      const res = await fetch(`${endpointBySubject[selectedSubject]}/${editingChapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter: chapter.trim(),
          grade,
          overallDifficulty,
          subtopics: cleaned,
        }),
      });

      const data = await parseResponseSafely(res);
      if (!res.ok) throw new Error(data.error || data.message || "Failed to update chapter");

      toast.success("Chapter updated successfully");
      resetForm();
      await fetchAllSubjects();
    } catch (error) {
      toast.error(error.message || "Could not update chapter");
    } finally {
      setLoading(false);
    }
  };

  const loadChapterForEdit = (item) => {
    setEditingChapterId(item._id);
    setChapter(item.chapter || "");
    setGrade(item.grade || "11th");

    const mappedSubtopics = Array.isArray(item.subtopics) && item.subtopics.length
      ? item.subtopics.map((sub) => ({
          topic: sub.topic || "",
          difficulty: sub.difficulty || "easy",
          duration: sub.duration ?? "",
        }))
      : [{ ...emptySubtopic }];

    setSubtopics(mappedSubtopics);
  };

  const deleteChapter = async (chapterId) => {
    const yes = window.confirm("Delete this chapter permanently?");
    if (!yes) return;

    try {
      const res = await fetch(`${endpointBySubject[selectedSubject]}/${chapterId}`, {
        method: "DELETE",
      });
      const data = await parseResponseSafely(res);
      if (!res.ok) throw new Error(data.error || data.message || "Failed to delete chapter");

      toast.success("Chapter deleted");
      if (editingChapterId === chapterId) {
        resetForm();
      }
      await fetchAllSubjects();
    } catch (error) {
      toast.error(error.message || "Could not delete chapter");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_10%_8%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(251,191,36,0.20),transparent_30%),linear-gradient(145deg,#f8fafc,#fefce8)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" /> Chapter Planner
            </p>
            <h1 className="text-2xl font-black text-slate-900 mt-2">Add and Modify Chapters</h1>
            <p className="text-sm text-slate-600 mt-1">Click a chapter to open edit mode on the right panel.</p>

            <div className="mt-4 space-y-2">
              {SUBJECTS.map((subject) => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`w-full text-left rounded-xl border px-3 py-2 ${selectedSubject === subject ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
                >
                  <p className="font-semibold text-slate-800">{subject}</p>
                  <p className="text-xs text-slate-500">Current chapters: {chaptersBySubject[subject]?.length || 0}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
            <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
              <Layers3 className="w-5 h-5 text-indigo-600" /> Current Subject Catalog
            </h2>
            <div className="mt-3 max-h-[52vh] overflow-auto pr-1 space-y-2">
              {currentChapters.map((item) => (
                <div
                  key={item._id}
                  className={`rounded-xl border p-3 ${editingChapterId === item._id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-slate-50"}`}
                >
                  <button onClick={() => loadChapterForEdit(item)} className="w-full text-left">
                    <p className="font-semibold text-slate-800 inline-flex items-center gap-1">
                      <Pencil className="w-3.5 h-3.5" /> {item.chapter}
                    </p>
                    <p className="text-xs text-slate-500">Grade: {item.grade} • Difficulty: {item.overallDifficulty}</p>
                    <p className="text-xs text-slate-500">Subtopics: {item.subtopics?.length || 0}</p>
                  </button>
                  <button
                    onClick={() => deleteChapter(item._id)}
                    className="mt-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-600 text-white"
                  >
                    Delete Chapter
                  </button>
                </div>
              ))}
              {currentChapters.length === 0 && (
                <p className="text-sm text-slate-500">No chapters yet for this subject.</p>
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <h2 className="text-xl font-black text-slate-900 inline-flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            {isEditMode ? `Edit Chapter in ${selectedSubject}` : `Add New Chapter in ${selectedSubject}`}
          </h2>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="Chapter title"
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            />

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white"
            >
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-black text-slate-900">Subtopics</h3>
              <button
                onClick={addSubtopic}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold inline-flex items-center gap-1"
              >
                <PlusCircle className="w-4 h-4" /> Add Subtopic
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {subtopics.map((row, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center rounded-xl border border-slate-200 bg-white p-2">
                  <input
                    value={row.topic}
                    onChange={(e) => setSubtopicField(index, "topic", e.target.value)}
                    placeholder="Subtopic name"
                    className="md:col-span-6 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <select
                    value={row.difficulty}
                    onChange={(e) => setSubtopicField(index, "difficulty", e.target.value)}
                    className="md:col-span-3 p-2 rounded-lg border border-slate-300 bg-white"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  <input
                    type="number"
                    min={1}
                    value={row.duration}
                    onChange={(e) => setSubtopicField(index, "duration", e.target.value)}
                    placeholder="Minutes"
                    className="md:col-span-2 p-2 rounded-lg border border-slate-300 bg-white"
                  />
                  <button
                    onClick={() => removeSubtopic(index)}
                    className="md:col-span-1 p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 inline-flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
              Overall difficulty (auto): <span className="font-bold capitalize">{overallDifficulty}</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!isEditMode && (
              <button
                onClick={handleCreate}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center gap-1 disabled:opacity-60"
              >
                <PlusCircle className="w-4 h-4" /> {loading ? "Saving..." : "Add Chapter"}
              </button>
            )}

            {isEditMode && (
              <>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold inline-flex items-center gap-1 disabled:opacity-60"
                >
                  <Save className="w-4 h-4" /> {loading ? "Updating..." : "Save Changes"}
                </button>
                <button
                  onClick={resetForm}
                  className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold inline-flex items-center gap-1"
                >
                  <X className="w-4 h-4" /> Cancel Edit
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
