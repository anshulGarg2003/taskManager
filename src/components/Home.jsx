import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useSearchParams } from "react-router-dom";

const Home = () => {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("low");
  const [time, setTime] = useState("0");
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [always, setAlways] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const pasteId = searchParams.get("pasteId");
  const { user } = useAuth0();

  useEffect(() => {
    if (pasteId) {
      fetch(`http://localhost:5001/api/events/${pasteId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setTitle(data.title);
            setContent(data.content);
            setPriority(data.priority || "low");
            setTime(data.time ? data.time.split(":")[0] : "0");
            setDuration(data.duration || 0);
            setDate(data.date || "");
            setAlways(data.date === "always");
          }
        })
        .catch((error) => console.error("Error fetching event:", error));
    }
  }, [pasteId]);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please log in to save your event.");
      return;
    }

    if (!title.trim() || (!always && !date)) {
      toast.error("Please add a title and select a date or always.");
      return;
    }

    const eventData = {
      title,
      content,
      priority,
      time: `${time}:00`,
      duration: Number(duration),
      date: always ? "always" : date,
      userId: user.sub,
    };

    try {
      let response;
      let savedEvent;
      if (pasteId) {
        response = await fetch(`http://localhost:5001/api/events/${pasteId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch("http://localhost:5001/api/add-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
        savedEvent = await response.json();
      }

      if (response.ok) {
        toast.success(pasteId ? "Event updated!" : "Event added!");
        if (!pasteId) {
          await fetch(`http://localhost:5001/api/users/${user.sub}/addTask`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ taskId: savedEvent._id }),
          });
        }
        resetForm();
      } else {
        throw new Error("Failed to save event");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Error saving event");
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setPriority("low");
    setTime("0");
    setDuration(0);
    setDate("");
    setAlways(false);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          {pasteId ? "Update Event" : "Create Event"}
        </h2>

        <div className="flex flex-col gap-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
          />

          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={always}
              className="w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
            />
            <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={always}
                onChange={() => setAlways(!always)}
              />
              Always
            </label>
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
          >
            <option value="low">Low Priority 🏳️</option>
            <option value="medium">Medium Priority ⚫</option>
            <option value="high">High Priority 🚩</option>
          </select>

          <div className="flex flex-row gap-2">
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
            >
              {[...Array(24).keys()].map((hour) => (
                <option key={hour} value={hour}>
                  {hour}:00
                </option>
              ))}
            </select>
            <input
              type="number"
              value={duration}
              min="0"
              max="24"
              onChange={(e) => setDuration(e.target.value)}
              className="w-20 bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-2"
            />
            <p className="text-gray-700 dark:text-gray-300">Hrs.</p>
          </div>

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your event details here..."
            className="w-full bg-gray-50 dark:bg-gray-700 text-black dark:text-white border border-gray-300 dark:border-gray-600 rounded-md p-3"
            rows={5}
          />
        </div>

        <div className="w-full flex justify-center mt-6">
          <button
            className="text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-6 py-3"
            onClick={handleSave}
          >
            {pasteId ? "Update Event" : "Create Event"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
