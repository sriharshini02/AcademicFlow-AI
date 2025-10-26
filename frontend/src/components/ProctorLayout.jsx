import React, { useState, useEffect } from "react";
import { FaSun, FaMoon, FaUserCircle } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";

const sidebarItems = [
  { name: "Home", path: "/proctor/dashboard" },
  { name: "Students", path: "/proctor/students" },
  { name: "Reports", path: "/proctor/reports" },
  { name: "Settings", path: "/proctor/settings" },
  { name: "Logout", path: "/logout" },
];

const ProctorLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  const handleProfileClick = () => setShowProfileMenu(!showProfileMenu);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".profile-menu")) setShowProfileMenu(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-600 text-white flex flex-col">
        <div className="text-2xl font-bold p-6 border-b border-blue-500">ProctorFlow</div>
        <nav className="flex-1 flex flex-col gap-2 p-4">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `px-4 py-2 rounded hover:bg-blue-700 transition ${
                  isActive ? "bg-blue-800 font-semibold" : ""
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 shadow">
          <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            {location.pathname === "/proctor/dashboard"
              ? "Proctor Dashboard"
              : location.pathname === "/proctor/students"
              ? "Students"
              : location.pathname === "/proctor/reports"
              ? "Reports"
              : "Proctor Panel"}
          </h1>

          <div className="flex items-center gap-4 relative">
            {/* Dark Mode */}
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>

            {/* Profile Menu */}
            <div className="relative profile-menu">
              <button
                onClick={handleProfileClick}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
              >
                <FaUserCircle className="text-xl" />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg border dark:border-gray-700 z-50">
                  <ul className="text-gray-700 dark:text-gray-200 text-sm">
                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      View Profile
                    </li>
                    <li className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      Settings
                    </li>
                    <li className="px-4 py-2 text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
                      Logout
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default ProctorLayout;
