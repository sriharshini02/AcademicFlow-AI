import React, { useEffect, useState } from "react";
import axios from "axios";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState("");
  const [section, setSection] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = {};
      if (year) params.year = year;
      if (section) params.section = section;

      const res = await axios.get("http://localhost:5000/api/hod/students", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("🎓 Filtered students:", res.data);
      setStudents(res.data);
    } catch (err) {
      console.error("❌ Error fetching HOD students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [year, section]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Students in Your Department
      </h2>

      {/* Filters */}
      <div className="flex justify-center gap-4 mb-6">
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">All Years</option>
          <option value="2023">2023</option>
          <option value="2024">2024</option>
          <option value="2025">2025</option>
        </select>

        <select
          value={section}
          onChange={(e) => setSection(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="">All Sections</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
        </select>
      </div>

      {loading ? (
        <div>Loading students...</div>
      ) : !students.length ? (
        <div>No students found in your department.</div>
      ) : (
        <table className="min-w-full border border-gray-300 rounded-lg shadow">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border">Roll No</th>
              <th className="px-4 py-2 border">Name</th>
              <th className="px-4 py-2 border">Year</th>
              <th className="px-4 py-2 border">Section</th>
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
                <td className="px-4 py-2 border">{stu.section}</td>
                <td className="px-4 py-2 border">{stu.attendance}</td>
                <td className="px-4 py-2 border">{stu.gpa}</td>
                <td className="px-4 py-2 border">{stu.proctor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default HODStudents;
