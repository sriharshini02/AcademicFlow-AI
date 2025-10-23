import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBell, FaUserCircle } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import axios from "axios";
import HODSettings from "./HODSettings";
const sidebarItems = [
  { name: "Home", path: "/hod/dashboard" },
  { name: "Appointments", path: "/hod/appointments" },
  { name: "Students", path: "/hod/students" },
  { name: "History", path: "/hod/history" },
  { name: "Settings", path: "/hod/settings" },
  { name: "Logout", path: "/logout" },
];

const DashboardLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [newVisitors, setNewVisitors] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const token = localStorage.getItem("token");
  const location = useLocation();
  const [showSettings, setShowSettings] = useState(false);

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  // Fetch queued visitors
  const fetchQueuedVisitors = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/visit_logs/queued", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewVisitors(res.data || []);
    } catch (err) {
      console.error("Failed to fetch queued visitors:", err.message);
    }
  };

  useEffect(() => {
    fetchQueuedVisitors();
    const interval = setInterval(fetchQueuedVisitors, 10000);
    return () => clearInterval(interval);
  }, [token]);

  const handleBellClick = () => setShowDropdown(!showDropdown);

  useEffect(() => {
    const handleClickOutside = async (e) => {
      if (!e.target.closest(".notification-dropdown") && showDropdown) {
        setShowDropdown(false);
        if (newVisitors.length > 0) {
          setTimeout(async () => {
            try {
              await axios.put(
                "http://localhost:5000/api/visit_logs/acknowledge-new",
                {},
                { headers: { Authorization: `Bearer ${token}` } }
              );
              setNewVisitors([]);
            } catch (err) {
              console.error("Failed to acknowledge new requests:", err.message);
            }
          }, 3000);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [newVisitors, showDropdown, token]);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-indigo-500">AcademicFlow</div>
        <nav className="flex-1 flex flex-col gap-2 p-4">

          {sidebarItems.map((item) =>
            item.name === "Settings" ? (
              <button
                key={item.name}
                onClick={openSettings}
                className="px-4 py-2 rounded hover:bg-indigo-700 w-full text-left transition"
              >
                {item.name}
              </button>
            ) : (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-4 py-2 rounded hover:bg-indigo-700 transition ${
                    isActive ? "bg-indigo-800 font-semibold" : ""
                  }`
                }
              >
                {item.name}
              </NavLink>
            )
          )}

        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {location.pathname === "/hod/dashboard"
              ? "HOD Dashboard"
              : location.pathname === "/hod/appointments"
              ? "Appointments"
              : "HOD Panel"}
          </h1>

          <div className="flex items-center gap-4 relative notification-dropdown">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            <div className="relative">
              <button
                onClick={handleBellClick}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition relative"
              >
                <FaBell />
                {newVisitors.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {newVisitors.length}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 z-50">
                  <div className="p-3 border-b dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                    Notifications
                  </div>
                  {newVisitors.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto">
                      {newVisitors.map((visit) => (
                        <li
                          key={visit.visit_id}
                          className="p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                        >
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                            {visit.visitor_name} ({visit.visitor_role})
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{visit.purpose}</p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="p-4 text-center text-gray-500 dark:text-gray-400">No new requests</p>
                  )}
                </div>
              )}
            </div>

            <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <FaUserCircle />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
        {/* ⚙️ HOD Settings Modal */}
{showSettings && (
  <div
    className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
    onClick={closeSettings}
  >
    <div
      className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto p-6 relative"
      onClick={(e) => e.stopPropagation()} // Prevent modal close when clicking inside
    >
      <button
        onClick={closeSettings}
        className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
      >
        ✖
      </button>

      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800 dark:text-gray-100">
        HOD Settings
      </h2>

      {/* Render HODSettings component */}
      <HODSettings onClose={closeSettings} />
    </div>
  </div>
)}

      </div>
    </div>
  );
};

export default DashboardLayout;
