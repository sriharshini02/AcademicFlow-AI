import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";

const HODAppointments = () => {
  const [pending, setPending] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 🔥 New state variables for meeting notes modal
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [hodNotes, setHodNotes] = useState("");

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [pendingRes, scheduledRes] = await Promise.all([
        axios.get("http://localhost:5000/api/visit_logs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/visit_logs/scheduled", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPending(pendingRes.data);
      setScheduled(scheduledRes.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err.response?.data || err.message);
      alert("Failed to fetch appointments. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const updateStatus = async (id, action_taken, scheduled_time = null, hod_notes = null) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visit_logs/${id}/update-status`,
        { action_taken, scheduled_time, hod_notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments(); // Refresh after update
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // 🔥 New handler — open notes modal
  const handleMarkCompleted = (visit) => {
    setSelectedVisit(visit);
    setShowNotesModal(true);
  };

  // 🔥 New handler — submit notes
  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    await updateStatus(selectedVisit.visit_id, "Completed", null, hodNotes);
    setShowNotesModal(false);
    setHodNotes("");
  };

  if (loading) return <p>Loading appointments...</p>;

  return (
    <div className="space-y-6">
      {/* Pending Appointments */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-semibold mb-3 text-indigo-600">Pending Appointments</h3>
        {pending.length === 0 ? (
          <p className="text-gray-500">No pending appointments.</p>
        ) : (
          pending.map((visit) => (
            <div key={visit.visit_id} className="mb-4 border-b pb-2">
              <p>
                <strong>{visit.visitor_name}</strong> ({visit.visitor_role}) —{" "}
                {visit.student?.full_name || "No Student"} —{" "}
                {dayjs(visit.check_in_time).format("DD MMM YYYY, HH:mm")}
              </p>
              <p className="text-gray-600">Purpose: {visit.purpose}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                  onClick={() =>
                    updateStatus(
                      visit.visit_id,
                      "Scheduled",
                      dayjs().add(30, "minute").toISOString()
                    )
                  }
                >
                  Schedule +30min
                </button>
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleMarkCompleted(visit)} // 🔥 show modal instead of instant complete
                >
                  Mark Completed
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Scheduled Appointments */}
      <div className="bg-white rounded-xl shadow-lg border p-6">
        <h3 className="text-xl font-semibold mb-3 text-indigo-600">Scheduled Appointments</h3>
        {scheduled.length === 0 ? (
          <p className="text-gray-500">No scheduled appointments.</p>
        ) : (
          scheduled.map((visit) => (
            <div key={visit.visit_id} className="mb-4 border-b pb-2">
              <p>
                <strong>{visit.visitor_name}</strong> ({visit.visitor_role}) —{" "}
                {visit.student?.full_name || "No Student"} —{" "}
                {dayjs(visit.scheduled_time).format("DD MMM YYYY, HH:mm")}
              </p>
              <p className="text-gray-600">Purpose: {visit.purpose}</p>
              <div className="mt-2 flex gap-2">
                <button
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleMarkCompleted(visit)} // 🔥 same modal logic here
                >
                  Mark Completed
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 🔥 Meeting Notes Modal */}
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

export default HODAppointments;
