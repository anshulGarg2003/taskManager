import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../../utlis/API_calls";
import { useSelector } from "react-redux";
import Maths from "../../data/Math";
import PhysicalChem from "../../data/PhysicalChem";
import Physics from "../../data/Physics";
import toast from "react-hot-toast";

export default function AdminQuestions() {
  const userInfo = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [question, setQuestion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userInfo.id == "") return toast.error("Login first to add question");

    if (userInfo.role !== "admin")
      return toast.error("You are not authorize to add question");

    setLoading(true);

    try {
      const response = await fetch(`${BASIC_URL}/api/questions/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userInfo.id,
          subject,
          chapter,
          difficulty,
          question,
        }),
      });
      if (response.ok) {
        toast.success("Question added successfully!");
        setSubject("");
        setChapter("");
        setDifficulty("Easy");
        setQuestion("");
      } else {
        alert("Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
    }
    setLoading(false);
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white">
      <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
        Add Questions
      </h1>

      <motion.form
        className="w-3/4 bg-gray-800 p-6 rounded-lg shadow-lg max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        onSubmit={handleSubmit}
      >
        <div className="mb-4">
          <label className="block mb-2">Subject:</label>
          <select
            className="w-full px-4 py-2 rounded-lg text-black"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          >
            <option value="" disabled>
              Select a subject
            </option>
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Physical Chemistry">Physical Chemistry</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Chapter:</label>
          <select
            className="w-full px-4 py-2 rounded-lg text-black"
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            required
          >
            <option value="" disabled>
              Select the chapter
            </option>
            {subject == "Mathematics" &&
              Maths.map((module) => <option>{module.chapter}</option>)}
            {subject == "Physics" &&
              Physics.map((module) => <option>{module.chapter}</option>)}
            {subject == "Physical Chemistry" &&
              PhysicalChem.map((module) => <option>{module.chapter}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Difficulty:</label>
          <select
            className="w-full px-4 py-2 rounded-lg text-black"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            required
          >
            <option value="" disabled>
              Select the Difficulty
            </option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Question:</label>
          <textarea
            className="w-full px-4 py-2 rounded-lg text-black"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          ></textarea>
        </div>

        <motion.button
          className="w-full bg-blue-600 hover:brightness-125 px-6 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg hover:scale-105"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          type="submit"
          disabled={loading}
        >
          {loading ? "Please Wait" : "Add Question"}
        </motion.button>
      </motion.form>

      <motion.button
        className="mt-6 bg-red-600 hover:brightness-125 px-6 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg hover:scale-105"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => navigate("/admin")}
      >
        Back to Admin Dashboard
      </motion.button>
    </div>
  );
}
