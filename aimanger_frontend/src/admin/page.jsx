import { motion } from "framer-motion";
import {
  Users,
  ClipboardList,
  FileCheck2,
  Library,
  Rocket,
  ShieldCheck,
  CalendarRange,
  Megaphone,
  CalendarClock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminPage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Teacher Control Center",
      subtitle: "Manage classes, roster, extra classes, reschedules, surprise tests, extra work, and analytics",
      icon: Rocket,
      tone: "from-sky-600 to-indigo-600",
      route: "/admin/control-center",
      cta: "Open Control Center",
    },
    {
      title: "Question Bank",
      subtitle: "Add and maintain question inventory for quick tests and challenge papers",
      icon: ClipboardList,
      tone: "from-violet-600 to-fuchsia-600",
      route: "/admin/questions",
      cta: "Manage Questions",
    },
    {
      title: "Written Exam Reviews",
      subtitle: "Check student PDF submissions, annotate, and publish reviewed copies",
      icon: FileCheck2,
      tone: "from-emerald-600 to-teal-600",
      route: "/admin/submissions",
      cta: "Review Submissions",
    },
    {
      title: "Student Directory",
      subtitle: "View all users and monitor enrollment profile information",
      icon: Users,
      tone: "from-orange-500 to-amber-500",
      route: "/admin/users",
      cta: "Manage Users",
    },
    {
      title: "Chapter Planner",
      subtitle: "Maintain chapter data used across quizzes, planning, and curriculum setup",
      icon: Library,
      tone: "from-pink-500 to-rose-600",
      route: "/admin/addchapter",
      cta: "Add Chapter",
    },
    {
      title: "Admin Settings",
      subtitle: "Configure system-level controls and policy-level preferences",
      icon: ShieldCheck,
      tone: "from-slate-600 to-slate-800",
      route: "/admin/settings",
      cta: "Open Settings",
    },
    {
      title: "Announcement Edition",
      subtitle: "Create and edit student-facing announcement banners",
      icon: Megaphone,
      tone: "from-sky-500 to-cyan-600",
      route: "/admin/announcements",
      cta: "Manage Announcements",
    },
    {
      title: "Holiday Requests",
      subtitle: "Review leave requests submitted by students",
      icon: CalendarClock,
      tone: "from-emerald-500 to-teal-600",
      route: "/admin/holidays",
      cta: "Review Requests",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-72px)] p-4 md:p-8 bg-[radial-gradient(circle_at_8%_8%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_92%_12%,rgba(251,146,60,0.22),transparent_30%),linear-gradient(145deg,#f8fafc,#eef2ff)]">
      <div className="max-w-7xl mx-auto">
        <div className="rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 shadow-xl">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-sky-700 bg-sky-100 px-3 py-1 rounded-full">
            <CalendarRange className="w-3.5 h-3.5" /> Teacher and Admin Workspace
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-3">Control Your School Operations</h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base max-w-4xl">
            Design better classroom experiences with class control, student insights, exam review, and quick operational actions built for teachers.
          </p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {cards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.button
                key={card.title}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => navigate(card.route)}
                className="text-left rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-5 shadow-lg"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-r ${card.tone} text-white flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-3 text-xl font-black text-slate-900">{card.title}</h3>
                <p className="text-sm text-slate-600 mt-1 min-h-[52px]">{card.subtitle}</p>
                <span className="mt-3 inline-flex px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold">
                  {card.cta}
                </span>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
