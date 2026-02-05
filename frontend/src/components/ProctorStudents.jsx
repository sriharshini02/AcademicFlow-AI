import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Users, GraduationCap, CalendarCheck, 
  Search, Edit3, Award, TrendingUp, LayoutList,
  X, Phone, Mail, MapPin, User, BookOpen, Save, AlertCircle
} from "lucide-react";

const ProctorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null); 
  const [activeTab, setActiveTab] = useState("summary");

  // 1. Fetch Student List on Load
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/proctor/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error loading students", err);
    } finally {
      setLoading(false);
    }
  };

  // Compute Stats
  // 📊 Compute Real Analytics (Robust Version)
  const stats = useMemo(() => {
    const total = students.length;

    // 1. Fallback: If no students, return zeros
    if (total === 0) return { total: 0, avgAtt: "0", avgGPA: "0.00" };

    let totalAttendance = 0;
    let totalGPA = 0;
    let attendanceCount = 0;
    let gpaCount = 0;

    students.forEach((student) => {
      // 🔍 2. ROBUST ATTENDANCE CHECK
      // Checks for all possible naming conventions (snake_case, PascalCase, singular)
      const attendanceRecords = 
        student.student_attendances || 
        student.StudentAttendances || 
        student.StudentAttendance || 
        [];

      if (attendanceRecords.length > 0) {
        // Sort descending by date (newest first)
        const latest = attendanceRecords.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
        const attValue = parseFloat(latest?.attendance_percentage);
        
        if (!isNaN(attValue)) {
          totalAttendance += attValue;
          attendanceCount++;
        }
      }

      // 🔍 3. ROBUST GPA CHECK
      const academicScores = 
        student.student_academic_scores || 
        student.StudentAcademicScores || 
        student.StudentAcademicScore || 
        [];

      if (academicScores.length > 0) {
        const totalMarks = academicScores.reduce((sum, record) => sum + (parseFloat(record.total_marks) || 0), 0);
        const averageMarks = totalMarks / academicScores.length;
        
        // Convert 100-scale to 10-scale logic (e.g. 85 marks -> 8.5 GPA)
        const studentGPA = averageMarks > 10 ? averageMarks / 10 : averageMarks;
        
        if (!isNaN(studentGPA)) {
            totalGPA += studentGPA;
            gpaCount++;
        }
      }
    });

    // 4. Calculate Final Averages
    const finalAvgAtt = attendanceCount > 0 ? (totalAttendance / attendanceCount).toFixed(1) : "0";
    const finalAvgGPA = gpaCount > 0 ? (totalGPA / gpaCount).toFixed(2) : "0.00";

    return { 
      total, 
      avgAtt: finalAvgAtt, 
      avgGPA: finalAvgGPA 
    };
  }, [students]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">My Students</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Student Management & Analytics</p>
        </div>

        <div className="flex p-1.5 rounded-xl neu-inset bg-slate-100 dark:bg-slate-900/50 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "summary", icon: <TrendingUp size={14} />, label: "Summary" },
            { id: "list", icon: <LayoutList size={14} />, label: "Student List" },
            { id: "performance", icon: <GraduationCap size={14} />, label: "Performance" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
                  ? "neu-raised bg-white dark:bg-slate-800 text-indigo-600 shadow-sm transform scale-105"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="min-h-[400px]">
        
        {/* TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <SummaryCard title="Total Students" value={stats.total} icon={<Users size={24} />} color="text-indigo-500" />
            <SummaryCard title="Avg Attendance" value={`${stats.avgAtt}%`} icon={<CalendarCheck size={24} />} color="text-emerald-500" />
            <SummaryCard title="Class GPA" value={stats.avgGPA} icon={<TrendingUp size={24} />} color="text-amber-500" />
          </div>
        )}

        {/* TAB 2: STUDENT LIST */}
        {activeTab === "list" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            
            {/* ❌ "Add Student" Button Removed Here ❌ */}

            <div className="rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <th className="p-5">Roll No</th>
                      <th className="p-5">Name</th>
                      <th className="p-5">Year</th>
                      <th className="p-5">Department</th>
                      <th className="p-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm font-medium text-slate-600 dark:text-slate-300 divide-y divide-slate-50 dark:divide-slate-800/50">
                    {loading ? (
                      <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">Loading records...</td></tr>
                    ) : students.length === 0 ? (
                      <tr><td colSpan="5" className="p-10 text-center text-slate-400 italic">No students found.</td></tr>
                    ) : (
                      students.map((s) => (
                        <tr key={s.student_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="p-5 font-bold text-indigo-500">{s.roll_number}</td>
                          <td className="p-5 font-bold text-slate-800 dark:text-white">{s.full_name}</td>
                          <td className="p-5">{s.year_group}</td>
                          <td className="p-5 text-xs uppercase tracking-wider text-slate-500">{s.department}</td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => setSelectedStudentId(s.student_id)}
                              className="p-2 rounded-lg neu-raised text-slate-400 hover:text-indigo-500 hover:bg-white dark:hover:bg-slate-800 transition-all"
                              title="View/Edit Details"
                            >
                              <Edit3 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PLACEHOLDER */}
        {activeTab === "performance" && (
            <div className="p-10 rounded-[2rem] neu-inset flex flex-col items-center justify-center text-slate-400 gap-4 animate-in fade-in">
             <TrendingUp size={32} />
             <p className="text-sm font-bold uppercase tracking-widest opacity-60">Academic Charts Coming Soon</p>
          </div>
        )}
      </div>

      {/* 🚀 EXPANDED DETAIL/EDIT VIEW (SLIDE-OVER MODAL) */}
      {selectedStudentId && (
        <StudentEditModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)} 
          refreshList={fetchStudents} // Refresh main list on update
        />
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 🔹 SUB-COMPONENT: Student Edit/View Modal
// --------------------------------------------------------------------------
const StudentEditModal = ({ studentId, onClose, refreshList }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  // Fetch Details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/proctor/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetails(res.data);
        
        // Prepare form data for editing (flatten the object structure)
        setFormData({
          full_name: res.data.full_name,
          department: res.data.department,
          year_group: res.data.year,
          admission_type: "Management", // Default if missing, adjust based on your DB
          phone_number: res.data.phone,
          college_email: res.data.email,
          father_name: res.data.father_name,
          father_phone: res.data.phone, // Assuming mapping, check your DB field
          address: res.data.address
        });

      } catch (err) {
        console.error("Error fetching student details", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [studentId]);

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Submit Update
  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      // Payload structure matches your backend updateStudent controller
      const payload = {
        full_name: formData.full_name,
        year_group: formData.year_group,
        department: formData.department,
        admission_type: formData.admission_type,
        personal_info: {
          phone_number: formData.phone_number,
          college_email: formData.college_email,
          father_name: formData.father_name,
          father_phone: formData.father_phone,
          address: formData.address
        }
      };

      await axios.put(`http://localhost:5000/api/proctor/students/${studentId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setIsEditing(false);
      refreshList(); // Refresh the main list (e.g., if name changed)
      
      // Update local view data without refetching (optimistic update)
      setDetails(prev => ({
        ...prev,
        full_name: formData.full_name,
        department: formData.department,
        year: formData.year_group,
        phone: formData.phone_number,
        email: formData.college_email,
        father_name: formData.father_name,
        address: formData.address
      }));
      
    } catch (err) {
      console.error("Error updating student", err);
      alert("Failed to update student. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-slate-800">
        
        {/* Header with Close & Edit Buttons */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Student Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
              {isEditing ? "Editing Student Details" : "360° Academic View"}
            </p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 transition-colors"
              >
                <Edit3 size={16} /> Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                 <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-lg text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs uppercase hover:bg-emerald-600 transition-colors"
                  disabled={saving}
                >
                  {saving ? "Saving..." : <><Save size={16} /> Save Changes</>}
                </button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64 text-slate-400 font-bold italic">Loading full profile...</div>
        ) : !details ? (
          <div className="text-red-500 font-bold">Error loading details.</div>
        ) : (
          <div className="space-y-8">
            
            {/* 1. Identity Card (Editable Name/Dept) */}
            <div className="p-6 rounded-[1.5rem] neu-raised bg-slate-50 dark:bg-slate-800/50 flex items-center gap-6">
              <div className="h-20 w-20 rounded-2xl bg-indigo-500 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-indigo-500/30">
                {details.full_name?.charAt(0)}
              </div>
              <div className="w-full">
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                       <label className="text-[10px] font-bold uppercase text-slate-400">Full Name</label>
                       <input 
                         name="full_name" 
                         value={formData.full_name} 
                         onChange={handleChange}
                         className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-slate-800 dark:text-white focus:outline-indigo-500"
                       />
                    </div>
                     <div>
                       <label className="text-[10px] font-bold uppercase text-slate-400">Department</label>
                       <input 
                         name="department" 
                         value={formData.department} 
                         onChange={handleChange}
                         className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm focus:outline-indigo-500"
                       />
                    </div>
                     <div>
                       <label className="text-[10px] font-bold uppercase text-slate-400">Year Group</label>
                       <input 
                         name="year_group" 
                         value={formData.year_group} 
                         onChange={handleChange}
                         className="w-full mt-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold text-sm focus:outline-indigo-500"
                       />
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">{details.full_name}</h3>
                    <p className="text-sm font-semibold text-indigo-500">{details.roll_number}</p>
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                        {details.department}
                      </span>
                      <span className="px-2 py-1 rounded-md bg-white dark:bg-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-500 border border-slate-200 dark:border-slate-700">
                        Year {details.year}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. Key Metrics (Read-only for now - usually calculated) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase text-slate-400">Attendance</p>
                <p className="text-2xl font-black text-emerald-500">{details.attendance_percentage}%</p>
              </div>
              <div className="p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase text-slate-400">CGPA</p>
                <p className="text-2xl font-black text-amber-500">{details.gpa}</p>
              </div>
            </div>

            {/* 3. Personal Info (Editable) */}
            <div>
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">
                <User size={16} /> Personal Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <EditableRow isEditing={isEditing} icon={<Mail size={14}/>} label="Email" name="college_email" value={isEditing ? formData.college_email : details.email} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<Phone size={14}/>} label="Phone" name="phone_number" value={isEditing ? formData.phone_number : details.phone} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<User size={14}/>} label="Father" name="father_name" value={isEditing ? formData.father_name : details.father_name} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<Phone size={14}/>} label="Father's Phone" name="father_phone" value={isEditing ? formData.father_phone : details.father_phone} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<MapPin size={14}/>} label="Address" name="address" value={isEditing ? formData.address : details.address} onChange={handleChange} fullWidth />
              </div>
            </div>

             {/* 4. Academic History (Read Only) */}
             <div>
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4">
                <BookOpen size={16} /> Academic History <span className="text-[10px] text-slate-400 ml-2">(Auto-Synced)</span>
              </h4>
              <div className="space-y-2">
                {details.academic_scores?.length > 0 ? (
                  details.academic_scores.map((score) => (
                    <div key={score.id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{score.subject}</p>
                        <p className="text-[10px] font-bold uppercase text-slate-400">Sem {score.semester}</p>
                      </div>
                      <span className="font-mono font-bold text-indigo-500">{score.marks}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 italic">No academic records found.</p>
                )}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

// Helper for Detail Rows (Now supports Input Mode)
const EditableRow = ({ isEditing, icon, label, name, value, onChange, fullWidth }) => (
  <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 ${fullWidth ? 'col-span-2' : ''}`}>
    <div className="flex items-center gap-2 text-slate-400 mb-1">
      {icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
    {isEditing ? (
       <input 
         name={name}
         value={value || ""}
         onChange={onChange}
         className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-indigo-500"
       />
    ) : (
      <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{value || "-"}</p>
    )}
  </div>
);

const SummaryCard = ({ title, value, icon, color }) => (
  <div className="p-6 rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 flex items-center justify-between group hover:-translate-y-1 transition-transform">
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p>
      <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
    </div>
    <div className={`p-4 rounded-2xl neu-inset bg-slate-50 dark:bg-slate-900/50 ${color}`}>
      {icon}
    </div>
  </div>
);

export default ProctorStudents;