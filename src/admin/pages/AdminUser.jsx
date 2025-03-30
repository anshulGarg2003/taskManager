import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASIC_URL } from "../../utlis/API_calls";
import { User2Icon } from "lucide-react";

export default function AdminUser() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  // Fetch users (Replace with your API endpoint)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${BASIC_URL}/api/users`);
        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Filter users based on search input
  const filteredUsers = users.filter((user) =>
    user.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 text-white">
      {/* Title */}
      <h1 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg">
        Manage Users
      </h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search users..."
        className="mb-4 px-4 py-2 rounded-lg w-3/4 md:w-1/2 text-black"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* User List Table */}
      <motion.div
        className="w-3/4 bg-gray-800 p-6 rounded-lg shadow-lg overflow-auto max-h-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <table className="w-full text-left">
          <thead>
            <tr className="text-lg border-b border-gray-600">
              <th className="py-2">Picture</th>
              <th className="py-2">Name</th>
              <th className="py-2">Email</th>
              <th className="py-2">Role</th>
              <th className="py-2">Subscribe</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-gray-700 gap-3 h-[100px] text-xl"
                >
                  <td className="py-2">
                    {/* <img
                      src={user.picture}
                      alt="User"
                      className="w-10 h-10 rounded-full"
                    /> */}
                    <User2Icon />
                  </td>

                  <td className="py-2">{user.name}</td>
                  <td className="py-2">{user.email}</td>
                  <td className="py-2">{user.role}</td>
                  <td className="py-2">{user.isPaid ? "Yes" : "No"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Back Button */}
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
