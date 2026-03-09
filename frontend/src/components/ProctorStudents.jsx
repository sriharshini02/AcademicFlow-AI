import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";

// 1. ICONS
import { 
  Users, GraduationCap, TrendingUp, LayoutList,
  X, Phone, Mail, MapPin, User, BookOpen, Save, AlertTriangle,
  PieChart as PieIcon, BarChart2, Activity, Edit3, 
  AlertCircle, PhoneCall, CheckCircle2, FileText, Plus
} from "lucide-react";

// 2. CHARTS LIBRARY
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid
} from "recharts";

const ProctorStudents = () => {
  const [students, setStudents] = useState([]);
  const [tasks, setTasks] = useState([]); // ✅ State for live tasks
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState(null); 
  const [activeTab, setActiveTab] = useState("summary");
  const [showingPhoneFor, setShowingPhoneFor] = useState(null); 

  // ✅ States for adding a new task
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/proctor/students", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(res.data.students || []);
      setTasks(res.data.tasks || []); // Load tasks from backend
    } catch (err) {
      console.error("Error loading dashboard data", err);
      setStudents([]); 
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handler: Add a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("http://localhost:5000/api/proctor/tasks", {
        title: newTaskTitle
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Add new task to the top of the list
      setTasks([res.data, ...tasks]);
      setNewTaskTitle("");
      setIsAddingTask(false);
    } catch (err) {
      console.error("Failed to add task:", err);
    }
  };

  // ✅ Handler: Toggle task completion
  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      // Optimistically update UI
      setTasks(tasks.map(t => t.task_id === taskId ? { ...t, is_completed: !currentStatus } : t));

      const token = localStorage.getItem("token");
      await axios.patch(`http://localhost:5000/api/proctor/tasks/${taskId}`, {
        is_completed: !currentStatus
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to toggle task:", err);
      // Revert if failed
      setTasks(tasks.map(t => t.task_id === taskId ? { ...t, is_completed: currentStatus } : t));
    }
  };

  // 📊 MAIN STATS
  const stats = useMemo(() => {
    const total = students.length;
    if (total === 0) return { total: 0, avgSGPA: "0.00", avgCGPA: "0.00" };

    let totalCGPA = 0;
    let count = 0;

    students.forEach((student) => {
      const scores = student.student_academic_scores || [];
      if (scores.length > 0) {
        const totalPoints = scores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks) || 0), 0);
        let valCGPA = totalPoints / scores.length;
        if (valCGPA > 10) valCGPA = valCGPA / 10;
        totalCGPA += valCGPA;
        count++;
      }
    });

    return { 
      total, 
      avgCGPA: count ? (totalCGPA / count).toFixed(2) : "0.00",
      avgSGPA: count ? (totalCGPA / count).toFixed(2) : "0.00" 
    };
  }, [students]);

  // 🚨 NEEDS ATTENTION ROSTER
  const atRiskStudents = useMemo(() => {
    return students.filter(s => {
       let lowAttendance = false;
       if (s.student_attendances?.length > 0) {
          const latestAtt = [...s.student_attendances].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
          if (parseFloat(latestAtt.attendance_percentage) < 75) lowAttendance = true;
       }

       let lowGpa = false;
       let hasBacklogs = false;
       let backlogCount = 0;

       const scores = s.student_academic_scores || [];
       if (scores.length > 0) {
           const total = scores.reduce((sum, sc) => sum + (parseFloat(sc.grade_points || sc.total_marks) || 0), 0);
           let gpa = total / scores.length;
           if (gpa > 10) gpa = gpa / 10;
           if (gpa < 6.0) lowGpa = true;

           scores.forEach(sc => {
               let scoreVal = parseFloat(sc.grade_points || sc.total_marks) || 0;
               if (scoreVal > 10) scoreVal = scoreVal / 10; 
               if (scoreVal < 5.0) {
                   hasBacklogs = true;
                   backlogCount++;
               }
           });
       }

       s.riskReasons = [];
       if (lowAttendance) s.riskReasons.push("Low Attendance");
       if (lowGpa) s.riskReasons.push("Low GPA");
       if (hasBacklogs) s.riskReasons.push(`${backlogCount} Backlog${backlogCount > 1 ? 's' : ''}`);

       return lowAttendance || lowGpa || hasBacklogs;
    });
  }, [students]);

  // 📈 DASHBOARD CHARTS DATA
  const chartData = useMemo(() => {
    let cgpaBuckets = { struggle: 0, average: 0, good: 0, excellent: 0 };
    let sgpaBuckets = { struggle: 0, average: 0, good: 0, excellent: 0 };

    students.forEach(student => {
      const scores = student.student_academic_scores || [];
      if (!scores.length) return;

      const totalPoints = scores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks) || 0), 0);
      let valCGPA = totalPoints / scores.length;
      if (valCGPA > 10) valCGPA = valCGPA / 10;

      const maxSem = Math.max(...scores.map(s => s.semester || 0));
      const latestScores = scores.filter(s => s.semester === maxSem);
      const latestTotal = latestScores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.total_marks) || 0), 0);
      let valSGPA = latestScores.length ? (latestTotal / latestScores.length) : 0;
      if (valSGPA > 10) valSGPA = valSGPA / 10;

      if (valCGPA < 6.0) cgpaBuckets.struggle++;
      else if (valCGPA < 7.5) cgpaBuckets.average++;
      else if (valCGPA < 9.0) cgpaBuckets.good++;
      else cgpaBuckets.excellent++;

      if (valSGPA < 6.0) sgpaBuckets.struggle++;
      else if (valSGPA < 7.5) sgpaBuckets.average++;
      else if (valSGPA < 9.0) sgpaBuckets.good++;
      else sgpaBuckets.excellent++;
    });

    return {
      cgpaPie: [
        { name: "Struggling (<6.0)", value: cgpaBuckets.struggle, color: "#ef4444" },
        { name: "Average (6.0-7.5)", value: cgpaBuckets.average, color: "#f59e0b" },
        { name: "Good (7.5-9.0)", value: cgpaBuckets.good, color: "#3b82f6" },
        { name: "Excellent (9.0+)", value: cgpaBuckets.excellent, color: "#10b981" }
      ],
      sgpaBar: [
        { name: "< 6.0", count: sgpaBuckets.struggle },
        { name: "6.0 - 7.5", count: sgpaBuckets.average },
        { name: "7.5 - 9.0", count: sgpaBuckets.good },
        { name: "9.0 +", count: sgpaBuckets.excellent },
      ]
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
        
        {/* 🚀 TAB 1: SUMMARY */}
        {activeTab === "summary" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
              
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SummaryCard title="Total Students" value={stats.total} icon={<Users size={24} />} color="text-indigo-500" />
                <SummaryCard title="Class Avg SGPA" value={stats.avgSGPA} icon={<Activity size={24} />} color="text-emerald-500" />
                <SummaryCard title="Class Avg CGPA" value={stats.avgCGPA} icon={<GraduationCap size={24} />} color="text-amber-500" />
              </div>

              {/* Action Center */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                 
                 {/* 📌 Left Column: Mentoring Tasks & Notes (Live) */}
                 <div className="lg:col-span-3 p-6 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-500">
                          <FileText size={16} /> Mentoring Tasks
                       </h3>
                       <button 
                          onClick={() => setIsAddingTask(!isAddingTask)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg hover:bg-indigo-100 transition-colors uppercase tracking-wider"
                       >
                          {isAddingTask ? <X size={12}/> : <Plus size={12}/>} 
                          {isAddingTask ? 'Cancel' : 'New Task'}
                       </button>
                    </div>

                    {/* Add Task Form */}
                    {isAddingTask && (
                      <form onSubmit={handleAddTask} className="mb-4 p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 flex gap-2 animate-in fade-in slide-in-from-top-2">
                        <input 
                          type="text" 
                          autoFocus
                          placeholder="e.g. Call Rahul's father regarding attendance..." 
                          className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder-indigo-300"
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                        />
                        <button type="submit" className="p-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                           <Save size={14} />
                        </button>
                      </form>
                    )}

                    {/* Live Task List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {tasks.length === 0 ? (
                          <div className="p-8 text-center text-slate-400 italic text-sm">No pending tasks. You're all caught up!</div>
                       ) : (
                          tasks.map(task => (
                             <div key={task.task_id} className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex gap-3 items-start transition-opacity ${task.is_completed ? 'opacity-50' : ''}`}>
                                <input 
                                   type="checkbox" 
                                   checked={task.is_completed}
                                   onChange={() => handleToggleTask(task.task_id, task.is_completed)}
                                   className="mt-1 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" 
                                />
                                <div>
                                   <p className={`font-bold text-sm ${task.is_completed ? 'text-slate-500 line-through dark:text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                      {task.title}
                                   </p>
                                   <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">
                                      {task.is_completed ? 'Completed' : 'Task'} • {new Date(task.createdAt).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                          ))
                       )}
                    </div>
                 </div>

                 {/* 🚨 Right Column: Needs Attention */}
                 <div className="lg:col-span-2 p-6 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20">
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-rose-500 mb-6">
                       <AlertCircle size={16} /> Needs Attention
                    </h3>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                       {atRiskStudents.length === 0 ? (
                           <div className="p-8 text-center text-slate-400 italic text-sm">🎉 All students are performing well.</div>
                       ) : (
                          atRiskStudents.map(s => (
                             <div key={s.student_id} className="flex justify-between items-center p-3 rounded-xl bg-white dark:bg-slate-800 border border-rose-100 shadow-sm hover:border-rose-300 transition-colors">
                                <div>
                                   <p className="font-bold text-sm text-slate-700 dark:text-slate-200">{s.full_name}</p>
                                   <div className="flex gap-1 mt-1 flex-wrap">
                                      {s.riskReasons.map((reason, i) => (
                                         <span key={i} className="px-1.5 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black uppercase rounded">{reason}</span>
                                      ))}
                                   </div>
                                </div>
                                <button 
                                   onClick={(e) => {
                                      e.stopPropagation();
                                      setShowingPhoneFor(showingPhoneFor === s.student_id ? null : s.student_id);
                                   }}
                                   className={`flex items-center justify-center p-2 text-slate-400 hover:text-indigo-500 bg-slate-50 hover:bg-indigo-50 rounded-lg transition-all duration-300 ${showingPhoneFor === s.student_id ? 'px-3 w-32' : 'w-8'}`}
                                   title="Show Contact"
                                >
                                   {showingPhoneFor === s.student_id ? (
                                      <span className="text-xs font-bold text-indigo-600 truncate">
                                         {s.student_personal_info?.phone_number || s.student_personal_info?.father_phone || "No Number"}
                                      </span>
                                   ) : (
                                      <PhoneCall size={14} />
                                   )}
                                </button>
                             </div>
                          ))
                       )}
                    </div>
                 </div>

              </div>
          </div>
        )}

        {/* TAB 2: STUDENT LIST */}
        {activeTab === "list" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
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

        {/* TAB 3: CHARTS */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4">
            
            <div className="p-6 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
                <PieIcon size={16} /> Overall CGPA Distribution
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartData.cgpaPie} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {chartData.cgpaPie.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-6 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20">
               <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-500 mb-6">
                <BarChart2 size={16} /> Current Sem SGPA Performance
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.sgpaBar}>
                    <XAxis dataKey="name" tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <YAxis tick={{fontSize: 10, fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      {selectedStudentId && (
        <StudentEditModal 
          studentId={selectedStudentId} 
          onClose={() => setSelectedStudentId(null)} 
          refreshList={fetchStudents}
        />
      )}

    </div>
  );
};

// --------------------------------------------------------------------------
// 🔹 STUDENT EDIT MODAL
// --------------------------------------------------------------------------
const StudentEditModal = ({ studentId, onClose, refreshList }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:5000/api/proctor/students/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setDetails(res.data);
        setFormData({
          full_name: res.data.full_name,
          department: res.data.department,
          year_group: res.data.year,
          admission_type: "Management",
          phone_number: res.data.phone,
          college_email: res.data.email,
          father_name: res.data.father_name,
          father_phone: res.data.phone, 
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

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:5000/api/proctor/students/${studentId}`, {
        ...formData,
        personal_info: {
          phone_number: formData.phone_number,
          college_email: formData.college_email,
          father_name: formData.father_name,
          father_phone: formData.father_phone,
          address: formData.address
        }
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setIsEditing(false);
      refreshList();
      setDetails(prev => ({ ...prev, ...formData }));
    } catch (err) {
      alert("Failed to update student.");
    } finally {
      setSaving(false);
    }
  };

  const calculateCGPA = () => {
    if (!details?.academic_scores?.length) return "N/A";
    const total = details.academic_scores.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.marks) || 0), 0);
    let avg = total / details.academic_scores.length;
    if (avg > 10) avg = avg / 10;
    return avg.toFixed(2);
  };

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
      const total = subjects.reduce((sum, s) => sum + (parseFloat(s.grade_points || s.marks) || 0), 0);
      let sgpa = total / subjects.length;
      if (sgpa > 10) sgpa = sgpa / 10;
      const backlogs = subjects.filter(s => (parseFloat(s.grade_points || s.marks) || 0) < 5).length;
      return { sem: `Sem ${sem}`, sgpa: parseFloat(sgpa.toFixed(2)), backlogs };
    }).sort((a,b) => a.sem.localeCompare(b.sem)); 
  }, [details]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-full bg-white dark:bg-slate-900 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300 border-l border-slate-100 dark:border-slate-800">
        
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white">Student Profile</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{isEditing ? "Editing Details" : "360° Academic View"}</p>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white font-bold text-xs uppercase hover:bg-indigo-700 transition-colors">
                <Edit3 size={16} /> Edit
              </button>
            ) : (
              <div className="flex gap-2">
                 <button onClick={() => setIsEditing(false)} className="px-4 py-2 rounded-lg text-slate-500 font-bold text-xs uppercase hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" disabled={saving}>Cancel</button>
                <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold text-xs uppercase hover:bg-emerald-600 transition-colors" disabled={saving}>{saving ? "Saving..." : <><Save size={16} /> Save</>}</button>
              </div>
            )}
            <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><X size={24} className="text-slate-400" /></button>
          </div>
        </div>

        {loading ? <div className="flex justify-center items-center h-64 text-slate-400 font-bold italic">Loading...</div> : !details ? <div className="text-red-500">Error.</div> : (
          <div className="space-y-8">
            
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

            <div>
               <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4"><Activity size={16} /> Performance Trend</h4>
               <div className="h-48 w-full p-4 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
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
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4"><BookOpen size={16} /> Semester History</h4>
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
            </div>

            <div>
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-800 dark:text-white mb-4"><User size={16} /> Personal Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <EditableRow isEditing={isEditing} icon={<Mail size={14}/>} label="Email" name="college_email" value={isEditing ? formData.college_email : details.email} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<Phone size={14}/>} label="Phone" name="phone_number" value={isEditing ? formData.phone_number : details.phone} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<User size={14}/>} label="Father" name="father_name" value={isEditing ? formData.father_name : details.father_name} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<Phone size={14}/>} label="Father's Phone" name="father_phone" value={isEditing ? formData.father_phone : details.father_phone} onChange={handleChange} />
                <EditableRow isEditing={isEditing} icon={<MapPin size={14}/>} label="Address" name="address" value={isEditing ? formData.address : details.address} onChange={handleChange} fullWidth />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

const EditableRow = ({ isEditing, icon, label, name, value, onChange, fullWidth }) => (
  <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 ${fullWidth ? 'col-span-2' : ''}`}>
    <div className="flex items-center gap-2 text-slate-400 mb-1">{icon} <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span></div>
    {isEditing ? <input name={name} value={value || ""} onChange={onChange} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded p-1 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-indigo-500"/> : <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{value || "-"}</p>}
  </div>
);

const SummaryCard = ({ title, value, icon, color }) => (
  <div className="p-6 rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 flex items-center justify-between group hover:-translate-y-1 transition-transform">
    <div><p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{title}</p><p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p></div>
    <div className={`p-4 rounded-2xl neu-inset bg-slate-50 dark:bg-slate-900/50 ${color}`}>{icon}</div>
  </div>
);

export default ProctorStudents;