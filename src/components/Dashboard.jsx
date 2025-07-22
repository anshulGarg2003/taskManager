import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const Dashboard = () => {
  const { isAuthenticated, isLoading, logout } = useAuth0();
  const [userData, setUserData] = useState(null);
  const userInfo = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      setUserData(userInfo);
    }
  }, [isAuthenticated, navigate, userInfo]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Loading...
      </div>
    );

  return (
    <div className="h-screen flex items-center justify-center p-4 md:p-8">
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-xl p-6 md:p-8 rounded-2xl text-center max-w-md md:max-w-lg w-full border border-white border-opacity-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.img
          src={userData?.picture}
          alt="Profile"
          className="w-20 h-20 md:w-24 md:h-24 rounded-full mx-auto border-4 border-purple-400 shadow-lg"
          initial={{ y: -10 }}
          animate={{ y: 10 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <h2 className="text-2xl md:text-3xl font-bold mt-4">
          Welcome,{" "}
          <span className="text-purple-400">{userData?.name || "User"}!</span>
        </h2>
        <p className="text-gray-300 mt-2 text-sm md:text-lg">
          Email: {userData?.email}
        </p>

        <div className="mt-6 flex flex-col gap-3 md:gap-4">
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 px-5 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/home")}
          >
            Let's Add Task
          </motion.button>

          <motion.button
            className="bg-red-600 hover:bg-red-700 px-5 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg font-semibold transition-all shadow-lg hover:shadow-red-500/50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => logout()}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
