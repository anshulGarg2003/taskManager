import { User, Menu } from "lucide-react";
import { NavbarData } from "../data/Navbar";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.user);
  console.log(userInfo);
  const [isOpen, setIsOpen] = useState(false);

  const handleDashboard = () => {
    if (!userInfo?.id) {
      toast.error("Please Login to see the Dashboard");
      return;
    }
    navigate("/dashboard");
  };

  return (
    <div className="w-full bg-gray-900 shadow-lg p-4 top-0 left-0 z-50">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4">
        {/* Hamburger Menu (Mobile) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          <Menu className="w-8 h-8" />
        </button>

        {/* Navbar Links (Hidden on Mobile, Visible on Larger Screens) */}
        <div className="hidden md:flex gap-x-6">
          {NavbarData.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold text-lg transition-all"
                  : "text-white font-medium text-lg hover:text-purple-300"
              }
            >
              {link.title}
            </NavLink>
          ))}
          {userInfo.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold text-lg transition-all"
                  : "text-white font-medium text-lg hover:text-purple-300"
              }
            >
              Admin
            </NavLink>
          )}
        </div>

        {/* Profile Button */}
        <button
          onClick={() => handleDashboard()}
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-500/50"
        >
          <User className="text-white w-5 h-5" />
          {userInfo.id != "" && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></span>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="flex flex-col md:hidden bg-gray-800 p-4 gap-y-4">
          {NavbarData.map((link, idx) => (
            <NavLink
              key={idx}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="text-white text-lg hover:text-purple-300"
            >
              {link.title}
            </NavLink>
          ))}
          {userInfo.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive
                  ? "text-purple-400 font-semibold text-lg transition-all"
                  : "text-white font-medium text-lg hover:text-purple-300"
              }
            >
              Admin
            </NavLink>
          )}
        </div>
      )}
    </div>
  );
};

export default Navbar;
