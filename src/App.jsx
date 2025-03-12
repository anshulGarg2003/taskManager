import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./components/Home";
import Paste from "./components/Paste";
import ViewPaste from "./components/ViewPaste";
import Navbar from "./components/Navbar";
import HeroPage from "./components/HeroPage";
import DayPlanner2 from "./components/DayPlanner";
import Dashboard from "./components/Dashboard";
import YearPlanner from "./components/calender";
import StudyPage from "./components/StudyPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <HeroPage />
      </div>
    ),
  },
  {
    path: "/home",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <Home />
      </div>
    ),
  },
  {
    path: "/pastes",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <Paste />
      </div>
    ),
  },
  {
    path: "/pastes/:id",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <ViewPaste />
      </div>
    ),
  },
  {
    path: "/calender",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <YearPlanner />
      </div>
    ),
  },
  {
    path: "/planner",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <DayPlanner2 />
      </div>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <div className="w-full h-full flex flex-col">
        <Navbar />
        <div className="flex flex-row gap-3 bg-gradient-to-br from-gray-900 via-purple-900 to-black text-white">
          <Dashboard />
          <StudyPage />
        </div>
      </div>
    ),
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
