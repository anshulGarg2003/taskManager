export const NavbarCategories = [
  {
    title: "Overview",
    items: [
      { path: "/dashboard", title: "Dashboard" },
      { path: "/analytics", title: "Analytics" },
      { path: "/goals", title: "Goals" },
    ],
  },
  {
    title: "Planning",
    items: [
      { path: "/planner", title: "Today" },
      { path: "/weekly", title: "Weekly" },
      { path: "/timer", title: "Timer" },
      { path: "/holiday-request", title: "Holiday" },
      { path: "/pastes", title: "Notes" },
    ],
  },
  {
    title: "Practice",
    items: [
      { path: "/exam-write", title: "Write Exam" },
      { path: "/quiz", title: "Quizzes" },
      { path: "/leaderboard", title: "Ranks" },
    ],
  },
];

// Backward-compatible flat list for any component still expecting old shape.
export const NavbarData = NavbarCategories.flatMap((category) => category.items);
