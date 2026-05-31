import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import {
  ShieldCheck,
  Bell,
  ClipboardCheck,
  Sparkles,
  SlidersHorizontal,
  Save,
} from "lucide-react";
import { BASIC_URL } from "../../utlis/API_calls";

const STORAGE_KEY = "teacher-settings-v1";

const defaultSettings = {
  autoPublishReviewed: false,
  requireFeedbackForReview: true,
  notifyOnNewSubmission: true,
  allowLateExtraWork: true,
  defaultExtraClassDuration: 60,
  workingMode: "balanced",
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const userInfo = useSelector((s) => s.user);

  const [settings, setSettings] = useState(defaultSettings);
  const [overview, setOverview] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSettings({ ...defaultSettings, ...JSON.parse(raw) });
    } catch {
      setSettings(defaultSettings);
    }
  }, []);

  useEffect(() => {
    const fetchOverview = async () => {
      if (!userInfo?.id || (userInfo.role !== "admin" && userInfo.role !== "teacher")) return;
      try {
        const res = await fetch(`${BASIC_URL}/api/teacher/analytics/overview/${userInfo.id}`);
        const data = await res.json();
        if (res.ok) setOverview(data);
      } catch {
        setOverview(null);
      }
    };

    fetchOverview();
  }, [userInfo?.id, userInfo?.role]);

  const healthStatus = useMemo(() => {
    if (!overview) return "No analytics yet";
    if ((overview.pendingReviewCount || 0) > 20) return "High review backlog";
    if ((overview.classAverageQuizPercentage || 0) < 45) return "Performance needs intervention";
    return "Healthy classroom operations";
  }, [overview]);

  const handleSave = () => {
    try {
      setSaving(true);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      toast.success("Settings saved for this device");
    } catch {
      toast.error("Could not save settings");
    } finally {
      setSaving(false);
    }
  };

  if (userInfo.role !== "admin" && userInfo.role !== "teacher") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-100">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <p className="text-slate-700 font-semibold">Only teachers/admin can access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_12%_10%,rgba(14,165,233,0.20),transparent_30%),radial-gradient(circle_at_88%_18%,rgba(132,204,22,0.20),transparent_30%),linear-gradient(140deg,#f8fafc,#ecfeff)]">
      <div className="max-w-6xl mx-auto space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl">
          <div>
            <div>
              <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5" /> Admin and Teacher Settings
              </p>
              <h1 className="text-3xl font-black text-slate-900 mt-2">Operational Settings</h1>
              <p className="text-slate-600 text-sm mt-1">
                Configure review rules, notification preferences, workflow defaults, and monitor operational health.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg">
            <h2 className="text-xl font-black text-slate-900 inline-flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-indigo-600" /> Workflow Preferences
            </h2>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">Auto-publish reviewed PDFs</span>
                <input
                  type="checkbox"
                  checked={settings.autoPublishReviewed}
                  onChange={(e) => setSettings((s) => ({ ...s, autoPublishReviewed: e.target.checked }))}
                />
              </label>

              <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">Require feedback before review</span>
                <input
                  type="checkbox"
                  checked={settings.requireFeedbackForReview}
                  onChange={(e) => setSettings((s) => ({ ...s, requireFeedbackForReview: e.target.checked }))}
                />
              </label>

              <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">Notify on new submission</span>
                <input
                  type="checkbox"
                  checked={settings.notifyOnNewSubmission}
                  onChange={(e) => setSettings((s) => ({ ...s, notifyOnNewSubmission: e.target.checked }))}
                />
              </label>

              <label className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex items-center justify-between gap-3">
                <span className="text-sm font-semibold text-slate-700">Allow late extra-work</span>
                <input
                  type="checkbox"
                  checked={settings.allowLateExtraWork}
                  onChange={(e) => setSettings((s) => ({ ...s, allowLateExtraWork: e.target.checked }))}
                />
              </label>
            </div>

            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="text-sm font-semibold text-slate-700 block">Default extra class duration (minutes)</label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  value={settings.defaultExtraClassDuration}
                  onChange={(e) => setSettings((s) => ({ ...s, defaultExtraClassDuration: Number(e.target.value) || 60 }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <label className="text-sm font-semibold text-slate-700 block">Teacher working mode</label>
                <select
                  value={settings.workingMode}
                  onChange={(e) => setSettings((s) => ({ ...s, workingMode: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="strict">Strict</option>
                  <option value="balanced">Balanced</option>
                  <option value="supportive">Supportive</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center gap-1 disabled:opacity-60"
            >
              <Save className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h3 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> System Health
              </h3>
              <p className="text-sm text-slate-600 mt-2">{healthStatus}</p>
              <div className="mt-3 space-y-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 flex justify-between">
                  <span className="text-xs text-slate-500">Managed Classes</span>
                  <span className="text-sm font-bold text-slate-800">{overview?.managedClasses ?? 0}</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 flex justify-between">
                  <span className="text-xs text-slate-500">Pending Checks</span>
                  <span className="text-sm font-bold text-amber-600">{overview?.pendingReviewCount ?? 0}</span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-2 flex justify-between">
                  <span className="text-xs text-slate-500">Reviewed</span>
                  <span className="text-sm font-bold text-emerald-600">{overview?.reviewedCount ?? 0}</span>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg">
              <h3 className="text-lg font-black text-slate-900 inline-flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-600" /> Quick Links
              </h3>
              <div className="mt-3 space-y-2">
                <button onClick={() => navigate("/admin/submissions")} className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm font-semibold text-slate-700 inline-flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4" /> Review Written Exams
                </button>
                <button onClick={() => navigate("/admin/control-center")} className="w-full text-left rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm font-semibold text-slate-700 inline-flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Open Teacher Control Center
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
