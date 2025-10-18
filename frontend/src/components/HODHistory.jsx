import React, { useState, useEffect } from "react";
import axios from "axios";

const HODHistory = () => {
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/visit_logs/history", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setHistory(res.data.filter(log => log.action_taken === "Completed"));
      } catch (err) {
        console.error("Failed to fetch history:", err.message);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-semibold border-b pb-2">Completed Appointments History</h2>
      {history.length === 0 ? (
        <p className="text-gray-500">No completed appointments yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Student</th>
                <th className="p-2 border">Visitor</th>
                <th className="p-2 border">Purpose</th>
                <th className="p-2 border">Check-In</th>
                <th className="p-2 border">End Time</th>
                <th className="p-2 border">HOD Notes</th>
              </tr>
            </thead>
            <tbody>
              {history.map((log) => (
                <tr key={log.visit_id} className="hover:bg-gray-50">
                  <td className="p-2 border">{log.student?.full_name || "N/A"}</td>
                  <td className="p-2 border">{log.visitor_name}</td>
                  <td className="p-2 border">{log.purpose}</td>
                  <td className="p-2 border">{new Date(log.check_in_time).toLocaleString()}</td>
                  <td className="p-2 border">{log.end_time ? new Date(log.end_time).toLocaleString() : "—"}</td>
                  <td className="p-2 border">{log.hod_notes || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HODHistory;
