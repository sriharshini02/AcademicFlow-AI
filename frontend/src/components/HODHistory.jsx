import React, { useState, useEffect } from "react";
import axios from "axios";

const HODHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/visit_logs/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHistory(res.data.filter((log) => log.action_taken === "Completed"));
      } catch (err) {
        console.error("Failed to fetch history:", err.message);
      }
    };
    fetchHistory();
  }, [token]);

  // Filtered by search (student, visitor, purpose)
  const filteredHistory = history.filter(
    (log) =>
      log.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">HOD Meeting History</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by student, visitor, or purpose..."
        className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Timeline */}
      {filteredHistory.length === 0 ? (
        <p className="text-gray-500 mt-4">No completed appointments found.</p>
      ) : (
        <div className="relative border-l-2 border-gray-300 mt-4">
          {filteredHistory.map((log) => (
            <div key={log.visit_id} className="mb-6 ml-6 relative">
              <span className="absolute -left-3 w-6 h-6 bg-blue-600 rounded-full top-2 border-2 border-white"></span>
              <div className="bg-white shadow-md rounded p-4 hover:shadow-lg transition">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">{log.purpose}</h3>
                  <span className="text-sm text-gray-500">
                    {new Date(log.check_in_time).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Student:</strong> {log.student?.full_name || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Visitor:</strong> {log.visitor_name} ({log.visitor_role})
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  <strong>Time:</strong>{" "}
                  {new Date(log.check_in_time).toLocaleTimeString()} -{" "}
                  {log.end_time ? new Date(log.end_time).toLocaleTimeString() : "—"}
                </p>
                {log.hod_notes && (
                  <p className="text-sm text-gray-700 mt-2 border-t pt-2">
                    <strong>HOD Notes:</strong> {log.hod_notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HODHistory;
