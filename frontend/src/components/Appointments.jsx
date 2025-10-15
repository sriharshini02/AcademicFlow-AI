import React, { useEffect, useState } from "react";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter] = useState("All");

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [selectedVisit, setSelectedVisit] = useState(null);
  const [hodNotes, setHodNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  const token = localStorage.getItem("token");

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

  useEffect(() => {
    if (filter === "All") {
      setFiltered(appointments);
    } else {
      setFiltered(appointments.filter((a) => a.action_taken === filter));
    }
  }, [filter, appointments]);

  const handleAction = async (visit_id, action, hod_notes = null, scheduled_time = null) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visit_logs/${visit_id}/update-status`,
        { action_taken: action, hod_notes, scheduled_time },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppointments((prev) =>
        prev.map((a) =>
          a.visit_id === visit_id
            ? { ...a, action_taken: action, scheduled_time }
            : a
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} appointment:`, err.message);
    }
  };

  const handleMarkCompleted = (visit) => {
    setSelectedVisit(visit);
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    await handleAction(selectedVisit.visit_id, "Completed", hodNotes);
    setShowNotesModal(false);
    setHodNotes("");
  };

  const handleSchedule = (visit) => {
    setSelectedVisit(visit);
    setShowScheduleModal(true);
  };

  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert("Please select both date and time.");
      return;
    }

    const scheduled_time = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    await handleAction(selectedVisit.visit_id, "Scheduled", null, scheduled_time);

    setShowScheduleModal(false);
    setScheduleDate("");
    setScheduleTime("");
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
            <th className="p-2 border-b">Scheduled Time</th>
            <th className="p-2 border-b">Status</th>
            <th className="p-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No appointments found.
              </td>
            </tr>
          ) : (
            filtered.map((app) => (
              <tr key={app.visit_id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                <td className="p-2 border-b">{app.student?.full_name}</td>
                <td className="p-2 border-b">{app.purpose}</td>
                <td className="p-2 border-b">
                  {new Date(app.check_in_time).toLocaleString()}
                </td>
                <td className="p-2 border-b">
                  {app.scheduled_time
                    ? new Date(app.scheduled_time).toLocaleString()
                    : "—"}
                </td>
                <td className={`p-2 border-b ${getStatusColor(app.action_taken)}`}>
                  {app.action_taken || "Pending"}
                </td>
                <td className="p-2 border-b flex gap-2">
                  <button
                    disabled={["Completed", "Cancelled"].includes(app.action_taken)}
                    onClick={() => handleSchedule(app)}
                    className="px-2 py-1 bg-blue-500 text-white rounded disabled:opacity-50"
                  >
                    Schedule
                  </button>

                  <button
                    disabled={["Completed", "Cancelled"].includes(app.action_taken)}
                    onClick={() => handleMarkCompleted(app)}
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

      {/* 🟦 Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Schedule Appointment
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded p-2"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700">Time</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded p-2"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🟩 Meeting Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-3 text-gray-800">
              Meeting Notes
            </h2>
            <textarea
              className="w-full border border-gray-300 rounded p-2 mb-4 focus:ring focus:ring-indigo-300"
              rows="4"
              placeholder="Write meeting summary or notes..."
              value={hodNotes}
              onChange={(e) => setHodNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Save & Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;
