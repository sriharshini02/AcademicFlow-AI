import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { 
  Search, Filter, User, GraduationCap, Users, X, Award, Phone, 
  TrendingUp, BookOpen, Activity, Mail, MapPin 
} from "lucide-react";

// CHARTS LIBRARY
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const HODStudents = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null); 
  
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
    
    if (yearFilter) {
      result = result.filter((s) => s.year && s.year.toString() === yearFilter);
    }

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
    // Handle GPA parsing safely (Marks vs GPA)
    const gpas = filtered.map((s) => {
        let val = parseFloat(s.gpa);
        if(val > 10) val = val/10; 
        return val;
    }).filter((v) => !isNaN(v));

    const att = filtered.map((s) => parseFloat(s.attendance)).filter((v) => !isNaN(v));
    const avgGPA = gpas.length ? (gpas.reduce((a, b) => a + b, 0) / gpas.length).toFixed(2) : "0.0";
    const avgAttendance = att.length ? (att.reduce((a, b) => a + b, 0) / att.length).toFixed(1) + "%" : "0%";
    return { total, avgGPA, avgAttendance };
  }, [filtered]);

  const handleRowClick = (student) => {
    setSelectedStudentId(student.id);
  };

  const closeModal = () => {
    setSelectedStudentId(null);
  };

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Syncing Records...</div>;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      
      {/* Header & Stats Row */}
      <div className="flex flex-col xl:flex-row gap-6">
        <div className="flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Academic & Personal Data</p>
        </div>

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

      {/* 🔍 Controls */}
      <div className="p-2 rounded-2xl neu-raised bg-slate-50/50 dark:bg-slate-900/20 border border-white/20 flex flex-col md:flex-row items-center gap-4">
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

        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative">
             <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
             <select
               className="pl-9 pr-8 py-3 rounded-xl neu-inset bg-transparent outline-none text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 cursor-pointer hover:text-indigo-500 transition-colors appearance-none"
               value={yearFilter}
               onChange={(e) => setYearFilter(e.target.value)}
             >
               <option value="">All Years</option>
               <option value="1">1st Year</option>
               <option value="2">2nd Year</option>
               <option value="3">3rd Year</option>
               <option value="4">4th Year</option>
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
               <option value="D">Section D</option>
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
                    <td className="p-5 text-center font-bold text-slate-700 dark:text-slate-200">
                        {parseFloat(stu.gpa) > 10 ? (parseFloat(stu.gpa)/10).toFixed(2) : stu.gpa}
                    </td>
                    <td className="p-5 text-xs text-slate-500">{stu.proctor}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🪟 Detailed Modal */}
      {selectedStudentId && (
        <StudentDetailModal 
          studentId={selectedStudentId} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};

// --------------------------------------------------------------------------
// 🔹 UPDATED: Student Detail Modal (Restored Info + New Graphs)
// --------------------------------------------------------------------------
const StudentDetailModal = ({ studentId, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        // Using HOD endpoint
        const res = await axios.get(`http://localhost:5000/api/hod/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetails(res.data);
      } catch (err) {
        console.error("❌ Error fetching details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [studentId]);

  // 🔹 RECALCULATE CGPA (Auto-Fix)
  const calculateCGPA = () => {
    if (!details?.academic_scores?.length) return "N/A";
    const total = details.academic_scores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks || s.marks) || 0), 0);
    let avg = total / details.academic_scores.length;
    if (avg > 10) avg = avg / 10;
    return avg.toFixed(2);
  };

  // 🔹 SEMESTER DATA (Graph & Cards) 
  const semesterData = useMemo(() => {
    if (!details?.academic_scores) return [];
    
    const groups = {};
    details.academic_scores.forEach(score => {
      const sem = score.semester || "Unknown";
      if (!groups[sem]) groups[sem] = [];
      groups[sem].push(score);
    });

    return Object.keys(groups).map(sem => {
      const subjects = groups[sem];
      const total = subjects.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks || s.marks) || 0), 0);
      let sgpa = total / subjects.length;
      if (sgpa > 10) sgpa = sgpa / 10;
      
      const backlogs = subjects.filter(s => (parseFloat(s.grade_points || s.total_marks || s.marks) || 0) < 5).length;

      return { sem: `Sem ${sem}`, sgpa: parseFloat(sgpa.toFixed(2)), backlogs };
    }).sort((a,b) => a.sem.localeCompare(b.sem)); 
  }, [details]);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in duration-300 p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative neu-raised border border-white/20" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-6 flex justify-between items-center">
           <div>
              <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">{details?.full_name || "Student Details"}</h3>
              <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest mt-1">360° Academic View</p>
           </div>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-rose-50 hover:text-rose-500 text-slate-400 transition-all">
             <X size={20} />
           </button>
        </div>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-4 text-slate-400">
             <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
             <span className="text-xs font-bold uppercase tracking-widest">Fetching Details...</span>
          </div>
        ) : details ? (
          <div className="p-8 space-y-8">
            
            {/* 1. Identity & Metrics */}
            <div className="p-6 rounded-[1.5rem] neu-raised bg-slate-50 dark:bg-slate-800/50 flex flex-col md:flex-row gap-6">
               <div className="h-20 w-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30">
                {details.full_name?.charAt(0)}
              </div>
              <div className="flex-1">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">{details.full_name}</h3>
                 <p className="text-sm font-semibold text-indigo-500">{details.roll_number}</p>
                 <div className="flex gap-4 mt-4">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Current CGPA</p>
                        <p className="text-2xl font-black text-amber-500">{calculateCGPA()}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400">Attendance</p>
                        <p className="text-2xl font-black text-emerald-500">{details.attendance_percentage}%</p>
                    </div>
                 </div>
              </div>
            </div>

            {/* 2. Personal Details (RESTORED) */}
            <section>
               <div className="flex items-center gap-2 mb-4 text-indigo-500"><User size={18} /><h4 className="text-sm font-black uppercase tracking-widest">Personal Details</h4></div>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DetailBox label="Department" value={details.department} />
                  <DetailBox label="Year" value={details.year_group} />
                  <DetailBox label="Section" value={details.section} />
                  <DetailBox label="Gender" value={details.gender} />
                  <DetailBox label="DOB" value={details.dob} />
                  <DetailBox label="Phone" value={details.phone} />
                  <DetailBox label="College Email" value={details.email} full />
               </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 3. Guardian Info (RESTORED) */}
            <section>
               <div className="flex items-center gap-2 mb-4 text-amber-500"><Users size={18} /><h4 className="text-sm font-black uppercase tracking-widest">Guardian Info</h4></div>
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

            {/* 4. Academic Performance (UPDATED with Graphs) */}
            <section>
                <div className="flex items-center gap-2 mb-4 text-emerald-500">
                   <Activity size={18} />
                   <h4 className="text-sm font-black uppercase tracking-widest">Academic Trends</h4>
                </div>

                {/* GRAPH */}
                <div className="h-48 w-full p-4 mb-6 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={semesterData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="sem" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 10]} tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                      <Line type="monotone" dataKey="sgpa" stroke="#6366f1" strokeWidth={3} dot={{r: 4, fill: '#6366f1', strokeWidth: 2, stroke: '#fff'}} />
                    </LineChart>
                  </ResponsiveContainer>
               </div>

               {/* CARDS */}
               <div className="grid grid-cols-2 gap-4">
                 {semesterData.length > 0 ? semesterData.map((sem, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                       <div>
                          <p className="text-xs font-bold text-slate-400 uppercase">{sem.sem}</p>
                          <p className={`text-xl font-black ${sem.sgpa >= 7.5 ? 'text-emerald-500' : sem.sgpa >= 6 ? 'text-indigo-500' : 'text-rose-500'}`}>{sem.sgpa} <span className="text-[10px] text-slate-400 font-normal">SGPA</span></p>
                       </div>
                       {sem.backlogs > 0 ? (
                          <span className="px-2 py-1 rounded bg-rose-100 text-rose-600 text-[10px] font-bold">{sem.backlogs} Backlogs</span>
                       ) : (
                          <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-600 text-[10px] font-bold">All Clear</span>
                       )}
                    </div>
                 )) : <p className="text-slate-400 italic text-sm">No academic data available.</p>}
              </div>
            </section>

            <div className="h-px bg-slate-100 dark:bg-slate-800" />

            {/* 5. Extracurriculars (RESTORED) */}
            <section>
               <div className="flex items-center gap-2 mb-4 text-purple-500"><Award size={18} /><h4 className="text-sm font-black uppercase tracking-widest">Extracurriculars</h4></div>
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
               ) : <p className="text-slate-400 italic text-sm">No activities recorded.</p>}
            </section>

            {/* 6. Proctor Info (RESTORED) */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl flex items-center justify-between border border-indigo-100 dark:border-indigo-800">
                <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Assigned Proctor</span>
                <span className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2"><User size={14} /> {details.proctor}</span>
            </div>

          </div>
        ) : <div className="text-center text-gray-500">No details available.</div>}
      </div>
    </div>
  );
};

// Helper
const DetailBox = ({ label, value, full, highlight, icon }) => (
  <div className={`p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800/50 ${full ? 'md:col-span-3' : ''}`}>
     <div className="flex items-center gap-2 text-slate-400 mb-1">
        {icon} <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
     </div>
     <p className={`font-bold text-sm truncate ${highlight === 'emerald' ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-200'}`}>
       {value || "—"}
     </p>
  </div>
);

export default HODStudents;