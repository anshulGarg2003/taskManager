import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth0();
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
    } else {
      setUserData(user);
    }
  }, [isAuthenticated, navigate, user]);

  if (isLoading)
    return (
      <div className="flex h-screen items-center justify-center text-white text-xl">
        Loading...
      </div>
    );

  return (
    <div className="h-screen flex items-center justify-center ml-5 ">
      {/* Main Dashboard Card */}
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg shadow-xl p-8 rounded-2xl text-center max-w-lg w-full border border-white border-opacity-20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        {/* Profile Image with Floating Animation */}
        <motion.img
          src={userData?.picture}
          alt="Profile"
          className="w-24 h-24 rounded-full mx-auto border-4 border-purple-400 shadow-lg"
          initial={{ y: -10 }}
          animate={{ y: 10 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        <h2 className="text-3xl font-bold mt-4">
          Welcome,{" "}
          <span className="text-purple-400">{userData?.name || "User"}!</span>
        </h2>
        <p className="text-gray-300 mt-2 text-lg">Email: {userData?.email}</p>

        {/* Buttons Container */}
        <div className="mt-6 flex flex-col gap-4">
          {/* Add Task Button */}
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-purple-500/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate("/home")}
          >
            Let's Add Task
          </motion.button>

          {/* Logout Button */}
          <motion.button
            className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:shadow-red-500/50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => logout({ returnTo: window.location.origin })}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
