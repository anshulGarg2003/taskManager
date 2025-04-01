import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaArrowLeft } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import toast from "react-hot-toast";
import axios from "axios";
import { BASIC_URL } from "../../utlis/API_calls";

const subjects = [
  { name: "Maths", color: "bg-blue-900" },
  { name: "Physics", color: "bg-gray-900" },
];

const AddChapter = () => {
  const [loading, setLoading] = useState(false);
  const [subject, setsubject] = useState(subjects[0]);
  const [grade, setGrade] = useState("");
  const [overallDifficulty, setOverallDifficulty] = useState("");
  const [chapter, setChapter] = useState("");
  const [subtopics, setSubtopics] = useState([
    { topic: "", difficulty: "easy", duration: "" },
  ]);
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const handleReset = () => {
    setsubject(subjects[0]);
    setOverallDifficulty("");
    setChapter("");
    setGrade("");
    setSubtopics([{ topic: "", difficulty: "easy", duration: "" }]);
  };

  useEffect(() => {
    setOverallDifficulty(calculateOverallDifficulty(subtopics));
  }, [subtopics]);

  const calculateOverallDifficulty = (subtopics) => {
    const difficultyCount = { easy: 0, medium: 0, hard: 0 };

    // Count occurrences of each difficulty
    subtopics.forEach((sub) => {
      difficultyCount[sub.difficulty]++;
    });

    // Determine the dominant difficulty
    if (
      difficultyCount.hard >= difficultyCount.medium &&
      difficultyCount.hard >= difficultyCount.easy
    ) {
      return "hard";
    } else if (difficultyCount.medium >= difficultyCount.easy) {
      return "medium";
    } else {
      return "easy";
    }
  };

  const handleSubmit = async () => {
    console.log(subject, chapter, subtopics);

    if (!subject) {
      toast.error("Please select subject");
      return;
    }
    if (!chapter) {
      toast.error("Please add chapter");
      return;
    }
    if (!Array.isArray(subtopics) || subtopics.length === 0) {
      toast.error("Please add subtopics");
      return;
    }
    if (subtopics.length < 3) {
      toast.error("Please add alteast 2 subtopics");
      return;
    }

    setLoading(true);

    const chapterData = {
      chapter,
      grade,
      subject: subject.name,
      overallDifficulty: overallDifficulty,
      subtopics,
    };

    try {
      const response = await axios.post(
        `${BASIC_URL}/api/maths/add-chapter`,
        chapterData
      );
      //   console.log("Chapter added:", response.data);
      toast.success("Chapter added successfully!");
      handleReset();
    } catch (error) {
      console.error("Error adding chapter:", error);
      toast.error("Failed to add chapter");
    }
    setLoading(false);
  };

  const handleSubtopicChange = (index, field, value) => {
    const updatedSubtopics = subtopics.map((subtopic, i) =>
      i === index ? { ...subtopic, [field]: value } : subtopic
    );
    setSubtopics(updatedSubtopics);
  };

  const addSubtopic = () => {
    setSubtopics([
      ...subtopics,
      { topic: "", difficulty: "easy", duration: "" },
    ]);
  };

  // Function to remove a subtopic
  const removeSubtopic = (index) => {
    setSubtopics(subtopics.filter((_, i) => i !== index));
    if (subtopics.length === 0) addSubtopic();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 0 }}
      animate={{ opacity: fadeIn ? 1 : 0, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`min-h-screen p-6 transition-all duration-500 ${subject.color} text-white`}
    >
      {/* Back to Admin Dashboard Button */}
      <motion.button
        onClick={() => navigate("/admin")}
        className="flex items-center px-4 py-2 mb-6 bg-yellow-500 text-black rounded-lg font-semibold hover:bg-yellow-400 transition-all shadow-lg"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <FaArrowLeft className="mr-2" /> Back to Admin Dashboard
      </motion.button>

      {/* Subject Selection Tabs */}
      <motion.div className="flex justify-center space-x-4 mb-6">
        {subjects.map((subject) => (
          <motion.button
            key={subject.name}
            onClick={() => setsubject(subject)}
            className={`px-6 py-2 rounded-lg font-semibold transition-all ${
              subject.name === subject.name ? "bg-yellow-500" : "bg-gray-700"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {subject.name}
          </motion.button>
        ))}
      </motion.div>

      {/* Add Chapter Form */}
      <motion.div
        className="max-w-3xl mx-auto bg-gray-800 p-6 rounded-lg shadow-lg"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Add a Chapter to {subject.name}
        </h2>

        <motion.div>
          {/* Chapter Title Input */}
          <motion.div className="mb-4">
            <label className="block text-lg font-semibold">Chapter Title</label>
            <input
              type="text"
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-yellow-500"
              placeholder="Enter Chapter Title"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
            />
          </motion.div>

          {/* Grade Selection */}
          <motion.div className="mb-4">
            <label className="block text-lg font-semibold">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-yellow-500"
            >
              <option value="11th">11th</option>
              <option value="12th">12th</option>
            </select>
          </motion.div>

          {/* Dynamic Subtopics Section */}
          <motion.div className="mb-4">
            <label className="block text-lg font-semibold">Subtopics</label>
            {subtopics.map((subtopic, index) => (
              <motion.div
                key={index}
                className="flex space-x-2 mb-2 items-center"
              >
                <input
                  type="text"
                  value={subtopic.topic}
                  onChange={(e) =>
                    handleSubtopicChange(index, "topic", e.target.value)
                  }
                  className="w-2/3 p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-yellow-500"
                  placeholder="Subtopic Name"
                />
                <select
                  value={subtopic.difficulty}
                  onChange={(e) =>
                    handleSubtopicChange(index, "difficulty", e.target.value)
                  }
                  className="w-1/6 p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
                <input
                  type="number"
                  value={subtopic.duration}
                  onChange={(e) =>
                    handleSubtopicChange(index, "duration", e.target.value)
                  }
                  className="w-1/6 p-2 rounded-md bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-yellow-500"
                  placeholder="Duration (mins)"
                />
                {/* Delete Button */}
                <motion.button
                  onClick={() => removeSubtopic(index)}
                  className="text-red-500 text-lg font-bold hover:text-red-400 transition-all"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <RiDeleteBin6Line />
                </motion.button>
              </motion.div>
            ))}
            {/* Add More Subtopics Button */}
            <motion.button
              type="button"
              onClick={addSubtopic}
              className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg flex items-center hover:bg-green-400 transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FaPlus className="mr-2" /> Add Another Subtopic
            </motion.button>
          </motion.div>

          {/* Overall Difficulty Display */}
          <motion.div className="mb-4 text-lg font-semibold bg-gray-700 p-3 rounded-lg text-center">
            Overall Difficulty:{" "}
            <span className="text-yellow-400">{overallDifficulty}</span>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSubmit()}
          >
            {loading ? "Loading..." : "Add Chapter"}
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AddChapter;
