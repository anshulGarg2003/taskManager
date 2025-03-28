import React, { useState } from "react";
import { format } from "date-fns";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { useNavigate } from "react-router-dom";

const YearPlanner = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (date) => {
    const localDate = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    ); // Adjust to local time
    setSelectedDate(localDate);
    navigate("/planner", { state: { date: localDate } });
  };
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h1 className="text-3xl font-bold text-center mb-6">📅 Year Planner</h1>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="bg-white text-black p-4 rounded-lg shadow-md">
          <Calendar
            onChange={handleDateChange} // Call the function on date selection
            value={selectedDate}
            tileClassName={({ date }) =>
              date.getFullYear() === selectedDate.getFullYear() &&
              date.getMonth() === selectedDate.getMonth() &&
              date.getDate() === selectedDate.getDate()
                ? "bg-blue-500 text-white rounded-full"
                : ""
            }
          />
        </div>
      </div>
    </div>
  );
};

export default YearPlanner;
