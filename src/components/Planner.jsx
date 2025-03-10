import { useSelector } from "react-redux";

const DayPlanner = () => {
  const pastes = useSelector((state) => state.paste.pastes);
  console.log(pastes);

  const priorityColors = {
    low: "bg-green-200 text-green-800",
    medium: "bg-orange-200 text-orange-800",
    high: "bg-red-200 text-red-800",
  };

  return (
    <div className="w-full mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-center">📅 Day Planner</h2>
      <h3 className="text-xl font-semibold mt-6">🕒 Today's Schedule</h3>

      <div className="mt-3 border-t border-gray-300">
        {[...Array(24).keys()].map((hour) => {
          const hourStr = hour + ":00"; // No leading zero

          // Find events that start at this hour OR extend into this hour
          const eventsAtThisHour = pastes.filter((paste) => {
            const startHour = parseInt(paste.time);
            const duration = parseInt(paste.duration);
            return hour >= startHour && hour < startHour + duration; // Check range
          });

          return (
            <div key={hour} className="border-b border-gray-300 py-2">
              <h4 className="font-semibold text-gray-700">{hourStr}</h4>
              {eventsAtThisHour.length > 0 ? (
                eventsAtThisHour.map((paste) => (
                  <div
                    key={paste._id + "-" + hour}
                    className={`mt-2 p-3 rounded-md ${
                      priorityColors[paste.priority]
                    } shadow-md`}
                  >
                    <h5 className="font-semibold">{paste.title}</h5>
                    <p className="text-sm">{paste.content}</p>
                    <p className="text-xs text-gray-600">
                      ⏳ Duration: {paste.duration} hrs
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No events</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DayPlanner;
