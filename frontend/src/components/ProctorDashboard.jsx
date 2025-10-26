import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaUsers, FaChartLine, FaExclamationTriangle, FaCalendarCheck } from "react-icons/fa";

const ProctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/proctor/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching proctor dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <p className="text-gray-600">Loading dashboard...</p>;
  if (!stats) return <p className="text-red-600">Failed to load data</p>;

  const cards = [
    { title: "Assigned Students", value: stats.totalStudents, icon: <FaUsers />, color: "bg-blue-500" },
    { title: "Avg Attendance", value: `${stats.avgAttendance}%`, icon: <FaCalendarCheck />, color: "bg-green-500" },
    { title: "Avg Internal Marks", value: `${stats.avgInternal}`, icon: <FaChartLine />, color: "bg-indigo-500" },
    { title: "Low Performers", value: stats.lowPerformance, icon: <FaExclamationTriangle />, color: "bg-red-500" },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 border-b pb-2 mb-4">
        Proctor Dashboard
      </h2>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className={`p-5 rounded-xl shadow-lg text-white ${card.color}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="text-2xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="text-3xl opacity-70">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Student Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
          Assigned Students Overview
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Year</th>
                <th className="p-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {stats.students.map((s) => (
                <tr key={s.student_id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
                  <td className="p-3">{s.roll_number}</td>
                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.year_group}</td>
                  <td className="p-3">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProctorDashboard;
