// src/components/HODStudents.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../App.jsx";
import axios from "axios";

const HODStudents = () => {
  const { token } = useAuth();
  const [names, setNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get("http://localhost:5000/api/hod/students", {
  headers: { Authorization: `Bearer ${token}` },
});


        console.log("Backend student data:", res.data);
        setNames(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Unable to fetch students. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNames();
  }, [token]);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-3">
        Department Students
      </h2>

      {loading ? (
        <div className="text-gray-600">Fetching student names...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : names.length === 0 ? (
        <div className="text-gray-500">No students found for your department.</div>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <ul className="divide-y divide-gray-200">
            {names.map((name, index) => (
              <li
                key={index}
                className="p-2 hover:bg-gray-50 transition-colors duration-150"
              >
                {name}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default HODStudents;
