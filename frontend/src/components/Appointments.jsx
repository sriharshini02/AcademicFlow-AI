import React, { useEffect, useState } from "react";
import axios from "axios";
import CalendarView from "./CalendarView"; 
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";

import enUS from "date-fns/locale/en-US";

const locales = {
  "en-US": enUS,
};


const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});


const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [selected, setSelected] = useState(null);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [hodNotes, setHodNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const token = localStorage.getItem("token");

  // Fetch appointments
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/visit_logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const now = new Date();

  const filtered = appointments.filter((a) => {
    const scheduledTime = a.scheduled_time ? new Date(a.scheduled_time) : null;
    switch (filter) {
      case "Upcoming":
        return (
          a.action_taken === "Scheduled" &&
          scheduledTime &&
          scheduledTime > now
        );
      case "Missed":
        return (
          a.action_taken === "Scheduled" &&
          scheduledTime &&
          scheduledTime < now
        );
      case "Pending":
      case "Scheduled":
      case "Completed":
      case "Cancelled":
        return a.action_taken === filter;
      default:
        return true;
    }
  });

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
      case "Pending": return "text-yellow-600";
      case "Scheduled": return "text-blue-600";
      case "Completed": return "text-green-600";
      case "Cancelled": return "text-red-600";
      default: return "text-gray-500";
    }
  };

  const getTimeBadge = (app) => {
    if (app.action_taken !== "Scheduled" || !app.scheduled_time) return null;
    const now = new Date();
    const scheduled = new Date(app.scheduled_time);
    const diffMinutes = (scheduled - now) / (1000 * 60);

    if (diffMinutes >= -1 && diffMinutes <= 30) {
      return (
        <span className="ml-2 text-sm text-orange-600 font-medium">
          ⏰ Upcoming Soon
        </span>
      );
    } else if (diffMinutes < -1) {
      return (
        <span className="ml-2 text-sm text-red-600 font-medium">
          ⚠️ Missed
        </span>
      );
    }
    return null;
  };

  return (
    <div className="p-4">
      {/* Tabs */}
      <div className="flex justify-between mb-4 items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              viewMode === "list"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            📋 List View
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${
              viewMode === "calendar"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            🗓 Calendar View
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {["All", "Upcoming", "Missed", "Pending", "Scheduled", "Completed", "Cancelled"].map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-lg transition font-medium ${
                  filter === tab
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 p-6 border rounded-lg">
              No {filter.toLowerCase()} appointments found.
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.visit_id}
                className="border border-gray-300 rounded-lg p-4 bg-white hover:shadow-md transition cursor-pointer"
                onClick={() => setSelected(selected?.visit_id === app.visit_id ? null : app)}
              >
                {/* Purpose + Status */}
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-gray-800">{app.purpose}</h3>
                  <div className="flex items-center">
                    {!getTimeBadge(app) && (
                      <span className={`${getStatusColor(app.action_taken)} font-semibold`}>
                        {app.action_taken}
                      </span>
                    )}
                    {getTimeBadge(app)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Student: {app.student?.full_name || "N/A"}
                </p>

                {selected?.visit_id === app.visit_id && (
                  <div className="mt-3 border-t pt-3 text-sm text-gray-700 space-y-2">
                    <p>
                      <strong>Check-In:</strong>{" "}
                      {new Date(app.check_in_time).toLocaleString()}
                    </p>
                    <p>
                      <strong>Scheduled:</strong>{" "}
                      {app.scheduled_time
                        ? new Date(app.scheduled_time).toLocaleString()
                        : "—"}
                    </p>
                    {app.hod_notes && (
                      <p>
                        <strong>HOD Notes:</strong> {app.hod_notes}
                      </p>
                    )}

                    <div className="flex gap-2 mt-2">
                      {["Pending", "Scheduled"].includes(app.action_taken) && (
                        <>
                          <button
                            onClick={() => handleSchedule(app)}
                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                          >
                            Schedule
                          </button>
                          <button
                            onClick={() => handleMarkCompleted(app)}
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleAction(app.visit_id, "Cancelled")}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        // ✅ Calendar View
        <CalendarView appointments={appointments} />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-3">Schedule Appointment</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700">Time</label>
                <input
                  type="time"
                  className="w-full border rounded p-2"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSchedule}
                className="px-3 py-1 bg-blue-600 text-white rounded"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-3">Meeting Notes</h2>
            <textarea
              className="w-full border rounded p-2 mb-4"
              rows="4"
              placeholder="Write meeting notes..."
              value={hodNotes}
              onChange={(e) => setHodNotes(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowNotesModal(false)}
                className="px-3 py-1 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 bg-green-600 text-white rounded"
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
