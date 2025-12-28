import React, { useState } from "react";
import { FaSun, FaMoon, FaSignOutAlt } from "react-icons/fa";
import { LayoutDashboard, Users, FileText, Settings } from "lucide-react"; 
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import ProfileDropdown from "./ProfileDropdown"; 
import { useAuth } from "../App"; 

const sidebarItems = [
  { name: "Overview", path: "/proctor/dashboard", icon: <LayoutDashboard size={20} /> },
  { name: "My Students", path: "/proctor/students", icon: <Users size={20} /> },
  { name: "Reports", path: "/proctor/reports", icon: <FileText size={20} /> },
  { name: "Settings", path: "/proctor/settings", icon: <Settings size={20} /> },
];

const ProctorLayout = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark", !darkMode);
  };

  const handleLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleOpenSettings = () => {
    navigate("/proctor/settings");
  };

  return (
    <div className="h-screen w-full flex p-3 lg:p-4 gap-4 bg-[var(--body-bg)] text-slate-800 dark:text-slate-200 overflow-hidden transition-all duration-500">
      
      {/* --- SIDEBAR --- */}
      <aside className="hidden lg:flex w-64 flex-col rounded-2xl neu-raised p-6 flex-shrink-0 h-full sticky top-0 
                        dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 shadow-xl">
        
        <div className="mb-10 flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-lg font-bold">P</div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">ProctorFlow</h1>
            <p className="text-[10px] text-slate-500 dark:text-cyan-400/80 font-medium mt-1 uppercase tracking-widest">Faculty Panel</p>
          </div>
        </div>

        <nav className="flex-1 flex flex-col gap-3 overflow-y-auto no-scrollbar">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? "neu-inset text-emerald-600 dark:text-emerald-400 font-bold" 
                    : "text-slate-500 hover:text-emerald-500 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                }`
              }
            >
              <span className={`opacity-80 transition-transform duration-300 ${location.pathname === item.path ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </span>
              <span className="text-sm font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="pt-6 border-t border-slate-200 dark:border-white/10 mt-2">
           <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-4 py-3 w-full text-rose-500 font-semibold hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all text-sm group"
           >
             <FaSignOutAlt className="group-hover:-translate-x-1 transition-transform" />
             <span>Logout</span>
           </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0 h-full overflow-hidden">
        
        {/* Header Bar */}
        <header className="flex justify-between items-center px-8 py-4 rounded-xl neu-raised flex-shrink-0
                         dark:bg-slate-800/40 dark:backdrop-blur-xl dark:border-white/10 shadow-lg">
          
          <h2 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight">
             {sidebarItems.find(i => i.path === location.pathname)?.name || "Dashboard"}
          </h2>

          <div className="flex items-center gap-4 relative">
            {/* Dark Mode Toggle */}
            <button onClick={toggleDarkMode} className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400 hover:text-amber-500 transition-colors">
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon />}
            </button>
            
            {/* Notification Bell REMOVED per request */}

            <div className="h-6 w-px bg-slate-300 dark:bg-white/10 mx-1" />
            
            {/* Profile Dropdown */}
            <ProfileDropdown onOpenSettings={handleOpenSettings} />
          </div>
        </header>

        {/* Scrollable Body Content */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          <div className="pb-8 animate-in fade-in slide-in-from-bottom-2 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProctorLayout;