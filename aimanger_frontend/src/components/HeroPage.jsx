import { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../redux/userSlice";
import { BASIC_URL } from "../utlis/API_calls";
import toast from "react-hot-toast";
import { setErrorStatus } from "../redux/error";
import {
  Sparkles,
  CalendarCheck2,
  Brain,
  Trophy,
  Clock3,
  BarChart3,
  Flame,
} from "lucide-react";

const HeroPage = () => {
  const { user } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const Error = useSelector((state) => state.error);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    if (Error.isOpen) {
      toast.error(Error.message);
      dispatch(setErrorStatus({ isOpen: false }));
    }
  }, [Error.isOpen, Error.message, dispatch]);

  const handleLogin = () => {
    navigate("/signup");
  };

  useEffect(() => {
    if (user) {
      fetch(`${BASIC_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth0Id: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
          isPaid: false,
          role: "student",
        }),
      })
        .then((res) => res.json()) // ✅ Parse JSON response
        .then((data) => {
          // console.log(data);
          dispatch(setUserInfo(data));

          navigate("/dashboard"); // Redirect after storing data
        })
        .catch((error) => {
          console.error("Error storing user:", error);
          navigate("/server-unavailable");
        });
    }
  }, [user, dispatch, navigate]);

  // console.log(userInfo);

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-72px)] px-4 md:px-8 py-10 md:py-16">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_10%_20%,rgba(14,165,233,0.22),transparent_30%),radial-gradient(circle_at_90%_15%,rgba(249,115,22,0.22),transparent_32%),radial-gradient(circle_at_35%_85%,rgba(236,72,153,0.18),transparent_28%)]" />

      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-7 rounded-3xl border border-slate-200 bg-white/85 backdrop-blur p-6 md:p-8 shadow-xl"
        >
          <p className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Student Success Platform
          </p>

          <h1 className="text-4xl md:text-6xl font-black mt-4 leading-tight text-slate-900">
            Study Better,
            <br />
            <span className="bg-gradient-to-r from-sky-600 to-fuchsia-600 bg-clip-text text-transparent">
              Score Higher.
            </span>
          </h1>

          <p className="mt-4 text-slate-600 text-base md:text-lg max-w-2xl">
            Plan your day, track your progress, run quizzes, and build strong study habits from one place designed for students.
          </p>

          <motion.div
            className="mt-6 flex flex-wrap gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {userInfo.id != "" ? (
              <>
                <motion.button
                  onClick={() => navigate("/dashboard")}
                  className="px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Open Dashboard
                </motion.button>
                <motion.button
                  onClick={() => navigate("/logout")}
                  className="px-6 py-3 rounded-full text-base font-semibold bg-rose-100 text-rose-700 border border-rose-200"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Log Out
                </motion.button>
              </>
            ) : (
              <>
                <motion.button
                  onClick={handleLogin}
                  className="px-6 py-3 rounded-full text-base font-bold bg-gradient-to-r from-sky-600 to-indigo-600 text-white shadow-lg"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Start Learning
                </motion.button>
                <motion.button
                  onClick={() => navigate("/quiz")}
                  className="px-6 py-3 rounded-full text-base font-semibold bg-white text-slate-800 border border-slate-300"
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  Explore Quizzes
                </motion.button>
              </>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 gap-3"
        >
          {[
            {
              title: "Smart Planner",
              text: "Organize daily and weekly study sessions with reminders.",
              icon: CalendarCheck2,
              tone: "from-cyan-500 to-blue-500",
            },
            {
              title: "AI Guidance",
              text: "Get recommendations based on weak topics and trends.",
              icon: Brain,
              tone: "from-violet-500 to-fuchsia-500",
            },
            {
              title: "Leaderboard",
              text: "Compete with peers and stay motivated every week.",
              icon: Trophy,
              tone: "from-amber-500 to-orange-500",
            },
            {
              title: "Performance Analytics",
              text: "Track score, streak, consistency, and productivity.",
              icon: BarChart3,
              tone: "from-emerald-500 to-teal-500",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                whileHover={{ y: -3 }}
                className="rounded-2xl border border-slate-200 bg-white/85 backdrop-blur p-4 shadow-lg"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${item.tone} text-white flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="mt-3 text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="text-sm text-slate-600 mt-1">{item.text}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 max-w-7xl mx-auto mt-6 md:mt-8"
      >
        <div className="rounded-2xl border border-slate-200 bg-white/75 backdrop-blur p-3 md:p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Study Streak", value: "14 days", icon: Flame },
            { label: "Avg Focus", value: "2.9h/day", icon: Clock3 },
            { label: "Quiz Accuracy", value: "82%", icon: BarChart3 },
            { label: "Goals Hit", value: "11 / 15", icon: Trophy },
          ].map((kpi) => {
            const Icon = kpi.icon;
            return (
              <div key={kpi.label} className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-xs text-slate-500 inline-flex items-center gap-1"><Icon className="w-3.5 h-3.5" /> {kpi.label}</p>
                <p className="text-xl md:text-2xl font-black text-slate-900 mt-1">{kpi.value}</p>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default HeroPage;
