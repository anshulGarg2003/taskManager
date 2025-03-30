import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import Typewriter from "typewriter-effect";

export default function AdminPage() {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Title with Typewriter Animation */}
      <h1 className="text-5xl font-extrabold mb-6 text-center drop-shadow-lg">
        <Typewriter
          options={{
            strings: ["Welcome Admin", "Make changes that benefit student"],
            autoStart: true,
            loop: true,
            delay: 100,
          }}
        />
      </h1>

      {/* Admin options */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.button
          className={`bg-blue-600 hover:brightness-125 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:scale-105`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/admin/users")}
        >
          Manage Users
        </motion.button>
        <motion.button
          className={`bg-purple-600 hover:brightness-125 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:scale-105`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/admin/questions")}
        >
          Manage Questions to Test
        </motion.button>
        <motion.button
          className={`bg-pink-600 hover:brightness-125 px-8 py-4 rounded-lg text-lg font-semibold transition-all shadow-lg hover:scale-105`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate("/admin/settings")}
        >
          Settings
        </motion.button>
      </motion.div>
    </div>
  );
}
