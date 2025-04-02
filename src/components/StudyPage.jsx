import { useEffect, useState } from "react";
import Math from "../data/Math";
import Physics from "../data/Physics";
import PhysicalChem from "../data/PhysicalChem";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useAuth0 } from "@auth0/auth0-react";
import toast from "react-hot-toast";
import { BASIC_URL } from "../utlis/API_calls";
import { setUserEduInfo } from "../redux/userSlice";
import axios from "axios";

const subjects = {
  Mathematics: Math,
  Physics: Physics,
  "Physical Chemistry": PhysicalChem,
};
const subjects2 = {
  Mathematics: "maths",
  Physics: "physics",
  "Physical Chemistry": PhysicalChem,
};

export default function Subjects() {
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState(null);
  const [chapterOptions, setChapterOptions] = useState([]);
  const [chapter, setChapter] = useState(null);
  const [chapter2, setChapter2] = useState(null);
  const [chapterIndex, setChapterIndex] = useState(null);
  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState(null);
  const [time, setTime] = useState("");
  const [showForm, setShowForm] = useState(false);
  const dispatch = useDispatch();

  const { isAuthenticated } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  // console.log(userInfo);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        setLoading(true); // Set loading before request
        const response = await axios.get(
          `${BASIC_URL}/api/${subjects2[subject]}/all-chapters`
        );
        setChapterOptions(response.data);
        console.log(chapterOptions.length);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false); // Ensure loading stops after request
      }
    };

    if (subject) fetchChapter();
  }, [subject]);

  useEffect(() => {
    if (!userInfo.school || !userInfo.grade) {
      setShowForm(true);
    }
  }, [userInfo]);

  const handleSaveDetails = async () => {
    if (!userInfo.id) {
      return toast.error("Please Login first to add the details");
    }

    if (!school || !grade) {
      return toast.error("Please provide both School and Grade!");
    }

    const userData = {
      school,
      grade,
    };

    try {
      const response = await fetch(
        `${BASIC_URL}/api/users/${userInfo.id}/addeduinfo`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        dispatch(setUserEduInfo(result)); // Update Redux store
        toast.success("Education info updated successfully!");
        setShowForm(false);
        // navigate("/dashboard"); // Redirect after storing data
      } else {
        toast.error("Failed to update: " + result.message);
      }
    } catch (error) {
      console.error("Error updating education info:", error);
      toast.error("Something went wrong!");
    }
  };

  const handleChapterSchedule = async () => {
    if (!isAuthenticated) return toast.error("Please Login First");
    if (!userInfo.isPaid)
      return toast.error(
        "You have to purchase our premium servies to avail this feature"
      );
    if (!chapter || !chapter.subtopics)
      return toast.error("No chapter selected!");
    if (time == "") return toast.error("Please select the preferred timing");

    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    let endDate = new Date();

    const subtopics = chapter.subtopics.map((item, index) => {
      const eventDate = new Date(startDate);
      eventDate.setDate(startDate.getDate() + index); // Schedule one per day
      endDate = eventDate;
      return {
        name: item.topic,
        difficulty:
          item.difficulty === "Easy"
            ? "low"
            : topic.difficulty === "Medium"
            ? "medium"
            : "high",
        date: eventDate.toISOString().split("T")[0], // Format YYYY-MM-DD
        time: time,
      };
    });

    const studyPlan = {
      userId: userInfo.id,
      subject,
      chapter: chapter.chapter,
      subtopics,
      completeAt: endDate,
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
    <div className="p-5 min-h-screen bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-500 flex flex-col justify-center items-center w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full"
      >
        {showForm ? (
          <div className="p-5 min-h-screen bg-gray-100 flex justify-center items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full text-center"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Enter Your School Name
              </h2>
              <input
                type="text"
                placeholder="School Name"
                className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-black"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Please select your grade
              </h2>
              <div className="flex justify-between gap-4">
                {["11th", "12th"].map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`block ${
                      grade === option ? "bg-indigo-700" : "bg-indigo-500"
                    } text-white font-medium p-3 rounded-lg shadow-lg hover:bg-indigo-600 w-full transition-all`}
                    onClick={() => setGrade(option)}
                  >
                    {option}
                  </motion.button>
                ))}
              </div>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md w-full hover:bg-blue-800 mt-4"
                onClick={handleSaveDetails}
              >
                Save & Continue
              </button>
            </motion.div>
          </div>
        ) : !subject ? (
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
        ) : !chapter2 ? (
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
                  onClick={() => setChapter2(item)}
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
          <div>
            <h2 className="text-xl font-semibold text-gray-800 text-center mb-3 w-full">
              {chapter2.chapter} - Topics
            </h2>
            <ul className="list-none space-y-2 w-full">
              {chapter2.topics.map((topic, index) => (
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
            <div className="my-3 gap-3">
              <input
                type="text"
                placeholder="Prefered Time"
                className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-black"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <button
                className=" bg-gray-700 text-white font-medium p-3 rounded-lg shadow-lg hover:bg-gray-900 transition-all w-full"
                onClick={() => handleChapterSchedule()}
              >
                Schedule the chapter
              </button>
            </div>
          </div>
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-6 rounded-2xl shadow-xl max-w-lg w-full"
      >
        <div>
          {!subject ? (
            <div className="space-y-3 text-center w-full">
              <h2 className="text-2xl font-bold text-gray-800 w-full">
                Select a Subject you want to Study
              </h2>
              {Object.keys(subjects2).map((subject) => (
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
            <div>
              <h2 className="text-xl font-semibold text-gray-800 text-center mb-3 w-full">
                {subject} - Select a Chapter
              </h2>
              {loading ? (
                <div className="flex text-black justify-center">
                  Please Wait
                </div>
              ) : chapterOptions.length > 0 ? (
                <div className="space-y-2 w-full">
                  {chapterOptions.map((item, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium p-3 rounded-lg shadow-md hover:from-teal-500 hover:to-blue-500 w-full transition-all"
                      onClick={() => {
                        setChapterIndex(index);
                        setChapter(chapterOptions[index]); // Ensure selected chapter is set
                      }}
                    >
                      {item.chapter}
                    </motion.button>
                  ))}
                </div>
              ) : (
                <p className="flex text-black justify-center">
                  No chapters available
                </p>
              )}
              <button
                className="mt-4 text-red-600 underline font-semibold hover:text-red-800 transition w-full"
                onClick={() => setSubject(null)}
              >
                ← Back to Subjects
              </button>
            </div>
          ) : (
            <div>
              <>
                <h2 className="text-xl font-semibold text-gray-800 text-center mb-3 w-full">
                  {chapterOptions[chapterIndex]?.chapter} - Topics
                </h2>
                <ul className="list-none space-y-2 w-full">
                  {chapterOptions[chapterIndex].subtopics.map((item, index) => (
                    <motion.li
                      key={index}
                      className="bg-gray-100 p-3 rounded-lg shadow-sm text-gray-800 hover:bg-gray-200 transition flex justify-between items-center"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div>
                        <span className="font-medium">{item.topic}</span>
                        <p className="text-sm text-gray-600">
                          Time: {item.duration}mins | Difficulty:{" "}
                          {item.difficulty}
                        </p>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              </>
              <div className="my-3 gap-3">
                <input
                  type="text"
                  placeholder="Prefered Time"
                  className="w-full p-2 mb-3 border border-gray-300 rounded-lg text-black"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
                <button
                  className=" bg-gray-700 text-white font-medium p-3 rounded-lg shadow-lg hover:bg-gray-900 transition-all w-full"
                  onClick={() => handleChapterSchedule()}
                >
                  Schedule the chapter
                </button>
                <button
                  className="mt-4 text-red-600 underline font-semibold hover:text-red-800 transition w-full"
                  onClick={() => {
                    setChapterIndex(null);
                    setChapter(null); // Ensure selected chapter is set
                  }}
                >
                  ← Back to Subjects
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
