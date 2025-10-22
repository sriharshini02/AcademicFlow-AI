import React, { useEffect, useState } from "react";
import axios from "axios";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [yearFilter, setYearFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hod/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
        setFilteredStudents(res.data);
      } catch (err) {
        console.error("❌ Error fetching HOD students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // 🎯 Filter logic
  useEffect(() => {
    let filtered = [...students];

    if (yearFilter) {
      filtered = filtered.filter((stu) => stu.year === yearFilter);
    }
    if (sectionFilter) {
      filtered = filtered.filter((stu) => stu.section === sectionFilter);
    }

    setFilteredStudents(filtered);
  }, [yearFilter, sectionFilter, students]);

  const handleRowClick = async (student) => {
    setSelectedStudent(student);
    setDetails(null);
    setDetailsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        `http://localhost:5000/api/hod/students/${student.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDetails(res.data);
    } catch (err) {
      console.error("❌ Error fetching student details:", err);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedStudent(null);
    setDetails(null);
  };

  // 🧩 Extract unique filter options
  const years = [...new Set(students.map((s) => s.year))];
  const sections = [...new Set(students.map((s) => s.section))];

  if (loading) return <div>Loading students...</div>;
  if (!students.length) return <div>No students found in your department.</div>;

  return (
    <div className="relative p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Students in Your Department
      </h2>

      {/* 🔽 Filters */}
      <div className="flex justify-center gap-4 mb-6">
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
        >
          <option value="">All Years</option>
          {years.map((year, i) => (
            <option key={i} value={year}>
              {year}
            </option>
          ))}
        </select>

        <select
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm focus:ring focus:ring-blue-300"
        >
          <option value="">All Sections</option>
          {sections.map((sec, i) => (
            <option key={i} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        {(yearFilter || sectionFilter) && (
          <button
            onClick={() => {
              setYearFilter("");
              setSectionFilter("");
            }}
            className="bg-gray-200 px-3 py-2 rounded-lg hover:bg-gray-300 transition"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 📋 Students Table */}
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
          {filteredStudents.map((stu, i) => (
            <tr
              key={i}
              className="hover:bg-blue-50 text-center cursor-pointer"
              onClick={() => handleRowClick(stu)}
            >
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

      {/* 🪟 Modal Overlay */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-xl w-3/4 max-h-[90vh] overflow-y-auto p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500 text-xl"
            >
              ✖
            </button>

            <h3 className="text-2xl font-semibold mb-4 text-center">
              {selectedStudent.name} — Full Details
            </h3>

            {detailsLoading ? (
              <div className="text-center text-gray-500">Loading details…</div>
            ) : details ? (
              <div className="space-y-4 text-gray-800">
                {/* All your existing detail sections here */}
                {/* (same as before, unchanged) */}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                No details available.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HODStudents;
