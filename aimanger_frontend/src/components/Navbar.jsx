import {
  ArrowLeft,
  User,
  Menu,
  X,
  LayoutDashboard,
  GraduationCap,
  CalendarDays,
  BookOpen,
  BarChart3,
  Trophy,
  Timer,
  Target,
  NotebookText,
  ChevronDown,
  PenTool,
} from "lucide-react";
import { NavbarCategories } from "../data/Navbar";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userInfo = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const dropdownRef = useRef(null);

  const linkIcons = {
    Dashboard: LayoutDashboard,
    Profile: GraduationCap,
    Today: CalendarDays,
    Weekly: CalendarDays,
    Holiday: CalendarDays,
    Quizzes: BookOpen,
    Analytics: BarChart3,
    Goals: Target,
    "Write Exam": PenTool,
    Ranks: Trophy,
    Timer,
    Notes: NotebookText,
  };

  const initials =
    userInfo?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "ST";

  const activeCategory = useMemo(() => {
    return NavbarCategories.find((category) =>
      category.items.some((item) => item.path === location.pathname)
    )?.title;
  }, [location.pathname]);

  const handleDashboard = () => {
    if (!userInfo?.id) {
      toast.error("Please Login to see the Dashboard");
      return;
    }
    navigate("/dashboard");
  };

  const profilePath = userInfo?.role === "teacher" || userInfo?.role === "admin"
    ? "/profile/teacher"
    : "/profile/student";

  const handleBack = () => {
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
      return;
    }

    if (userInfo?.id) {
      navigate("/dashboard");
      return;
    }

    navigate("/");
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(event.target)) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    setOpenDropdown(null);
  }, [location.pathname]);

  return (
    <nav className="platform-navbar sticky top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-3 md:px-5 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-fit">
          <button
            onClick={handleBack}
            className="platform-nav-back-btn"
            title="Go back"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <button
            onClick={() => setIsOpen(true)}
            className="md:hidden text-slate-700 rounded-xl border border-slate-300 p-1.5"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => navigate("/")}
            className="platform-brand"
          >
            <span className="platform-brand-dot" />
            StudySprint
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center gap-2">
          <div ref={dropdownRef} className="hidden md:flex items-center gap-2 flex-wrap justify-center">
          {NavbarCategories.map((category) => {
            const isActiveCategory = activeCategory === category.title;

            return (
              <div
                key={category.title}
                className="relative"
              >
                <button
                  className={`platform-nav-category-btn ${isActiveCategory ? "platform-nav-category-btn-active" : ""}`}
                  onClick={() =>
                    setOpenDropdown((curr) =>
                      curr === category.title ? null : category.title
                    )
                  }
                >
                  {category.title}
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {openDropdown === category.title && (
                  <div className="platform-nav-dropdown">
                    {category.items.map((link) => {
                      const Icon = linkIcons[link.title] || User;
                      return (
                        <NavLink
                          key={link.path}
                          to={link.path}
                          className={({ isActive }) =>
                            isActive
                              ? "platform-nav-link platform-nav-link-active"
                              : "platform-nav-link"
                          }
                          onClick={() => setOpenDropdown(null)}
                        >
                          <Icon className="w-4 h-4" />
                          {link.title}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {(userInfo.role === "admin" || userInfo.role === "teacher") && (
            <NavLink
              to="/admin"
              className={({ isActive }) => {
                const base = "platform-nav-link";
                return isActive ? `${base} platform-nav-link-active` : base;
              }}
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </NavLink>
          )}

          {userInfo?.id && (
            <NavLink
              to={profilePath}
              className={({ isActive }) => {
                const base = "platform-nav-link";
                return isActive ? `${base} platform-nav-link-active` : base;
              }}
            >
              <GraduationCap className="w-4 h-4" />
              Profile
            </NavLink>
          )}
          </div>
        </div>

        <button
          onClick={handleDashboard}
          className="platform-profile"
          title={userInfo?.name ? `Open dashboard for ${userInfo.name}` : "Open dashboard"}
        >
          {userInfo?.picture ? (
            <img
              src={userInfo.picture}
              alt={userInfo?.name || "Profile"}
              className="w-9 h-9 rounded-full object-cover border border-white/70"
            />
          ) : (
            <span className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center border border-white/70">
              {initials}
            </span>
          )}
          <span className="hidden sm:block text-left">
            <span className="block text-[11px] text-slate-500 leading-none capitalize">{userInfo?.role || "Student"}</span>
            <span className="block text-sm font-semibold text-slate-800 leading-tight max-w-[140px] truncate">
              {userInfo?.name || "Open Dashboard"}
            </span>
          </span>
          {userInfo.id && <span className="platform-online-dot" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/55 backdrop-blur-sm flex flex-col items-center justify-start overflow-auto gap-y-4 z-50 px-4 py-20">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 text-white rounded-xl border border-white/30 p-1.5"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>

          {NavbarCategories.map((category) => (
            <div
              key={category.title}
              className="w-full max-w-sm rounded-2xl border border-white/40 bg-white/20 backdrop-blur p-3"
            >
              <p className="text-white text-sm font-bold px-1 mb-2">{category.title}</p>
              <div className="space-y-2">
                {category.items.map((link) => {
                  const Icon = linkIcons[link.title] || User;
                  return (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className="w-full rounded-xl bg-white/90 px-4 py-3 text-slate-800 font-semibold flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4" />
                      {link.title}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}

          {(userInfo.role === "admin" || userInfo.role === "teacher") && (
            <NavLink
              to="/admin"
              onClick={() => setIsOpen(false)}
              className="w-full max-w-sm rounded-2xl bg-white/90 px-4 py-3 text-slate-800 font-semibold flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </NavLink>
          )}

          {userInfo?.id && (
            <NavLink
              to={profilePath}
              onClick={() => setIsOpen(false)}
              className="w-full max-w-sm rounded-2xl bg-white/90 px-4 py-3 text-slate-800 font-semibold flex items-center gap-2"
            >
              <GraduationCap className="w-4 h-4" />
              Profile
            </NavLink>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
