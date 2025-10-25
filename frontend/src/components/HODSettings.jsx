import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";

const HODSettings = ({ onClose }) => {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hod/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "",
          department: res.data.hod_info?.department || "",
          contact_number: res.data.hod_info?.contact_number || "",
          office_room: res.data.hod_info?.office_room || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("http://localhost:5000/api/hod/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-12 text-gray-500 dark:text-gray-300">
        Loading profile...
      </div>
    );

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          Account Settings
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-red-500 transition"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {/* Profile Info */}
      <div className="p-6">
        {!editMode ? (
          // ---------------- VIEW MODE ----------------
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-indigo-500 flex items-center justify-center text-3xl text-white font-semibold">
                {profile.name ? profile.name[0] : "H"}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                  {profile.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">{profile.email}</p>
                <p className="text-sm text-indigo-500 font-medium mt-1">
                  {profile.department} Department
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Contact Number</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {profile.contact_number || "—"}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Office Room</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">
                  {profile.office_room || "—"}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEditMode(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <FaEdit /> Edit Profile
              </button>
            </div>
          </div>
        ) : (
          // ---------------- EDIT MODE ----------------
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={profile.password}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Contact Number
                </label>
                <input
                  type="text"
                  name="contact_number"
                  value={profile.contact_number}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Office Room
                </label>
                <input
                  type="text"
                  name="office_room"
                  value={profile.office_room}
                  onChange={handleChange}
                  className="w-full p-2 rounded border dark:bg-gray-700 dark:border-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={profile.department}
                  readOnly
                  className="w-full p-2 rounded border bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-lg transition"
              >
                <FaTimes /> Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
              >
                <FaSave />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default HODSettings;
