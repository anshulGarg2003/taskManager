import { User } from "lucide-react";
import { NavbarData } from "../data/Navbar";
import { NavLink, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-gray-900 shadow-lg p-4 top-0 left-0 z-50 overflow-x-hidden">
      <div className="flex justify-between items-center max-w-6xl mx-auto px-4">
        {/* Navbar Links */}
        <div className="flex gap-x-6">
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
        </div>

        {/* Profile Button */}
        <button
          onClick={() => navigate("/dashboard")}
          className="relative flex items-center justify-center w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-600 transition-all shadow-lg hover:shadow-purple-500/50"
        >
          <User className="text-white w-5 h-5" />
          <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-gray-900"></span>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
