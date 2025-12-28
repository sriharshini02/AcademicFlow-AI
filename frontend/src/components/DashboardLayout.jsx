import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaBell, FaHome, FaCalendarAlt, FaUsers, FaHistory, FaSignOutAlt } from "react-icons/fa";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { X } from "lucide-react"; // Import X icon
import ProfileDropdown from "./ProfileDropdown";
import HODSettings from "./HODSettings"; 
import HODProfile from "./HODProfile"; // ✅ Import the new profile component
import { useAuth } from "../App"; 

const sidebarItems = [
  { name: "Overview", path: "/hod/dashboard", icon: <FaHome /> },
  { name: "Appointments", path: "/hod/appointments", icon: <FaCalendarAlt /> },
  { name: "Student Records", path: "/hod/students", icon: <FaUsers /> },
  { name: "Visit History", path: "/hod/history", icon: <FaHistory /> },
];

const DashboardLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [newVisitors, setNewVisitors] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Modal States
  const [showSettings, setShowSettings] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); // ✅ New State
  
  const { token, logout } = useAuth(); 
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => setShowSettings(false);

  // ✅ Handler for View Profile
  const handleViewProfile = () => {
    setShowProfileModal(true);
  };

  const handleLogout = () => {
    logout(); 
    navigate("/", { replace: true });
  };

  // ... (Keep existing fetchQueuedVisitors and notification logic exactly as is) ...
  const fetchQueuedVisitors = async () => {
    if (!token) return;
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

  const handleBellClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  useEffect(() => {
    const handleClickOutside = async (e) => {
      if (!e.target.closest(".notification-area") && showDropdown) {
        setShowDropdown(false);
        if (newVisitors.length > 0) {
          setTimeout(async () => {
            try {
              await axios.put("http://localhost:5000/api/visit_logs/acknowledge-new", {}, { 
                headers: { Authorization: `Bearer ${token}` } 
              });
              setNewVisitors([]);
            } catch (err) {
              console.error("Failed to acknowledge:", err.message);
            }
          }, 1000);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [newVisitors, showDropdown, token]);

  return (
    <div className="h-screen w-full flex p-3 lg:p-4 gap-4 bg-[var(--body-bg)] text-slate-800 dark:text-slate-200 overflow-hidden transition-all duration-500">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:flex w-60 flex-col rounded-2xl neu-raised p-6 flex-shrink-0 h-full sticky top-0 
                        dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 shadow-xl">
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-lg font-bold">A</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">ANVIS</h1>
            <p className="text-[10px] text-slate-500 dark:text-cyan-400/80 font-medium mt-1 uppercase tracking-widest">Portal</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-2 overflow-y-auto no-scrollbar">
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
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 font-semibold hover:bg-rose-500/10 rounded-xl transition-all text-sm"
           >
             <FaSignOutAlt />
             <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        
        <header className="flex justify-between items-center px-8 py-4 rounded-xl neu-raised flex-shrink-0
                         dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
             {sidebarItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4 relative notification-area">
            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400">
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-indigo-600" />}
            </button>
            
            <div className="relative">
              <button onClick={handleBellClick} className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400 relative">
                <FaBell />
                {newVisitors.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-bounce">
                    {newVisitors.length}
                  </span>
                )}
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border dark:border-slate-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-3 border-b dark:border-slate-700 font-bold text-xs text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-900/50">
                    Recent Requests
                  </div>
                  <ul className="max-h-60 overflow-y-auto no-scrollbar">
                    {newVisitors.length > 0 ? (
                      newVisitors.map((visit) => (
                        <li key={visit.visit_id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b dark:border-slate-700/50 last:border-0 transition-colors">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{visit.visitor_name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">{visit.purpose}</p>
                        </li>
                      ))
                    ) : (
                      <li className="p-6 text-center text-[10px] text-slate-400 italic">No new requests</li>
                    )}
                  </ul>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 mx-1" />
            
            {/* ✅ UPDATED: Pass handlers to dropdown */}
            <ProfileDropdown 
              onOpenSettings={openSettings} 
              onViewProfile={handleViewProfile} 
            />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="pb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>

      {/* --- SETTINGS MODAL --- */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 px-4"
          onClick={closeSettings}
        >
          <div 
            className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 relative neu-raised border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeSettings} className="absolute top-6 right-6 text-slate-400 hover:text-rose-500 transition-colors p-2">
              <FaSignOutAlt className="rotate-180" size={20} />
            </button>
            <h2 className="text-2xl font-black mb-8 text-slate-800 dark:text-white tracking-tight">HOD Settings</h2>
            <HODSettings onClose={closeSettings} />
          </div>
        </div>
      )}

      {/* --- ✅ NEW PROFILE MODAL --- */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 px-4"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md p-8 relative neu-raised border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowProfileModal(false)} 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition-all"
            >
              <X size={20} />
            </button>
            
            {/* Render the HOD Profile Component */}
            <HODProfile />
          </div>
        </div>
      )}

    </div>
  );
};

export default DashboardLayout;