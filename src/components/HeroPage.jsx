import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const HeroPage = () => {
  const { user, loginWithRedirect, logout, isAuthenticated } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetch("http://localhost:5001/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth0Id: user.sub,
          name: user.name,
          email: user.email,
          picture: user.picture,
        }),
      })
        .then((res) => res.json())
        .then(() => navigate("/dashboard")) // Redirect after login
        .catch((error) => console.error("Error storing user:", error));
    }
  }, [user, navigate]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white">
      {/* Title with animation */}
      <motion.h1
        className="text-5xl font-extrabold mb-6 text-center drop-shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        Welcome to Your{" "}
        <span className="text-yellow-300">Personal Assistant</span>
      </motion.h1>

      {/* Buttons with smooth motion */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {isAuthenticated ? (
          <motion.button
            onClick={() => logout({ returnTo: window.location.origin })}
            className="bg-red-500 hover:bg-red-600 px-6 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:scale-105"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Log Out
          </motion.button>
        ) : (
          <motion.button
            onClick={loginWithRedirect}
            className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:scale-105"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            Log In
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default HeroPage;
