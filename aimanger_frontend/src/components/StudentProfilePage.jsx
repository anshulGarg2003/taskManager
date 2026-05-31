import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { BASIC_URL } from "../utlis/API_calls";
import { setUserInfo } from "../redux/userSlice";
import { Save, UserRound, School, Phone, BookOpenText } from "lucide-react";

const StudentProfilePage = () => {
  const userInfo = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    school: "",
    grade: "",
    bio: "",
    subjectsText: "",
  });

  const isTeacherRole = userInfo?.role === "teacher" || userInfo?.role === "admin";

  useEffect(() => {
    if (isTeacherRole) {
      navigate("/profile/teacher", { replace: true });
      return;
    }

    setForm({
      name: userInfo?.name || "",
      phone: userInfo?.phone || "",
      school: userInfo?.school || "",
      grade: userInfo?.grade || "",
      bio: userInfo?.bio || "",
      subjectsText: Array.isArray(userInfo?.subjects) ? userInfo.subjects.join(", ") : "",
    });
  }, [userInfo, isTeacherRole, navigate]);

  const cleanSubjects = useMemo(
    () =>
      form.subjectsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [form.subjectsText]
  );

  const handleSave = async (event) => {
    event.preventDefault();

    if (!userInfo?.id) {
      toast.error("Please login first");
      return;
    }

    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`${BASIC_URL}/api/users/${userInfo.id}/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          school: form.school,
          grade: form.grade,
          bio: form.bio,
          subjects: cleanSubjects,
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error || "Failed to update student profile");
      }

      dispatch(setUserInfo(result));
      toast.success("Student profile updated");
    } catch (error) {
      toast.error(error.message || "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(249,115,22,0.18),transparent_30%),linear-gradient(130deg,#f8fafc,#ecfeff)]">
      <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
          <UserRound className="w-3.5 h-3.5" /> Student Profile
        </p>
        <h1 className="text-3xl font-black text-slate-900 mt-2">Update Student Details</h1>
        <p className="text-slate-600 text-sm mt-1">Keep your details current for better personalization across planners, quizzes, and analytics.</p>

        <form onSubmit={handleSave} className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
              <Phone className="w-4 h-4" /> Phone
            </label>
            <input
              value={form.phone}
              onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Contact number"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Grade</label>
            <input
              value={form.grade}
              onChange={(e) => setForm((prev) => ({ ...prev, grade: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="11th / 12th"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
              <School className="w-4 h-4" /> School
            </label>
            <input
              value={form.school}
              onChange={(e) => setForm((prev) => ({ ...prev, school: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="School name"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 inline-flex items-center gap-1">
              <BookOpenText className="w-4 h-4" /> Subjects (comma separated)
            </label>
            <input
              value={form.subjectsText}
              onChange={(e) => setForm((prev) => ({ ...prev, subjectsText: e.target.value }))}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Physics, Mathematics, Chemistry"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Bio</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value }))}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Write a short student bio"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 font-semibold disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Student Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentProfilePage;
