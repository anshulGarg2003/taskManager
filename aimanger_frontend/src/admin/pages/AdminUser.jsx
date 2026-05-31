import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  Search,
  Users,
  ChartColumn,
  ClipboardCheck,
  BookOpen,
  UserPlus,
  Sparkles,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const dateText = (value) => {
  if (!value) return "-";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

export default function AdminUser() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user);

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [studentDetails, setStudentDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [classes, setClasses] = useState([]);
  const [assignClassId, setAssignClassId] = useState("");
  const [assigning, setAssigning] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase();
    return students.filter((student) => {
      const text = `${student.name || ""} ${student.email || ""} ${student.grade || ""}`.toLowerCase();
      return text.includes(q);
    });
  }, [students, search]);

  const selectedStudent = useMemo(
    () => students.find((student) => student._id === selectedStudentId) || null,
    [students, selectedStudentId]
  );

  const fetchStudents = async () => {
    try {
      const response = await fetch(`${BASIC_URL}/api/users`);
      const data = await response.json();
      const onlyStudents = Array.isArray(data)
        ? data.filter((user) => user.role === "student")
        : [];
      setStudents(onlyStudents);
      setSelectedStudentId((curr) => curr || onlyStudents[0]?._id || "");
    } catch {
      setStudents([]);
    }
  };

  const fetchClasses = async () => {
    try {
      const query = new URLSearchParams();
      if (userInfo.role === "teacher") query.set("teacherId", userInfo.id);
      const url = query.toString()
        ? `${BASIC_URL}/api/teacher/classes?${query.toString()}`
        : `${BASIC_URL}/api/teacher/classes`;
      const response = await fetch(url);
      const data = await response.json();
      const safe = Array.isArray(data) ? data : [];
      setClasses(safe);
      setAssignClassId((curr) => curr || safe[0]?._id || "");
    } catch {
      setClasses([]);
    }
  };

  const fetchStudentDetails = async (studentId) => {
    if (!studentId) {
      setStudentDetails(null);
      return;
    }

    try {
      setLoadingDetails(true);
      const query = new URLSearchParams();
      if (userInfo.role === "teacher") {
        query.set("teacherId", userInfo.id);
      }
      const suffix = query.toString() ? `?${query.toString()}` : "";
      const response = await fetch(`${BASIC_URL}/api/teacher/analytics/student/${studentId}${suffix}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch student analysis");
      setStudentDetails(data);
    } catch (error) {
      setStudentDetails(null);
      toast.error(error.message || "Could not load student analysis");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.id) return;
    if (userInfo.role !== "admin" && userInfo.role !== "teacher") return;

    fetchStudents();
    fetchClasses();
  }, [userInfo?.id, userInfo?.role]);

  useEffect(() => {
    fetchStudentDetails(selectedStudentId);
  }, [selectedStudentId]);

  const assignStudentToClass = async () => {
    if (!selectedStudentId || !assignClassId) {
      toast.error("Select student and class first");
      return;
    }

    try {
      setAssigning(true);
      const response = await fetch(`${BASIC_URL}/api/teacher/classes/${assignClassId}/students`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "add", studentIds: [selectedStudentId] }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to assign class");

      toast.success("Student assigned to class");
      await fetchClasses();
      await fetchStudentDetails(selectedStudentId);
    } catch (error) {
      toast.error(error.message || "Could not assign class");
    } finally {
      setAssigning(false);
    }
  };

  if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700 font-semibold">Only teachers/admin can access Student Directory.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(251,191,36,0.20),transparent_30%),linear-gradient(145deg,#f8fafc,#f0f9ff)]">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" /> Student Directory
          </p>
          <h1 className="text-2xl font-black text-slate-900 mt-2 inline-flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-600" /> Students
          </h1>

          <div className="relative mt-3">
            <Search className="w-4 h-4 text-slate-400 absolute left-2 top-2.5" />
            <input
              type="text"
              placeholder="Search by name/email/grade"
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-slate-300 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mt-3 space-y-2 max-h-[72vh] overflow-auto pr-1">
            {filteredStudents.map((student) => (
              <button
                key={student._id}
                onClick={() => setSelectedStudentId(student._id)}
                className={`w-full text-left rounded-xl border p-3 ${selectedStudentId === student._id ? "border-sky-500 bg-sky-50" : "border-slate-200 bg-white"}`}
              >
                <p className="font-semibold text-slate-900">{student.name || "Student"}</p>
                <p className="text-xs text-slate-500">{student.email}</p>
                <p className="text-xs text-slate-500">Grade: {student.grade || "-"} • School: {student.school || "-"}</p>
              </button>
            ))}
            {filteredStudents.length === 0 && (
              <p className="text-sm text-slate-500">No student found.</p>
            )}
          </div>
        </div>

        <div className="xl:col-span-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          {!selectedStudent && (
            <div className="h-full min-h-[40vh] flex items-center justify-center text-slate-500">
              Select a student to reveal performance intelligence.
            </div>
          )}

          {selectedStudent && (
            <>
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h2>
                  <p className="text-sm text-slate-500">{selectedStudent.email} • Grade {selectedStudent.grade || "-"}</p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 flex items-center gap-2">
                  <select
                    value={assignClassId}
                    onChange={(e) => setAssignClassId(e.target.value)}
                    className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
                  >
                    {classes.map((cls) => (
                      <option key={cls._id} value={cls._id}>{cls.title}</option>
                    ))}
                    {classes.length === 0 && <option value="">No classes</option>}
                  </select>
                  <button
                    onClick={assignStudentToClass}
                    disabled={assigning || classes.length === 0}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold inline-flex items-center gap-1 disabled:opacity-60"
                  >
                    <UserPlus className="w-4 h-4" /> {assigning ? "Assigning..." : "Assign Class"}
                  </button>
                </div>
              </div>

              {loadingDetails && (
                <div className="mt-4 text-sm text-slate-500">Loading student analysis...</div>
              )}

              {studentDetails && (
                <>
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Overall Quiz Avg</p>
                      <p className="text-xl font-black text-slate-900">{studentDetails.overallQuizAverage || 0}%</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Last Quiz Score</p>
                      <p className="text-xl font-black text-slate-900">{studentDetails.lastQuizExam?.percentage ?? "-"}{studentDetails.lastQuizExam ? "%" : ""}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Pending Assignments</p>
                      <p className="text-xl font-black text-amber-600">{studentDetails.homeworkSummary?.pendingAssignments || 0}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs text-slate-500">Completed Homework</p>
                      <p className="text-xl font-black text-emerald-600">{studentDetails.homeworkSummary?.completedAssignments || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-black text-slate-900 inline-flex items-center gap-1">
                        <ChartColumn className="w-4 h-4 text-indigo-600" /> Subject-wise Segregation
                      </h3>
                      <div className="mt-2 space-y-2">
                        {(studentDetails.subjectPerformance || []).map((item) => (
                          <div key={item.subject} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                            <p className="text-sm font-semibold text-slate-800">{item.subject}</p>
                            <p className="text-xs text-slate-500">Avg: {item.avgPercentage}% • Attempts: {item.attempts}</p>
                          </div>
                        ))}
                        {(studentDetails.subjectPerformance || []).length === 0 && (
                          <p className="text-sm text-slate-500">No subject stats yet.</p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-black text-slate-900 inline-flex items-center gap-1">
                        <ClipboardCheck className="w-4 h-4 text-emerald-600" /> Homework and Assignment Status
                      </h3>
                      <div className="mt-2 space-y-2 max-h-52 overflow-auto pr-1">
                        {(studentDetails.pendingAssignments || []).map((assignment) => (
                          <div key={assignment._id} className="rounded-lg border border-amber-200 bg-amber-50 p-2">
                            <p className="text-sm font-semibold text-amber-800">{assignment.title}</p>
                            <p className="text-xs text-amber-700">Class: {assignment.classTitle} • Due: {assignment.dueDate || "-"}</p>
                            <p className="text-xs text-amber-700">Status: {assignment.status}</p>
                          </div>
                        ))}
                        {(studentDetails.pendingAssignments || []).length === 0 && (
                          <p className="text-sm text-slate-500">No pending assignments.</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-black text-slate-900 inline-flex items-center gap-1">
                        <BookOpen className="w-4 h-4 text-sky-600" /> Last Exam Details
                      </h3>
                      <div className="mt-2 text-sm text-slate-700 space-y-1">
                        <p>Quiz Subject: <span className="font-semibold">{studentDetails.lastQuizExam?.subject || "-"}</span></p>
                        <p>Quiz Chapter: <span className="font-semibold">{studentDetails.lastQuizExam?.chapter || "-"}</span></p>
                        <p>Quiz Time: <span className="font-semibold">{dateText(studentDetails.lastQuizExam?.attemptedAt)}</span></p>
                        <p>Written Exam Marks: <span className="font-semibold">{studentDetails.lastWrittenExam ? `${studentDetails.lastWrittenExam.marks ?? 0}/${studentDetails.lastWrittenExam.totalMarks ?? 0}` : "-"}</span></p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <h3 className="font-black text-slate-900">Assigned Classes</h3>
                      <div className="mt-2 space-y-2 max-h-40 overflow-auto pr-1">
                        {(studentDetails.classesAssigned || []).map((cls) => (
                          <div key={cls._id} className="rounded-lg border border-slate-200 bg-slate-50 p-2">
                            <p className="text-sm font-semibold text-slate-800">{cls.title}</p>
                            <p className="text-xs text-slate-500">{cls.subject} • Grade {cls.grade || "-"} • Section {cls.section || "-"}</p>
                          </div>
                        ))}
                        {(studentDetails.classesAssigned || []).length === 0 && (
                          <p className="text-sm text-slate-500">No class assigned yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
