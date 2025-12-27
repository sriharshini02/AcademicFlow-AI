import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Search, Filter, User, GraduationCap, Users, X, Award, Phone } from "lucide-react";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Filter States
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
    const gpas = filtered.map((s) => parseFloat(s.gpa)).filter((v) => !isNaN(v));
    const att = filtered.map((s) => parseFloat(s.attendance)).filter((v) => !isNaN(v));
    const avgGPA = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : "0.0";
    const avgAttendance = att.length ? (att.reduce((a, b) => a + b, 0) / att.length).toFixed(1) + "%" : "0%";
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

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Syncing Records...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Stats Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        {/* Title Section */}
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academic & Personal Data</p>
        </div>

        {/* Stats Cards */}
        <div className="flex gap-4">
           <div className="px-6 py-3 rounded-2xl neu-raised bg-white dark:bg-slate-900 border border-white/20 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-black text-indigo-500">{stats.total}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
           </div>
           <div className="px-6 py-3 rounded-2xl neu-raised bg-white dark:bg-slate-900 border border-white/20 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-black text-emerald-500">{stats.avgGPA}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg GPA</span>
           </div>
           <div className="px-6 py-3 rounded-2xl neu-raised bg-white dark:bg-slate-900 border border-white/20 flex flex-col items-center min-w-[100px]">
              <span className="text-2xl font-black text-amber-500">{stats.avgAttendance}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Attendance</span>
           </div>
        </div>
      </div>

      {/* 🔍 Controls: Search & Filters */}
      <div className="p-2 rounded-2xl neu-raised bg-slate-50/50 dark:bg-slate-900/20 border border-white/20 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="flex-1 w-full relative group">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
           </div>
           <input
             type="text"
             placeholder="Search by Name or Roll No..."
             className="w-full pl-12 pr-4 py-3 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white placeholder-slate-400/70"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative">
             <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <select
               className="pl-9 pr-8 py-3 rounded-xl neu-inset bg-transparent outline-none text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors appearance-none"
               value={yearFilter}
               onChange={(e) => setYearFilter(e.target.value)}
             >
               <option value="">All Years</option>
               <option value="2025">2025 (Year 4)</option>
               <option value="2026">2026 (Year 3)</option>
               <option value="2027">2027 (Year 2)</option>
               <option value="2028">2028 (Year 1)</option>
             </select>
           </div>

           <div className="relative">
             <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <select
               className="pl-9 pr-8 py-3 rounded-xl neu-inset bg-transparent outline-none text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors appearance-none"
               value={sectionFilter}
               onChange={(e) => setSectionFilter(e.target.value)}
             >
               <option value="">All Sections</option>
               <option value="A">Section A</option>
               <option value="B">Section B</option>
               <option value="C">Section C</option>
             </select>
           </div>
        </div>
      </div>

      {/* 🧾 Students Table */}
      <div className="rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-400">
                <th className="p-5">Roll No</th>
                <th className="p-5">Name</th>
                <th className="p-5">Year</th>
                <th className="p-5">Section</th>
                <th className="p-5 text-center">Attendance</th>
                <th className="p-5 text-center">GPA</th>
                <th className="p-5">Proctor</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600 dark:text-slate-300 divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.length === 0 ? (
                 <tr>
                   <td colSpan="7" className="p-10 text-center text-slate-400 italic">No student records match your filters.</td>
                 </tr>
              ) : (
                filtered.map((stu, i) => (
                  <tr
                    key={i}
                    onClick={() => handleRowClick(stu)}
                    className="group cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="p-5 font-bold text-indigo-500 group-hover:text-indigo-600 transition-colors">{stu.rollNumber}</td>
                    <td className="p-5 font-bold text-slate-800 dark:text-white">{stu.name}</td>
                    <td className="p-5">{stu.year}</td>
                    <td className="p-5">
                       <span className="px-2 py-1 rounded text-[10px] font-black bg-slate-100 dark:bg-slate-700 text-slate-500">{stu.section}</span>
                    </td>
                    <td className="p-5 text-center">
                       <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          parseFloat(stu.attendance) >= 75 
                            ? "bg-emerald-100 text-emerald-700 border border-emerald-200" 
                            : "bg-rose-100 text-rose-700 border border-rose-200"
                       }`}>
                          {stu.attendance}%
                       </span>
                    </td>
                    <td className="p-5 text-center font-bold text-slate-700 dark:text-slate-200">{stu.gpa}</td>
                    <td className="p-5 text-xs text-slate-500">{stu.proctor}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪟 Student Detail Modal */}
      {selectedStudent && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative neu-raised border border-white/20"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center">
               <div>
                  <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{selectedStudent.name}</h3>
                  <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">Student Profile</p>
               </div>
               <button
                 onClick={closeModal}
                 className="p-2 rounded-full hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all"
               >
                 <X size={20} />
               </button>
            </div>

            <div className="p-8 space-y-8">
              {detailsLoading ? (
                <div className="py-20 text-center flex flex-col items-center gap-4 text-slate-400">
                   <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                   <span className="text-xs font-bold uppercase tracking-widest">Fetching Details...</span>
                </div>
              ) : details ? (
                <>
                  {/* Basic Info Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-indigo-500">
                       <User size={18} />
                       <h4 className="text-sm font-black uppercase tracking-widest">Personal Details</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <DetailBox label="Roll No" value={details.roll_number} />
                       <DetailBox label="Department" value={details.department} />
                       <DetailBox label="Year Group" value={details.year_group} />
                       <DetailBox label="Section" value={details.section} />
                       <DetailBox label="Gender" value={details.gender} />
                       <DetailBox label="DOB" value={details.dob} />
                       <DetailBox label="College Email" value={details.email} full />
                       <DetailBox label="Personal Email" value={details.personal_email} full />
                       <DetailBox label="Phone" value={details.phone} />
                    </div>
                  </section>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Parent Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-amber-500">
                       <Users size={18} />
                       <h4 className="text-sm font-black uppercase tracking-widest">Guardian Info</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Father</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{details.father_name}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2"><Phone size={10} /> {details.father_phone}</p>
                       </div>
                       <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Mother</p>
                          <p className="font-bold text-slate-700 dark:text-slate-200">{details.mother_name}</p>
                          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2"><Phone size={10} /> {details.mother_phone}</p>
                       </div>
                    </div>
                  </section>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Academic Section */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-emerald-500">
                       <GraduationCap size={18} />
                       <h4 className="text-sm font-black uppercase tracking-widest">Academic Performance</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                       <DetailBox label="Current GPA" value={details.gpa} highlight="emerald" />
                       <DetailBox label="Total Marks" value={details.total_marks} />
                    </div>
                    
                    <div className="p-5 rounded-2xl neu-inset bg-slate-50/50 dark:bg-slate-900/30">
                       <h5 className="text-xs font-bold text-slate-500 uppercase mb-3">Subject Breakdown</h5>
                       <ul className="space-y-2">
                         {details.academic_scores?.length ? (
                           details.academic_scores.map((a, idx) => (
                             <li key={idx} className="flex justify-between items-center text-sm p-2 rounded-lg bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                                <span className="font-medium text-slate-700 dark:text-slate-200">{a.subject_name} <span className="text-slate-400 text-xs ml-1">(Sem {a.semester})</span></span>
                                <span className="font-bold text-indigo-500">{a.total_marks}</span>
                             </li>
                           ))
                         ) : (
                           <li className="text-slate-400 italic text-sm">No academic data available</li>
                         )}
                       </ul>
                    </div>
                  </section>

                  <div className="h-px bg-slate-100 dark:bg-slate-800" />

                  {/* Extracurriculars */}
                  <section>
                    <div className="flex items-center gap-2 mb-4 text-purple-500">
                       <Award size={18} />
                       <h4 className="text-sm font-black uppercase tracking-widest">Extracurriculars</h4>
                    </div>
                    {details.extracurriculars?.length ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                         {details.extracurriculars.map((act, idx) => (
                           <div key={idx} className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                              <Award size={16} className="text-purple-400 mt-1 shrink-0" />
                              <div>
                                 <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{act.activity_name}</p>
                                 <p className="text-xs text-slate-500">{act.achievement_level} • {act.date?.substring(0, 10)}</p>
                              </div>
                           </div>
                         ))}
                       </div>
                    ) : (
                       <p className="text-slate-400 italic text-sm">No activities recorded.</p>
                    )}
                  </section>

                  {/* Proctor Info */}
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
                     <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Assigned Proctor</span>
                     <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                        <User size={14} /> {details.proctor}
                     </span>
                  </div>

                </>
              ) : (
                <div className="text-center text-gray-500">No details available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper Component for Data Points
const DetailBox = ({ label, value, full, highlight }) => (
  <div className={`p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 ${full ? 'md:col-span-2' : ''}`}>
     <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{label}</p>
     <p className={`font-bold text-sm truncate ${highlight === 'emerald' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
       {value || "—"}
     </p>
  </div>
);

export default HODStudents;