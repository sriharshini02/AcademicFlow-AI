import React, { useState } from "react";
import { FaSun, FaMoon, FaBell, FaHome, FaCalendarAlt, FaUsers, FaHistory, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useLocation } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown";

const sidebarItems = [
  { name: "Overview", path: "/hod/dashboard", icon: <FaHome /> },
  { name: "Appointments", path: "/hod/appointments", icon: <FaCalendarAlt /> },
  { name: "Student Records", path: "/hod/students", icon: <FaUsers /> },
  { name: "Visit History", path: "/hod/history", icon: <FaHistory /> },
];

const DashboardLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  return (
    <div className="min-h-screen w-full flex p-3 lg:p-4 gap-4 bg-[var(--body-bg)] text-slate-800 dark:text-slate-200">
      
      {/* --- FIXED SIDEBAR: Restored Nav Elements --- */}
      <aside className="hidden lg:flex w-60 flex-col rounded-2xl neu-raised p-6 flex-shrink-0 h-[calc(100vh-2rem)] sticky top-4 
                        dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg font-bold">A</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">ANVIS</h1>
            <p className="text-[10px] text-slate-500 dark:text-cyan-400/80 font-medium mt-1">Academic Portal</p>
          </div>
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 flex flex-col gap-2">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "neu-inset text-indigo-600 dark:text-cyan-400 font-semibold" 
                    : "text-slate-500 hover:text-indigo-500 dark:hover:text-white"
                }`
              }
            >
              <span className="text-lg opacity-80">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-200 dark:border-white/10">
           <button className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 font-semibold hover:bg-rose-500/10 rounded-xl transition-all text-sm">
             <FaSignOutAlt />
             <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        
        {/* HEADING BAR: Stands out against body-bg */}
        <header className="flex justify-between items-center px-8 py-4 rounded-xl neu-raised flex-shrink-0
                         dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
             {sidebarItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4">
            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400">
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-600" />}
            </button>
            <button className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400">
              <FaBell />
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 mx-1" />
            <ProfileDropdown />
          </div>
        </header>

        {/* MAIN BODY: Natural Scrolling, No Secondary Scrollbar */}
        <main className="flex-1 min-h-0 bg-transparent">
          <div className="pb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;