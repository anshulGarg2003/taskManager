import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASIC_URL } from "../utlis/API_calls";
import { CalendarDays, Send, Plane } from "lucide-react";

const statusTone = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

const HolidayRequestPage = () => {
  const userInfo = useSelector((state) => state.user);

  const [requests, setRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: "",
  });

  const fetchRequests = async () => {
    if (!userInfo?.id) return;

    try {
      const response = await fetch(`${BASIC_URL}/api/holidays/student/${userInfo.id}`);
      const data = await response.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [userInfo?.id]);

  const submitRequest = async (event) => {
    event.preventDefault();

    if (!userInfo?.id) {
      toast.error("Please login first");
      return;
    }

    if (!form.fromDate || !form.toDate || !form.reason.trim()) {
      toast.error("Please fill all fields");
      return;
    }

    if (form.fromDate > form.toDate) {
      toast.error("From date cannot be after To date");
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch(`${BASIC_URL}/api/holidays/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: userInfo.id,
          fromDate: form.fromDate,
          toDate: form.toDate,
          reason: form.reason,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to submit request");
      }

      toast.success("Holiday request submitted");
      setForm({ fromDate: "", toDate: "", reason: "" });
      await fetchRequests();
    } catch (error) {
      toast.error(error.message || "Could not submit holiday request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_10%_10%,rgba(14,165,233,0.18),transparent_30%),radial-gradient(circle_at_88%_14%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(130deg,#f8fafc,#f0fdfa)]">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
            <Plane className="w-3.5 h-3.5" /> Student Leave Planner
          </p>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mt-2">Request Holiday</h1>
          <p className="text-sm text-slate-600 mt-1">Submit your holiday request. Teacher can review and approve or reject it.</p>

          <form onSubmit={submitRequest} className="mt-4 space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-700">From Date</label>
              <input
                type="date"
                value={form.fromDate}
                onChange={(e) => setForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">To Date</label>
              <input
                type="date"
                value={form.toDate}
                onChange={(e) => setForm((prev) => ({ ...prev, toDate: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700">Reason</label>
              <textarea
                rows={5}
                value={form.reason}
                onChange={(e) => setForm((prev) => ({ ...prev, reason: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
                placeholder="Reason for holiday"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-2.5 font-semibold disabled:opacity-60"
            >
              <Send className="w-4 h-4" /> {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <h2 className="text-xl font-black text-slate-900 inline-flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-indigo-600" /> My Holiday Requests
          </h2>

          <div className="mt-3 space-y-2 max-h-[70vh] overflow-auto pr-1">
            {requests.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-800">{item.fromDate} to {item.toDate}</p>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusTone[item.status] || "bg-slate-100 text-slate-700"}`}>
                    {item.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">{item.reason}</p>
                {!!item.teacherComment && (
                  <p className="text-xs text-slate-500 mt-2">Teacher comment: {item.teacherComment}</p>
                )}
              </div>
            ))}

            {requests.length === 0 && (
              <p className="text-sm text-slate-500">No holiday requests submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayRequestPage;
