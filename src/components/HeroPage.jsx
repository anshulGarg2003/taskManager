import React, { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { setUserInfo } from "../redux/userSlice";
import { BASIC_URL } from "../utlis/API_calls";
import toast from "react-hot-toast";
import { setErrorStatus } from "../redux/error";

const HeroPage = () => {
  const { user, loginWithRedirect, logout } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const Error = useSelector((state) => state.error);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (Error.isOpen) {
    toast.error(Error.message);
    setErrorStatus({ isOpen: false });
  }

  const handleLogin = () => {
    setLoading(true);
    loginWithRedirect();
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
          console.log(data);
          dispatch(setUserInfo(data));
          setLoading(false);

          navigate("/dashboard"); // Redirect after storing data
        })
        .catch((error) => console.error("Error storing user:", error));
    }
  }, [user, userInfo, dispatch, navigate]);

  console.log(userInfo);

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
        {userInfo.id != "" ? (
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
            onClick={handleLogin}
            className="bg-blue-700 hover:bg-blue-800 px-6 py-3 rounded-full text-lg font-semibold transition-all shadow-lg hover:scale-105"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {loading ? "Please Wait" : "Log In"}
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default HeroPage;
