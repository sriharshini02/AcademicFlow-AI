import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, CalendarCheck, TrendingUp, AlertTriangle, Loader } from "lucide-react";

const ProctorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("http://localhost:5000/api/proctor/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching proctor dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Loading Proctor Analytics...</div>;
  if (!stats) return <div className="p-10 text-center text-rose-500 font-bold">Failed to load dashboard data.</div>;

  const cards = [
    { 
      title: "Assigned Students", 
      value: stats.totalStudents, 
      icon: <Users size={24} />, 
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-900/20"
    },
    { 
      title: "Avg Attendance", 
      value: `${stats.avgAttendance}%`, 
      icon: <CalendarCheck size={24} />, 
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    { 
      title: "Avg Internal Marks", 
      value: `${stats.avgInternal}`, 
      icon: <TrendingUp size={24} />, 
      color: "text-indigo-500",
      bg: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    { 
      title: "Action Required", 
      value: stats.lowPerformance, 
      label: "Low Performers",
      icon: <AlertTriangle size={24} />, 
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-900/20"
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      
      {/* 1. Header */}
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring & Performance Metrics</p>
      </div>

      {/* 2. Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="p-6 rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 flex flex-col justify-between h-32 group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                  {card.label || card.title}
                </h3>
                <p className={`text-3xl font-black ${card.color} tracking-tighter`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl neu-inset ${card.bg} ${card.color} transition-colors`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 3. Student Table */}
      <div className="rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
           <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight flex items-center gap-2">
             <Users className="text-slate-400" size={20} /> Assigned Students
           </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="p-5">Roll No</th>
                <th className="p-5">Name</th>
                <th className="p-5">Year</th>
                <th className="p-5">Department</th>
                <th className="p-5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-600 dark:text-slate-300 divide-y divide-slate-50 dark:divide-slate-800/50">
              {stats.students.length === 0 ? (
                 <tr>
                   <td colSpan="5" className="p-10 text-center text-slate-400 italic">No students assigned yet.</td>
                 </tr>
              ) : (
                stats.students.map((s) => (
                  <tr key={s.student_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-5 font-bold text-indigo-500">{s.roll_number}</td>
                    <td className="p-5 font-bold text-slate-800 dark:text-white">{s.full_name}</td>
                    <td className="p-5">{s.year_group}</td>
                    <td className="p-5 text-xs uppercase tracking-wider text-slate-500">{s.department}</td>
                    <td className="p-5 text-right">
                       <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-600 border border-emerald-200 uppercase tracking-widest">
                         Active
                       </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProctorDashboard;