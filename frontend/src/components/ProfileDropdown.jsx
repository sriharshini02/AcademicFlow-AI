import React, { useState, useEffect, useRef } from "react";
import { FaUserCircle, FaCog, FaSignOutAlt, FaUser } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = ({ onOpenSettings }) => {
  const [open, setOpen] = useState(false);
  const [hodData, setHodData] = useState({});
  const token = localStorage.getItem("token");
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Fetch basic HOD profile
  useEffect(() => {
    const fetchHod = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hod/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHodData(res.data);
      } catch (err) {
        console.error("Failed to fetch HOD profile:", err.message);
      }
    };
    fetchHod();
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/logout");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar Icon */}
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
      >
        <FaUserCircle size={22} className="text-gray-700 dark:text-gray-200" />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 z-50">
          {/* Header */}
          <div className="p-3 border-b dark:border-gray-700">
            <p className="font-semibold text-gray-800 dark:text-gray-100">
              {hodData.name || "HOD User"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hodData.email || "hod@college.edu"}
            </p>
          </div>

          {/* Menu Items */}
          <ul className="p-2 text-sm text-gray-700 dark:text-gray-200">
            <li
              onClick={() => {
                onOpenSettings();
                setOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <FaCog /> Settings
            </li>

            <li
              onClick={() => {
                navigate("/hod/profile");
                setOpen(false);
              }}
              className="flex items-center gap-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
            >
              <FaUser /> View Profile
            </li>

            <li
              onClick={handleLogout}
              className="flex items-center gap-2 p-2 rounded hover:bg-red-100 dark:hover:bg-red-800 cursor-pointer text-red-600 dark:text-red-400"
            >
              <FaSignOutAlt /> Logout
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
