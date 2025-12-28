import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { 
  Users, GraduationCap, CalendarCheck, Plus, 
  Search, Edit3, Award, TrendingUp, LayoutList 
} from "lucide-react";

const ProctorStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("summary"); // Custom Tab State

  useEffect(() => {
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
    fetchStudents();
  }, []);

  // Compute Stats for Summary Tab
  const stats = useMemo(() => {
    const total = students.length;
    // Mock data logic for demo purposes if real fields aren't populated yet
    const avgAtt = 85; 
    const avgGPA = 8.2;
    return { total, avgAtt, avgGPA };
  }, [students]);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header & Tab Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Student Management & Analytics</p>
        </div>

        {/* Neumorphic Segmented Tabs */}
        <div className="flex p-1.5 rounded-xl neu-inset bg-slate-100 dark:bg-slate-900/50 w-full md:w-auto overflow-x-auto no-scrollbar">
          {[
            { id: "summary", icon: <TrendingUp size={14} />, label: "Summary" },
            { id: "list", icon: <LayoutList size={14} />, label: "Student List" },
            { id: "performance", icon: <GraduationCap size={14} />, label: "Performance" },
            { id: "achievements", icon: <Award size={14} />, label: "Achievements" },
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

      {/* 2. Content Views */}
      <div className="min-h-[400px]">
        
        {/* 📊 SUMMARY VIEW */}
        {activeTab === "summary" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4">
            <SummaryCard 
              title="Total Students" 
              value={stats.total} 
              icon={<Users size={24} />} 
              color="text-indigo-500" 
            />
            <SummaryCard 
              title="Avg Attendance" 
              value={`${stats.avgAtt}%`} 
              icon={<CalendarCheck size={24} />} 
              color="text-emerald-500" 
            />
            <SummaryCard 
              title="Class GPA" 
              value={stats.avgGPA} 
              icon={<TrendingUp size={24} />} 
              color="text-amber-500" 
            />
          </div>
        )}

        {/* 🧍‍♂️ LIST VIEW */}
        {activeTab === "list" && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Toolbar */}
            <div className="flex justify-end">
              <button 
                onClick={() => setSelected({})} 
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs uppercase shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                <Plus size={16} /> Add Student
              </button>
            </div>

            {/* Table Container */}
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
                              onClick={() => setSelected(s)}
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

        {/* 📈 PERFORMANCE & ACHIEVEMENTS PLACEHOLDERS */}
        {(activeTab === "performance" || activeTab === "achievements") && (
          <div className="p-10 rounded-[2rem] neu-inset flex flex-col items-center justify-center text-slate-400 gap-4 animate-in fade-in">
             <div className="p-4 rounded-full neu-raised bg-slate-100 dark:bg-slate-800">
               {activeTab === "performance" ? <TrendingUp size={32} /> : <Award size={32} />}
             </div>
             <p className="text-sm font-bold uppercase tracking-widest opacity-60">
               {activeTab === "performance" ? "Academic Charts Coming Soon" : "Student Extracurriculars"}
             </p>
          </div>
        )}

      </div>
    </div>
  );
};

// Reusable Summary Card Component
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