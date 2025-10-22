import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [search, setSearch] = useState("");

  // 🧭 Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/hod/students", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(res.data);
        setFiltered(res.data);
      } catch (err) {
        console.error("❌ Error fetching HOD students:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 🔍 Apply filters and search
  useEffect(() => {
    let result = [...students];
    if (yearFilter) result = result.filter((s) => s.year === yearFilter);
    if (sectionFilter)
      result = result.filter(
        (s) => s.section && s.section.toLowerCase() === sectionFilter.toLowerCase()
      );
    if (search)
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(result);
  }, [yearFilter, sectionFilter, search, students]);

  // 📊 Compute dashboard stats
  const stats = useMemo(() => {
    if (!filtered.length) return { total: 0, avgGPA: "0.0", avgAttendance: "0%" };
    const total = filtered.length;
    const gpas = filtered
      .map((s) => parseFloat(s.gpa))
      .filter((v) => !isNaN(v));
    const att = filtered
      .map((s) => parseFloat(s.attendance))
      .filter((v) => !isNaN(v));
    const avgGPA = gpas.length
      ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2)
      : "0.0";
    const avgAttendance = att.length
      ? (att.reduce((a, b) => a + b, 0) / att.length).toFixed(1) + "%"
      : "0%";
    return { total, avgGPA, avgAttendance };
  }, [filtered]);

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

  if (loading) return <div>Loading students...</div>;
  if (!students.length) return <div>No students found in your department.</div>;

  return (
    <div className="relative p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Students in Your Department
      </h2>

      {/* 🔍 Filter + Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            className="border rounded-md px-3 py-2"
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          >
            <option value="">All Years</option>
            <option value="2025">Year 4</option>
            <option value="2026">Year 3</option>
            <option value="2027">Year 2</option>
            <option value="2028">Year 1</option>
          </select>

          <select
            className="border rounded-md px-3 py-2"
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="border rounded-md px-4 py-2 flex-1 min-w-[250px]"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* 📊 Stats Bar */}
      <div className="flex flex-wrap justify-around bg-blue-50 p-4 rounded-lg shadow mb-6 text-center">
        <div>
          <p className="text-lg font-semibold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Students</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.avgGPA}</p>
          <p className="text-sm text-gray-600">Average GPA</p>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.avgAttendance}</p>
          <p className="text-sm text-gray-600">Avg Attendance</p>
        </div>
      </div>

      {/* 🧾 Students Table */}
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
          {filtered.map((stu, i) => (
            <tr
              key={i}
              className="hover:bg-blue-50 text-center cursor-pointer transition"
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

      {/* 🪟 Student Detail Modal */}
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
          {/* Basic Info */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Student Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Roll No:</strong> {details.roll_number}</div>
              <div><strong>Department:</strong> {details.department}</div>
              <div><strong>Year:</strong> {details.year_group}</div>
              <div><strong>Section:</strong> {details.section}</div>
              <div><strong>Gender:</strong> {details.gender}</div>
              <div><strong>DOB:</strong> {details.dob}</div>
              <div><strong>Phone:</strong> {details.phone}</div>
              <div><strong>College Email:</strong> {details.email}</div>
              <div><strong>Personal Email:</strong> {details.personal_email}</div>
            </div>
          </section>

          <hr />

          {/* Parents */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Parent Details</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>Father:</strong> {details.father_name}</div>
              <div><strong>Mother:</strong> {details.mother_name}</div>
              <div><strong>Father Phone:</strong> {details.father_phone}</div>
              <div><strong>Mother Phone:</strong> {details.mother_phone}</div>
            </div>
          </section>

          <hr />

          {/* Academic */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Academic Performance</h4>
            <div className="grid grid-cols-2 gap-4">
              <div><strong>GPA:</strong> {details.gpa}</div>
              <div><strong>Total Marks:</strong> {details.total_marks}</div>
            </div>
            <div className="mt-2">
              <h5 className="font-medium">Subjects:</h5>
              <ul className="list-disc pl-6 text-sm">
                {details.academic_scores?.length ? (
                  details.academic_scores.map((a, idx) => (
                    <li key={idx}>
                      {a.subject_name} (Sem {a.semester}) — {a.total_marks}
                    </li>
                  ))
                ) : (
                  <li>No academic data available</li>
                )}
              </ul>
            </div>
          </section>

          <hr />

          {/* Attendance */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Attendance</h4>
            <p><strong>Latest Attendance:</strong> {details.attendance_percentage}%</p>
          </section>

          <hr />

          {/* Extracurricular */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Extracurriculars</h4>
            {details.extracurriculars?.length ? (
              <ul className="list-disc pl-6 text-sm">
                {details.extracurriculars.map((act, idx) => (
                  <li key={idx}>
                    {act.activity_name} — {act.achievement_level} ({act.date?.substring(0, 10)})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No extracurricular activities listed.</p>
            )}
          </section>

          <hr />

          {/* Proctor */}
          <section>
            <h4 className="text-lg font-semibold mb-2">Proctor Information</h4>
            <p><strong>Proctor:</strong> {details.proctor}</p>
          </section>
        </div>
      ) : (
        <div className="text-center text-gray-500">No details available.</div>
      )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HODStudents;
