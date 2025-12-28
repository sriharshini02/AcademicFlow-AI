import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Settings, LogOut, User } from "lucide-react"; // Updated icons
import { useAuth } from "../App"; // Use context for user data & logout
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ onOpenSettings, onViewProfile }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth(); // Get generic user info (works for HOD & Proctor)
  const navigate = useNavigate();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoutClick = () => {
    logout(); // Clears token & context
    navigate("/", { replace: true });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={toggleDropdown}
        className="p-2.5 rounded-xl neu-raised text-slate-600 dark:text-cyan-400 hover:text-indigo-500 transition-colors focus:outline-none"
      >
        <UserCircle size={24} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-4 w-60 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
          
          {/* Header: Displays Name & Role from Auth Context */}
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
              {user?.name || "Faculty Member"}
            </p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">
              {user?.role || "Authorized User"}
            </p>
          </div>

          {/* Menu Actions */}
          <div className="p-2">
            {/* View Profile Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onViewProfile) onViewProfile(); // Calls the Modal function passed from parent
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-500 transition-colors text-left"
            >
              <User size={16} />
              View Profile
            </button>

            {/* Settings Button */}
            <button
              onClick={() => {
                setIsOpen(false);
                if (onOpenSettings) onOpenSettings(); // Calls the Settings navigation
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-500 transition-colors text-left"
            >
              <Settings size={16} />
              Settings
            </button>
          </div>

          {/* Logout Button */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-left"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;