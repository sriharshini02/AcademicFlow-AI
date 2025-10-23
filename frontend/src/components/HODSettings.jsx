import React, { useState } from "react";

const HODSettings = ({ onClose }) => {
  const [notifications, setNotifications] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`Settings saved!\nNotifications: ${notifications}\nTheme: ${theme}`);
    onClose(); // Close modal after saving
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block font-medium mb-1">Notifications</label>
        <select
          value={notifications ? "on" : "off"}
          onChange={(e) => setNotifications(e.target.value === "on")}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="on">Enabled</option>
          <option value="off">Disabled</option>
        </select>
      </div>

      <div>
        <label className="block font-medium mb-1">Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  );
};

export default HODSettings;
