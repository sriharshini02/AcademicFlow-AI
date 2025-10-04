import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBell, FaUserCircle, FaSignOutAlt } from "react-icons/fa";
import { NavLink } from "react-router-dom";

const sidebarItems = [
  { name: "Home", path: "/hod/dashboard" },
  { name: "Appointments", path: "/hod/appointments" },
  { name: "Students", path: "/hod/students" },
  { name: "History", path: "/hod/history" },
  { name: "Settings", path: "/hod/settings" },
  { name: "Logout", path: "/logout" } // implement logout route in App.jsx
];


const DashboardLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) document.body.classList.add("dark");
    else document.body.classList.remove("dark");
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-600 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-indigo-500">AcademicFlow</div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {sidebarItems.map((item) => (
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
          ))}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        
        {/* Top Bar */}
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              HOD Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <FaBell />
            </button>

            <button className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition">
              <FaUserCircle />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};



export default DashboardLayout;