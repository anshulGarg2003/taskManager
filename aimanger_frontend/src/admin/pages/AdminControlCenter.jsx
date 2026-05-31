import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  PlusCircle,
  School,
  CalendarClock,
  Megaphone,
  ClipboardPen,
  AlertTriangle,
  Users,
  BarChart3,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const actionTypes = [
  { value: "extra-class", label: "Extra Class", icon: CalendarClock },
  { value: "reschedule", label: "Reschedule Class", icon: RefreshCw },
  { value: "surprise-test", label: "Surprise Test", icon: Megaphone },
  { value: "extra-work", label: "Extra Work / Punishment", icon: AlertTriangle },
];

const actionEndpointMap = {
  "extra-class": "extra-class",
  reschedule: "reschedule",
  "surprise-test": "surprise-test",
  "extra-work": "extra-work",
};

const toLocalDate = () => new Date().toISOString().split("T")[0];

export default function AdminControlCenter() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user);

  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [classAnalytics, setClassAnalytics] = useState(null);
  const [overview, setOverview] = useState(null);
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingClass, setSavingClass] = useState(false);
  const [savingRoster, setSavingRoster] = useState(false);
  const [savingAction, setSavingAction] = useState(false);

  const [newClass, setNewClass] = useState({
    title: "",
    subject: "",
    grade: "",
    section: "",
    room: "",
    scheduleTime: "",
    notes: "",
  });

  const [rosterIds, setRosterIds] = useState([]);

  const [actionForm, setActionForm] = useState({
    type: "extra-class",
    title: "",
    description: "",
    date: toLocalDate(),
    time: "08:00",
    durationMinutes: 60,
    chapter: "",
    dueDate: "",
    status: "scheduled",
    rescheduleFromDate: "",
    rescheduleFromTime: "",
    rescheduleToDate: "",
    rescheduleToTime: "",
    targetMode: "class",
    targetStudentIds: [],
    isPunishmentClass: false,
  });

  const selectedClass = useMemo(
    () => classes.find((item) => item._id === selectedClassId) || null,
    [classes, selectedClassId]
  );

  const studentOptions = useMemo(
    () => students.filter((u) => u.role === "student"),
    [students]
  );

  const selectedClassStudents = useMemo(() => {
    if (!selectedClass) return [];

    return (selectedClass.studentIds || [])
      .map((s) => {
        if (typeof s === "string") {
          const found = students.find((u) => u._id === s);
          return found || null;
        }
        return s;
      })
      .filter(Boolean);
  }, [selectedClass, students]);

  const fetchClasses = async () => {
    if (!userInfo?.id) return;
    try {
      const res = await fetch(`${BASIC_URL}/api/teacher/classes?teacherId=${userInfo.id}`);
      const data = await res.json();
      const safe = Array.isArray(data) ? data : [];
      setClasses(safe);
      setSelectedClassId((curr) => curr || safe[0]?._id || "");
    } catch {
      setClasses([]);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${BASIC_URL}/api/users`);
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    }
  };

  const fetchOverview = async () => {
    if (!userInfo?.id) return;
    try {
      const res = await fetch(`${BASIC_URL}/api/teacher/analytics/overview/${userInfo.id}`);
      const data = await res.json();
      setOverview(data && !data.error ? data : null);
    } catch {
      setOverview(null);
    }
  };

  const fetchClassAnalytics = async (classId) => {
    if (!classId) {
      setClassAnalytics(null);
      return;
    }

    try {
      const res = await fetch(`${BASIC_URL}/api/teacher/analytics/class/${classId}`);
      const data = await res.json();
      setClassAnalytics(data && !data.error ? data : null);
    } catch {
      setClassAnalytics(null);
    }
  };

  const fetchActions = async (classId) => {
    if (!userInfo?.id) return;

    try {
      const query = new URLSearchParams({ teacherId: userInfo.id });
      if (classId) query.set("classId", classId);
      const res = await fetch(`${BASIC_URL}/api/teacher/actions?${query.toString()}`);
      const data = await res.json();
      setActions(Array.isArray(data) ? data : []);
    } catch {
      setActions([]);
    }
  };

  useEffect(() => {
    if (!userInfo?.id) return;
    if (userInfo.role !== "admin" && userInfo.role !== "teacher") return;

    setLoading(true);
    Promise.all([fetchStudents(), fetchClasses(), fetchOverview()]).finally(() => setLoading(false));
  }, [userInfo?.id, userInfo?.role]);

  useEffect(() => {
    if (!selectedClass) return;

    const selectedIds = (selectedClass.studentIds || []).map((s) => (typeof s === "string" ? s : s._id));
    setRosterIds(selectedIds);
  }, [selectedClass]);

  useEffect(() => {
    fetchClassAnalytics(selectedClassId);
    fetchActions(selectedClassId);
  }, [selectedClassId]);

  const createClass = async (e) => {
    e.preventDefault();
    if (!newClass.title || !newClass.subject) {
      toast.error("Class name and subject are required");
      return;
    }

    try {
      setSavingClass(true);
      const res = await fetch(`${BASIC_URL}/api/teacher/classes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newClass, teacherId: userInfo.id, scheduleDays: [] }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create class");

      toast.success("Class created");
      setNewClass({
        title: "",
        subject: "",
        grade: "",
        section: "",
        room: "",
        scheduleTime: "",
        notes: "",
      });
      await fetchClasses();
      await fetchOverview();
    } catch (err) {
      toast.error(err.message || "Could not create class");
    } finally {
      setSavingClass(false);
    }
  };

  const saveRoster = async () => {
    if (!selectedClassId) {
      toast.error("Select a class first");
      return;
    }

    try {
      setSavingRoster(true);
      const res = await fetch(`${BASIC_URL}/api/teacher/classes/${selectedClassId}/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "set", studentIds: rosterIds }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update roster");

      toast.success("Roster updated");
      await fetchClasses();
      await fetchOverview();
      await fetchClassAnalytics(selectedClassId);
    } catch (err) {
      toast.error(err.message || "Could not update roster");
    } finally {
      setSavingRoster(false);
    }
  };

  const toggleRosterStudent = (studentId) => {
    setRosterIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const toggleActionTargetStudent = (studentId) => {
    setActionForm((prev) => ({
      ...prev,
      targetStudentIds: prev.targetStudentIds.includes(studentId)
        ? prev.targetStudentIds.filter((id) => id !== studentId)
        : [...prev.targetStudentIds, studentId],
    }));
  };

  const createAction = async (e) => {
    e.preventDefault();

    if (!selectedClassId) {
      toast.error("Select a class before creating actions");
      return;
    }

    if (!actionForm.title) {
      toast.error("Action title is required");
      return;
    }

    const classStudentIds = selectedClassStudents
      .map((s) => s?._id)
      .filter(Boolean);

    const targetedStudentIds =
      actionForm.targetMode === "specific"
        ? actionForm.targetStudentIds
        : classStudentIds.length > 0
          ? classStudentIds
          : rosterIds;

    if (actionForm.targetMode === "specific" && targetedStudentIds.length === 0) {
      toast.error("Pick at least one student for specific targeting");
      return;
    }

    const endpoint = actionEndpointMap[actionForm.type];

    try {
      setSavingAction(true);
      const res = await fetch(`${BASIC_URL}/api/teacher/actions/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...actionForm,
          teacherId: userInfo.id,
          classId: selectedClassId,
          studentIds: targetedStudentIds,
          metadata: {
            audience: actionForm.targetMode,
            purpose:
              actionForm.type === "extra-class" && actionForm.isPunishmentClass
                ? "punishment-class"
                : actionForm.type,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create action");

      toast.success("Teacher action created");
      setActionForm((prev) => ({
        ...prev,
        title: "",
        description: "",
        chapter: "",
        dueDate: "",
        targetStudentIds: [],
        isPunishmentClass: false,
      }));
      await fetchActions(selectedClassId);
      await fetchOverview();
      await fetchClassAnalytics(selectedClassId);
    } catch (err) {
      toast.error(err.message || "Could not create action");
    } finally {
      setSavingAction(false);
    }
  };

  const markActionStatus = async (actionId, status) => {
    try {
      const res = await fetch(`${BASIC_URL}/api/teacher/actions/${actionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update action status");

      toast.success("Action status updated");
      await fetchActions(selectedClassId);
      await fetchOverview();
    } catch (err) {
      toast.error(err.message || "Could not update status");
    }
  };

  if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md text-center shadow-sm">
          <h2 className="text-xl font-black text-slate-900">Teacher Control Center</h2>
          <p className="text-slate-600 mt-2">Only teachers/admin can access this area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_8%_5%,rgba(2,132,199,0.22),transparent_32%),radial-gradient(circle_at_92%_10%,rgba(22,163,74,0.22),transparent_30%),linear-gradient(145deg,#f8fafc,#ecfeff)]">
      <div className="max-w-[1400px] mx-auto space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-5 md:p-6 shadow-xl">
          <div>
            <div>
              <p className="text-xs font-semibold tracking-wide uppercase text-sky-700 inline-flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Teacher Experience Upgrade
              </p>
              <h1 className="text-2xl md:text-4xl font-black text-slate-900 mt-1">Teacher Control Center</h1>
              <p className="text-slate-600 mt-1 text-sm md:text-base">
                Manage multiple classes, conduct extra sessions, run surprise tests, assign extra work, and track class and self performance.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Classes</p>
            <p className="text-2xl font-black text-slate-900">{overview?.managedClasses ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Students</p>
            <p className="text-2xl font-black text-slate-900">{overview?.managedStudents ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Extra Classes</p>
            <p className="text-2xl font-black text-slate-900">{overview?.extraClasses ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Reschedules</p>
            <p className="text-2xl font-black text-slate-900">{overview?.reschedules ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Surprise Tests</p>
            <p className="text-2xl font-black text-slate-900">{overview?.surpriseTests ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Extra Work</p>
            <p className="text-2xl font-black text-slate-900">{overview?.extraWorks ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Pending Checks</p>
            <p className="text-2xl font-black text-amber-600">{overview?.pendingReviewCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs text-slate-500">Class Avg %</p>
            <p className="text-2xl font-black text-emerald-600">{overview?.classAverageQuizPercentage ?? 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <School className="w-5 h-5 text-sky-600" /> Create Class
              </h2>
              <form className="mt-3 space-y-2" onSubmit={createClass}>
                <input
                  value={newClass.title}
                  onChange={(e) => setNewClass((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Class name (e.g. 10A Physics)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={newClass.subject}
                    onChange={(e) => setNewClass((s) => ({ ...s, subject: e.target.value }))}
                    placeholder="Subject"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                  <input
                    value={newClass.grade}
                    onChange={(e) => setNewClass((s) => ({ ...s, grade: e.target.value }))}
                    placeholder="Grade"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={newClass.section}
                    onChange={(e) => setNewClass((s) => ({ ...s, section: e.target.value }))}
                    placeholder="Section"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                  <input
                    value={newClass.room}
                    onChange={(e) => setNewClass((s) => ({ ...s, room: e.target.value }))}
                    placeholder="Room"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>
                <input
                  value={newClass.scheduleTime}
                  onChange={(e) => setNewClass((s) => ({ ...s, scheduleTime: e.target.value }))}
                  placeholder="Default time (e.g. 09:00)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                />
                <textarea
                  value={newClass.notes}
                  onChange={(e) => setNewClass((s) => ({ ...s, notes: e.target.value }))}
                  rows={2}
                  placeholder="Class notes"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                />
                <button
                  disabled={savingClass}
                  className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-semibold px-3 py-2 inline-flex items-center justify-center gap-1 disabled:opacity-60"
                >
                  <PlusCircle className="w-4 h-4" /> {savingClass ? "Creating..." : "Create Class"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-600" /> Multi-Class Manager
              </h2>
              <div className="mt-3 space-y-2 max-h-44 overflow-auto pr-1">
                {classes.map((cls) => (
                  <button
                    key={cls._id}
                    onClick={() => setSelectedClassId(cls._id)}
                    className={`w-full text-left rounded-xl border p-3 ${selectedClassId === cls._id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
                  >
                    <p className="font-semibold text-slate-900">{cls.title}</p>
                    <p className="text-xs text-slate-500">{cls.subject} • Grade {cls.grade || "N/A"} • Section {cls.section || "-"}</p>
                  </button>
                ))}
                {classes.length === 0 && (
                  <p className="text-sm text-slate-500">No classes yet. Create your first class.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900">Class Roster</h2>
              <p className="text-xs text-slate-500">Pick students and save roster for selected class.</p>
              <div className="mt-2 max-h-48 overflow-auto pr-1 space-y-1">
                {studentOptions.map((student) => (
                  <label key={student._id} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5">
                    <input
                      type="checkbox"
                      checked={rosterIds.includes(student._id)}
                      onChange={() => toggleRosterStudent(student._id)}
                    />
                    <span className="text-sm text-slate-700">{student.name} ({student.grade || "-"})</span>
                  </label>
                ))}
                {studentOptions.length === 0 && (
                  <p className="text-sm text-slate-500">No student users found.</p>
                )}
              </div>
              <button
                onClick={saveRoster}
                disabled={savingRoster || !selectedClassId}
                className="mt-3 w-full rounded-xl bg-emerald-600 text-white font-semibold px-3 py-2 disabled:opacity-60"
              >
                {savingRoster ? "Saving..." : "Save Roster"}
              </button>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <ClipboardPen className="w-5 h-5 text-violet-600" /> Teacher Action Console
              </h2>
              <form className="mt-3 space-y-2" onSubmit={createAction}>
                <select
                  value={actionForm.type}
                  onChange={(e) => setActionForm((s) => ({ ...s, type: e.target.value }))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                >
                  {actionTypes.map((item) => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </select>
                <input
                  value={actionForm.title}
                  onChange={(e) => setActionForm((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Action title"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                />
                <textarea
                  rows={2}
                  value={actionForm.description}
                  onChange={(e) => setActionForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Description"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    value={actionForm.date}
                    onChange={(e) => setActionForm((s) => ({ ...s, date: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                  <input
                    type="time"
                    value={actionForm.time}
                    onChange={(e) => setActionForm((s) => ({ ...s, time: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min={15}
                    value={actionForm.durationMinutes}
                    onChange={(e) => setActionForm((s) => ({ ...s, durationMinutes: Number(e.target.value) || 60 }))}
                    placeholder="Duration"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                  <input
                    value={actionForm.chapter}
                    onChange={(e) => setActionForm((s) => ({ ...s, chapter: e.target.value }))}
                    placeholder="Chapter/topic"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                </div>

                <select
                  value={actionForm.targetMode}
                  onChange={(e) =>
                    setActionForm((s) => ({
                      ...s,
                      targetMode: e.target.value,
                      targetStudentIds: e.target.value === "class" ? [] : s.targetStudentIds,
                    }))
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                >
                  <option value="class">Target: Entire Selected Class</option>
                  <option value="specific">Target: Specific Students</option>
                </select>

                {actionForm.targetMode === "specific" && (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-700 mb-2">
                      Pick students for this action
                    </p>
                    <div className="max-h-36 overflow-auto pr-1 space-y-1">
                      {selectedClassStudents.map((student) => (
                        <label
                          key={student._id}
                          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1.5"
                        >
                          <input
                            type="checkbox"
                            checked={actionForm.targetStudentIds.includes(student._id)}
                            onChange={() => toggleActionTargetStudent(student._id)}
                          />
                          <span className="text-sm text-slate-700">
                            {student.name} ({student.grade || "-"})
                          </span>
                        </label>
                      ))}
                      {selectedClassStudents.length === 0 && (
                        <p className="text-xs text-slate-500">
                          No students in selected class roster.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {actionForm.type === "extra-class" && (
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    <input
                      type="checkbox"
                      checked={actionForm.isPunishmentClass}
                      onChange={(e) =>
                        setActionForm((s) => ({ ...s, isPunishmentClass: e.target.checked }))
                      }
                    />
                    Mark this extra class as a punishment class
                  </label>
                )}

                {actionForm.type === "extra-work" && (
                  <input
                    type="date"
                    value={actionForm.dueDate}
                    onChange={(e) => setActionForm((s) => ({ ...s, dueDate: e.target.value }))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                  />
                )}

                {actionForm.type === "reschedule" && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={actionForm.rescheduleFromDate}
                      onChange={(e) => setActionForm((s) => ({ ...s, rescheduleFromDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="time"
                      value={actionForm.rescheduleFromTime}
                      onChange={(e) => setActionForm((s) => ({ ...s, rescheduleFromTime: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="date"
                      value={actionForm.rescheduleToDate}
                      onChange={(e) => setActionForm((s) => ({ ...s, rescheduleToDate: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                    <input
                      type="time"
                      value={actionForm.rescheduleToTime}
                      onChange={(e) => setActionForm((s) => ({ ...s, rescheduleToTime: e.target.value }))}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                    />
                  </div>
                )}

                <button
                  disabled={savingAction || !selectedClassId}
                  className="w-full rounded-xl bg-violet-600 text-white font-semibold px-3 py-2 disabled:opacity-60"
                >
                  {savingAction ? "Saving..." : "Create Action"}
                </button>
              </form>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900">Action Timeline</h2>
              <div className="mt-3 max-h-[430px] overflow-auto pr-1 space-y-2">
                {actions.map((item) => (
                  <div key={item._id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500">{item.type} • {item.date || "No date"} {item.time || ""}</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Targets: {item.studentIds?.length || 0} student(s)
                      {item.metadata?.audience === "specific" ? " (specific)" : " (class-wide)"}
                    </p>
                    {item.metadata?.purpose === "punishment-class" && (
                      <span className="inline-flex mt-1 text-[11px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                        Punishment Class
                      </span>
                    )}
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description || "No description"}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[11px] px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{item.status}</span>
                      <button
                        onClick={() => markActionStatus(item._id, "completed")}
                        className="text-xs px-2 py-1 rounded-md bg-emerald-600 text-white"
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                ))}
                {actions.length === 0 && (
                  <p className="text-sm text-slate-500">No actions yet for this class.</p>
                )}
              </div>
            </div>
          </div>

          <div className="xl:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-600" /> Class Analysis
              </h2>

              {!selectedClassId && (
                <p className="text-sm text-slate-500 mt-2">Select a class to view analytics.</p>
              )}

              {selectedClassId && classAnalytics && (
                <>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">Students</p>
                      <p className="text-xl font-black text-slate-900">{classAnalytics.studentCount || 0}</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">Avg Score</p>
                      <p className="text-xl font-black text-slate-900">{classAnalytics.classAverageQuizPercentage || 0}%</p>
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                      <p className="text-[11px] text-slate-500">Actions</p>
                      <p className="text-xl font-black text-slate-900">{classAnalytics.recentActions?.length || 0}</p>
                    </div>
                  </div>

                  <div className="mt-3 max-h-[460px] overflow-auto pr-1 space-y-2">
                    {(classAnalytics.students || []).map((student) => (
                      <div key={student._id} className="rounded-xl border border-slate-200 bg-white p-3">
                        <p className="font-semibold text-slate-900">{student.name}</p>
                        <p className="text-xs text-slate-500">{student.email}</p>
                        <div className="mt-2 grid grid-cols-3 gap-2">
                          <div className="rounded-md bg-slate-50 p-2 border border-slate-200">
                            <p className="text-[10px] text-slate-500">Quiz Avg</p>
                            <p className="font-bold text-slate-900">{student.avgQuizPercentage}%</p>
                          </div>
                          <div className="rounded-md bg-amber-50 p-2 border border-amber-200">
                            <p className="text-[10px] text-amber-700">Pending</p>
                            <p className="font-bold text-amber-700">{student.pendingSubmissions}</p>
                          </div>
                          <div className="rounded-md bg-emerald-50 p-2 border border-emerald-200">
                            <p className="text-[10px] text-emerald-700">Reviewed</p>
                            <p className="font-bold text-emerald-700">{student.reviewedSubmissions}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(classAnalytics.students || []).length === 0 && (
                      <p className="text-sm text-slate-500">No students in this class roster.</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h2 className="text-lg font-black text-slate-900">Teacher Self Analysis</h2>
              <p className="text-sm text-slate-600 mt-1">
                Your delivery consistency and review workload in one place.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[11px] text-slate-500">Completed Ops</p>
                  <p className="font-black text-slate-900 text-xl">{overview?.completedActions ?? 0}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                  <p className="text-[11px] text-slate-500">Checked Tests</p>
                  <p className="font-black text-slate-900 text-xl">{overview?.reviewedCount ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed bottom-4 right-4 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-lg text-sm font-semibold text-slate-700">
          Loading teacher control data...
        </div>
      )}
    </div>
  );
}
