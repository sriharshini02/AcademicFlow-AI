import React, { useEffect, useState } from "react";
import axios from "axios";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hod/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("🎓 Fetched students:", res.data);
        setStudents(res.data);
      } catch (err) {
        console.error("❌ Error fetching HOD students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  if (loading) return <div>Loading students...</div>;
  if (!students.length) return <div>No students found in your department.</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Students in Your Department</h2>
      <table className="min-w-full border border-gray-300 rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 border">Roll No</th>
            <th className="px-4 py-2 border">Name</th>
            <th className="px-4 py-2 border">Year</th>
            <th className="px-4 py-2 border">Attendance (%)</th>
            <th className="px-4 py-2 border">GPA</th>
            <th className="px-4 py-2 border">Proctor</th>
          </tr>
        </thead>
        <tbody>
          {students.map((stu, i) => (
            <tr key={i} className="hover:bg-gray-50 text-center">
              <td className="px-4 py-2 border">{stu.rollNumber}</td>
              <td className="px-4 py-2 border font-medium">{stu.name}</td>
              <td className="px-4 py-2 border">{stu.year}</td>
              <td className="px-4 py-2 border">{stu.attendance}</td>
              <td className="px-4 py-2 border">{stu.gpa}</td>
              <td className="px-4 py-2 border">{stu.proctor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HODStudents;
