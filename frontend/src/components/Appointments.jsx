import React, { useEffect, useState } from "react";
import axios from "axios";

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/visit_logs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(res.data);
      } catch (err) {
        console.error("Error fetching appointments:", err.message);
      }
    };
    fetchAppointments();
  }, [token]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>
      <table className="min-w-full border border-gray-300 dark:border-gray-600">
        <thead>
          <tr className="bg-gray-200 dark:bg-gray-700">
            <th className="p-2 border-b">Student</th>
            <th className="p-2 border-b">Purpose</th>
            <th className="p-2 border-b">Check-In Time</th>
            <th className="p-2 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((app) => (
            <tr key={app.visit_id} className="hover:bg-gray-100 dark:hover:bg-gray-800">
              <td className="p-2 border-b">{app.student?.full_name}</td>
              <td className="p-2 border-b">{app.purpose}</td>
              <td className="p-2 border-b">{new Date(app.check_in_time).toLocaleString()}</td>
              <td className="p-2 border-b">{app.action_taken}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
