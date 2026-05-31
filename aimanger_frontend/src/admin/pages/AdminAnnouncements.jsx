import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { BASIC_URL } from "../../utlis/API_calls";
import { Megaphone, PlusCircle, Trash2, Pencil, Save } from "lucide-react";

const defaultForm = {
  title: "",
  message: "",
  audience: "student",
  level: "info",
  isActive: true,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: "",
};

const AdminAnnouncements = () => {
  const userInfo = useSelector((state) => state.user);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState(defaultForm);

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch(`${BASIC_URL}/api/announcements`);
      const data = await response.json();
      setAnnouncements(Array.isArray(data) ? data : []);
    } catch {
      setAnnouncements([]);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm(defaultForm);
  };

  const createOrUpdate = async (event) => {
    event.preventDefault();

    if (!form.title.trim() || !form.message.trim()) {
      toast.error("Title and message are required");
      return;
    }

    try {
      setLoading(true);
      const method = editingId ? "PUT" : "POST";
      const endpoint = editingId
        ? `${BASIC_URL}/api/announcements/${editingId}`
        : `${BASIC_URL}/api/announcements`;

      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          createdBy: userInfo.id,
          updatedBy: userInfo.id,
          endDate: form.endDate || null,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || "Failed to save announcement");
      }

      toast.success(editingId ? "Announcement updated" : "Announcement created");
      resetForm();
      await fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || "Could not save announcement");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      title: item.title || "",
      message: item.message || "",
      audience: item.audience || "student",
      level: item.level || "info",
      isActive: item.isActive !== false,
      startDate: item.startDate ? String(item.startDate).slice(0, 10) : new Date().toISOString().slice(0, 10),
      endDate: item.endDate ? String(item.endDate).slice(0, 10) : "",
    });
  };

  const deleteAnnouncement = async (id) => {
    const yes = window.confirm("Delete this announcement?");
    if (!yes) return;

    try {
      const response = await fetch(`${BASIC_URL}/api/announcements/${id}`, {
        method: "DELETE",
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Failed to delete announcement");

      toast.success("Announcement deleted");
      await fetchAnnouncements();
    } catch (error) {
      toast.error(error.message || "Could not delete announcement");
    }
  };

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_8%_10%,rgba(14,165,233,0.2),transparent_30%),radial-gradient(circle_at_88%_12%,rgba(249,115,22,0.2),transparent_30%),linear-gradient(140deg,#f8fafc,#fff7ed)]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
        <div className="xl:col-span-5 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
            <Megaphone className="w-3.5 h-3.5" /> Admin Announcement Editor
          </p>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Announcement Edition</h1>

          <form className="mt-4 space-y-3" onSubmit={createOrUpdate}>
            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Banner title"
            />
            <textarea
              rows={5}
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2"
              placeholder="Announcement message"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={form.audience}
                onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="all">All</option>
              </select>

              <select
                value={form.level}
                onChange={(e) => setForm((prev) => ({ ...prev, level: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((prev) => ({ ...prev, startDate: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((prev) => ({ ...prev, endDate: e.target.value }))}
                className="rounded-xl border border-slate-300 bg-white px-3 py-2"
              />
            </div>

            <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
              />
              Active announcement
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 text-white px-4 py-2 font-semibold disabled:opacity-60"
              >
                {editingId ? <Save className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {loading ? "Saving..." : editingId ? "Update" : "Create"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-700"
                >
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="xl:col-span-7 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
          <h2 className="text-xl font-black text-slate-900">Existing Announcements</h2>
          <div className="mt-3 space-y-2 max-h-[70vh] overflow-auto pr-1">
            {announcements.map((item) => (
              <div key={item._id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.audience} • {item.level} • {item.isActive ? "active" : "inactive"}</p>
                    <p className="text-sm text-slate-700 mt-2">{item.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(item)}
                      className="p-2 rounded-lg border border-slate-300 bg-white text-slate-700"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAnnouncement(item._id)}
                      className="p-2 rounded-lg border border-rose-200 bg-rose-50 text-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {announcements.length === 0 && (
              <p className="text-sm text-slate-500">No announcements created yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnnouncements;
