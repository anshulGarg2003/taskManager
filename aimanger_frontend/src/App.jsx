/* eslint-disable react/prop-types */
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Paste from "./components/Paste";
import Navbar from "./components/Navbar";
import HeroPage from "./components/HeroPage";
import DayPlanner2 from "./components/DayPlanner";
import Dashboard from "./components/Dashboard";
import YearPlanner from "./components/calender";
import StudyPage from "./components/StudyPage";
import AdminPage from "./admin/page";
import AdminUser from "./admin/pages/AdminUser";
import AdminQuestions from "./admin/pages/AdminQuestions";
import AdminQuizManager from "./admin/pages/AdminQuizManager";
import AdminSettings from "./admin/pages/AdminSettings";
import AddChapter from "./admin/pages/AddChapter";
import AdminControlCenter from "./admin/pages/AdminControlCenter";
import QuizPage from "./components/QuizPage";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import WeeklyPlanner from "./components/WeeklyPlanner";
import GoalTracker from "./components/GoalTracker";
import Leaderboard from "./components/Leaderboard";
import StudyTimer from "./components/StudyTimer";
import ScribbleExam from "./components/ScribbleExam";
import AdminSubmissionsReview from "./admin/pages/AdminSubmissionsReview";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import SignupPage from "./components/SignupPage";
import SessionExpiredPage from "./components/SessionExpiredPage";
import TokenExpiredPage from "./components/TokenExpiredPage";
import ServerUnavailablePage from "./components/ServerUnavailablePage";
import UnauthorizedPage from "./components/UnauthorizedPage";
import NotFoundPage from "./components/NotFoundPage";
import LogoutPage from "./components/LogoutPage";
import LoggedOutPage from "./components/LoggedOutPage";
import StudentProfilePage from "./components/StudentProfilePage";
import TeacherProfilePage from "./components/TeacherProfilePage";
import HolidayRequestPage from "./components/HolidayRequestPage";
import AdminAnnouncements from "./admin/pages/AdminAnnouncements";
import AdminHolidayRequests from "./admin/pages/AdminHolidayRequests";

const W = ({ children }) => (
  <div className="platform-shell w-full min-h-screen flex flex-col">{children}</div>
);

const ProtectedWithNav = ({ children }) => (
  <W>
    <Navbar />
    <ProtectedRoute>{children}</ProtectedRoute>
  </W>
);

const AdminWithNav = ({ children }) => (
  <W>
    <Navbar />
    <AdminRoute>{children}</AdminRoute>
  </W>
);

const router = createBrowserRouter([
  { path: "/", element: <W><Navbar /><HeroPage /></W> },
  { path: "/signup", element: <W><Navbar /><SignupPage /></W> },
  { path: "/session-expired", element: <W><Navbar /><SessionExpiredPage /></W> },
  { path: "/token-expired", element: <W><Navbar /><TokenExpiredPage /></W> },
  { path: "/server-unavailable", element: <W><Navbar /><ServerUnavailablePage /></W> },
  { path: "/unauthorized", element: <W><Navbar /><UnauthorizedPage /></W> },
  { path: "/logout", element: <W><Navbar /><LogoutPage /></W> },
  { path: "/logged-out", element: <W><Navbar /><LoggedOutPage /></W> },
  { path: "/home", element: <ProtectedWithNav><Home /></ProtectedWithNav> },
  { path: "/pastes", element: <ProtectedWithNav><Paste /></ProtectedWithNav> },
  { path: "/calender", element: <ProtectedWithNav><YearPlanner /></ProtectedWithNav> },
  { path: "/planner", element: <ProtectedWithNav><DayPlanner2 /></ProtectedWithNav> },
  { path: "/dashboard", element: <ProtectedWithNav><Dashboard /></ProtectedWithNav> },
  { path: "/study", element: <ProtectedWithNav><StudyPage /></ProtectedWithNav> },
  // New platform routes
  { path: "/quiz", element: <ProtectedWithNav><QuizPage /></ProtectedWithNav> },
  { path: "/analytics", element: <ProtectedWithNav><AnalyticsDashboard /></ProtectedWithNav> },
  { path: "/weekly", element: <ProtectedWithNav><WeeklyPlanner /></ProtectedWithNav> },
  { path: "/goals", element: <ProtectedWithNav><GoalTracker /></ProtectedWithNav> },
  { path: "/leaderboard", element: <ProtectedWithNav><Leaderboard /></ProtectedWithNav> },
  { path: "/timer", element: <ProtectedWithNav><StudyTimer /></ProtectedWithNav> },
  { path: "/exam-write", element: <ProtectedWithNav><ScribbleExam /></ProtectedWithNav> },
  { path: "/profile/student", element: <ProtectedWithNav><StudentProfilePage /></ProtectedWithNav> },
  { path: "/profile/teacher", element: <ProtectedWithNav><TeacherProfilePage /></ProtectedWithNav> },
  { path: "/holiday-request", element: <ProtectedWithNav><HolidayRequestPage /></ProtectedWithNav> },
  // Admin routes
  { path: "/admin/quiz", element: <AdminWithNav><AdminQuizManager /></AdminWithNav> },
  { path: "/admin", element: <AdminWithNav><AdminPage /></AdminWithNav> },
  { path: "/admin/users", element: <AdminWithNav><AdminUser /></AdminWithNav> },
  { path: "/admin/questions", element: <AdminWithNav><AdminQuestions /></AdminWithNav> },
  { path: "/admin/submissions", element: <AdminWithNav><AdminSubmissionsReview /></AdminWithNav> },
  { path: "/admin/announcements", element: <AdminWithNav><AdminAnnouncements /></AdminWithNav> },
  { path: "/admin/holidays", element: <AdminWithNav><AdminHolidayRequests /></AdminWithNav> },
  { path: "/admin/control-center", element: <AdminWithNav><AdminControlCenter /></AdminWithNav> },
  { path: "/admin/settings", element: <AdminWithNav><AdminSettings /></AdminWithNav> },
  { path: "/admin/addchapter", element: <AdminWithNav><AddChapter /></AdminWithNav> },
  { path: "*", element: <W><Navbar /><NotFoundPage /></W> },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

