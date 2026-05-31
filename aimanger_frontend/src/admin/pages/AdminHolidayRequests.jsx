import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASIC_URL } from "../../utlis/API_calls";
import { CalendarClock, CheckCircle2, XCircle } from "lucide-react";

const statusTone = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const AdminHolidayRequests = () => {
  const userInfo = useSelector((state) => state.user);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [requests, setRequests] = useState([]);
  const [commentById, setCommentById] = useState({});
  const [updatingId, setUpdatingId] = useState("");

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${BASIC_URL}/api/holidays?status=${statusFilter}`);
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const counts = useMemo(() => {
    return {
      pending: requests.filter((item) => item.status === "pending").length,
      approved: requests.filter((item) => item.status === "approved").length,
      rejected: requests.filter((item) => item.status === "rejected").length,
    };
  }, [requests]);

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      const response = await fetch(`${BASIC_URL}/api/holidays/${requestId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          teacherComment: commentById[requestId] || "",
          reviewedBy: userInfo.id,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to update holiday request");
      }

      toast.success(`Request ${status}`);
      await fetchRequests();
    } catch (error) {
      toast.error(error.message || "Could not update request");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_12%_12%,rgba(14,165,233,0.2),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(251,191,36,0.2),transparent_30%),linear-gradient(140deg,#f8fafc,#ecfeff)]">
      <div className="max-w-7xl mx-auto rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 inline-flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-sky-600" /> Holiday Requests
          </h1>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="all">All</option>
          </select>
        </div>

        <p className="text-sm text-slate-600 mt-2">
          Pending: {counts.pending} | Approved: {counts.approved} | Rejected: {counts.rejected}
        </p>

        <div className="mt-4 space-y-3 max-h-[72vh] overflow-auto pr-1">
          {requests.map((item) => (
            <div key={item._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-base font-bold text-slate-900">{item.studentId?.name || "Student"}</p>
                  <p className="text-xs text-slate-500">{item.studentId?.email || ""}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone[item.status] || "bg-slate-100 text-slate-700"}`}>
                  {item.status}
                </span>
              </div>

              <p className="text-sm text-slate-700 mt-2">{item.fromDate} to {item.toDate}</p>
              <p className="text-sm text-slate-600 mt-1">{item.reason}</p>

              <textarea
                rows={2}
                placeholder="Teacher comment"
                value={commentById[item._id] ?? item.teacherComment ?? ""}
                onChange={(e) =>
                  setCommentById((prev) => ({
                    ...prev,
                    [item._id]: e.target.value,
                  }))
                }
                className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              />

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => updateStatus(item._id, "approved")}
                  disabled={updatingId === item._id}
                  className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>

                <button
                  onClick={() => updateStatus(item._id, "rejected")}
                  disabled={updatingId === item._id}
                  className="inline-flex items-center gap-1 rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-semibold disabled:opacity-60"
                >
                  <XCircle className="w-4 h-4" /> Reject
                </button>
              </div>
            </div>
          ))}

          {requests.length === 0 && (
            <p className="text-sm text-slate-500">No holiday requests in this filter.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminHolidayRequests;
