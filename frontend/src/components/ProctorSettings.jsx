import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";

const ProctorSettings = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/proctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email, password: "" });
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    try {
      await axios.put("http://localhost:5000/api/proctor/settings/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("✅ Profile updated successfully!");
      setTimeout(() => setStatus(""), 2000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatus("❌ Failed to update profile");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">⚙️ Proctor Settings</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">Name</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">Email</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <div>
          <label className="block text-gray-600 dark:text-gray-300 mb-1">New Password</label>
          <input
            name="password"
            type="password"
            placeholder="Leave blank to keep same"
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded dark:bg-gray-700 dark:text-gray-100"
          />
        </div>

        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Changes
        </button>

        {status && <p className="mt-2 text-sm text-center">{status}</p>}
      </div>
    </div>
  );
};

export default ProctorSettings;
