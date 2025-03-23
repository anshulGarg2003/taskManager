import { useEffect, useState } from "react";
import Math from "../data/Math";
import Physics from "../data/Physics";
import PhysicalChem from "../data/PhysicalChem";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import { BASIC_URL } from "../utlis/API_calls";

const subjects = {
  Mathematics: Math,
  Physics: Physics,
  "Physical Chemistry": PhysicalChem,
};

export default function Subjects() {
  const [subject, setSubject] = useState(null);
  const [chapter, setChapter] = useState(null);

  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  console.log(userInfo);

  const handleChapterSchedule = async () => {
    if (!isAuthenticated) return toast.error("Please Login First");
    // if (!userInfo.isPaid)
    //   return toast.error(
    //     "You have to purchase our premium servies to avail this feature"
    //   );
    if (!chapter || !chapter.topics) return toast.error("No chapter selected!");
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Start scheduling from tomorrow

    const subtopics = chapter.topics.map((topic, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + index); // Schedule one per day

      return {
        name: topic.name,
        difficulty:
          topic.difficulty === "Easy"
            ? "low"
            : topic.difficulty === "Medium"
            ? "medium"
            : "high",
        date: eventDate.toISOString().split("T")[0], // Format YYYY-MM-DD
        time: "07:00",
      };
    });

    const studyPlan = {
      userId: userInfo.id,
      subject,
      chapter: chapter.chapter,
      subtopics,
    };

    console.log(studyPlan);
    try {
      const response = await fetch(`${BASIC_URL}/api/schedule/chapter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(studyPlan),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Study plan scheduled successfully!");
      } else {
        toast.error("Failed to schedule: " + result.message);
      }
    } catch (error) {
      console.error("Error scheduling study plan:", error);
      toast.error("Something went wrong!");
    }
  };

  return (
    <div className="p-5 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-500 flex justify-center items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full"
      >
        {/* Subject Selection */}
        {!subject ? (
          <div className="space-y-3 text-center w-full">
            <h2 className="text-2xl font-bold text-gray-800 w-full">
              Select a Subject you want to Study
            </h2>
            {Object.keys(subjects).map((subject) => (
              <motion.button
                key={subject}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium p-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 w-full transition-all"
                onClick={() => setSubject(subject)}
              >
                {subject}
              </motion.button>
            ))}
          </div>
        ) : !chapter ? (
          // Chapter Selection
          <div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-3 w-full">
              {subject} - Select a Chapter
            </h2>
            <div className="space-y-2 w-full">
              {subjects[subject].map((item, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="block bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium p-3 rounded-lg shadow-md hover:from-teal-500 hover:to-blue-500 w-full transition-all"
                  onClick={() => setChapter(item)}
                >
                  {item.chapter}
                </motion.button>
              ))}
            </div>
            <button
              className="mt-4 text-red-600 underline font-semibold hover:text-red-800 transition w-full"
              onClick={() => setSubject(null)}
            >
              ← Back to Subjects
            </button>
          </div>
        ) : (
          // Topic Selection with Time and Difficulty
          <div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-3 w-full">
              {chapter.chapter} - Topics
            </h2>
            <ul className="list-none space-y-2 w-full">
              {chapter.topics.map((topic, index) => (
                <motion.li
                  key={index}
                  className="bg-gray-100 p-3 rounded-lg shadow-sm text-gray-800 hover:bg-gray-200 transition flex justify-between items-center"
                  whileHover={{ scale: 1.02 }}
                >
                  <div onClick={() => handleTopicSelect(topic)}>
                    <span className="font-medium">{topic.name}</span>
                    <p className="text-sm text-gray-600">
                      Time: {topic.duration}mins | Difficulty:{" "}
                      {topic.difficulty}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
            <button
              className="mt-4 bg-gray-700 text-white font-medium p-3 rounded-lg shadow-lg hover:bg-gray-900 transition-all w-full"
              onClick={() => handleChapterSchedule()}
            >
              Schedule the chapter
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
