import React, { useEffect, useState } from "react";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("All");
  const token = localStorage.getItem("token");

  // Fetch all appointments once
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/visit_logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  // Handle dropdown filter
  useEffect(() => {
    if (filter === "All") {
      setFiltered(appointments);
    } else {
      setFiltered(appointments.filter((a) => a.action_taken === filter));
    }
  }, [filter, appointments]);

  // Handle button actions
  const handleAction = async (visit_id, action) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visit_logs/${visit_id}/update-status`,
        { action_taken: action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update state locally
      setAppointments((prev) =>
        prev.map((a) =>
          a.visit_id === visit_id ? { ...a, action_taken: action } : a
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600 font-semibold";
      case "Scheduled":
        return "text-blue-600 font-semibold";
      case "Completed":
        return "text-green-600 font-semibold";
      case "Cancelled":
        return "text-red-600 font-semibold";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointments</h2>

        {/* Filter Dropdown */}
        <select
          className="border border-gray-300 rounded p-2"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Pending">Pending</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <table className="min-w-full border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2 border-b">Student</th>
            <th className="p-2 border-b">Purpose</th>
            <th className="p-2 border-b">Check-In Time</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center p-4 text-gray-500">
                No appointments found.
              </td>
            </tr>
          ) : (
            filtered.map((app) => (
              <tr
                key={app.visit_id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <td className="p-2 border-b">{app.student?.full_name}</td>
                <td className="p-2 border-b">{app.purpose}</td>
                <td className="p-2 border-b">
                  {new Date(app.check_in_time).toLocaleString()}
                </td>
                <td className={`p-2 border-b ${getStatusColor(app.action_taken)}`}>
                  {app.action_taken || "Pending"}
                </td>
                <td className="p-2 border-b flex gap-2">
                  {/* Disable buttons for completed/cancelled */}
                  <button
                    disabled={["Completed", "Cancelled"].includes(app.action_taken)}
                    onClick={() => handleAction(app.visit_id, "Scheduled")}
                    className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Schedule
                  </button>
                  <button
                    disabled={["Completed", "Cancelled"].includes(app.action_taken)}
                    onClick={() => handleAction(app.visit_id, "Completed")}
                    className="px-2 py-1 bg-green-500 text-white rounded disabled:opacity-50"
                  >
                    Complete
                  </button>
                  <button
                    disabled={["Completed", "Cancelled"].includes(app.action_taken)}
                    onClick={() => handleAction(app.visit_id, "Cancelled")}
                    className="px-2 py-1 bg-red-500 text-white rounded disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
