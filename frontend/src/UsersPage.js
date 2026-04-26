import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function UsersPage({ theme, toggleTheme }) {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const isDark = theme === "dark";

  const colors = {
    bg: isDark ? "bg-slate-900" : "bg-slate-100",
    card: isDark ? "bg-slate-800" : "bg-white",
    text: isDark ? "text-white" : "text-black",
    subText: isDark ? "text-gray-400" : "text-gray-500",
  };

  const fetchUsers = () => {
    fetch("http://localhost:5000/analytics")
      .then((res) => res.json())
      .then(setUsers);
  };

  useEffect(() => {
    fetchUsers();
    const interval = setInterval(fetchUsers, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen flex ${colors.bg} ${colors.text}`}>
      {/* Sidebar */}
      <div className={`w-64 p-5 hidden md:block ${colors.card}`}>
        <h2 className="text-2xl font-bold text-green-500 mb-8">
          Users 👤
        </h2>

        <button
          onClick={() => navigate("/dashboard")}
          className="border px-3 py-1 rounded hover:bg-green-500 hover:text-black"
        >
          ← Dashboard
        </button>
      </div>

      {/* Main */}
      <div className="flex-1 p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">Users Management 👤</h1>

          <button
            onClick={toggleTheme}
            className="px-3 py-1 rounded bg-gray-700 text-white"
          >
            {isDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <div className={`${colors.card} p-4 rounded-xl`}>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="p-2">User</th>
                <th className="p-2">Total</th>
                <th className="p-2">Blocked</th>
                <th className="p-2">Status</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user.userId} className="border-b border-gray-700">
                  <td className="p-2">{user.userId}</td>
                  <td className="p-2">{user.total}</td>
                  <td className="p-2">{user.blocked}</td>
                  <td className="p-2">
                    {user.blocked > 5 ? (
                      <span className="text-red-400">Blocked</span>
                    ) : (
                      <span className="text-green-400">Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;