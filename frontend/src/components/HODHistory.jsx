import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, History, User, Clock, MessageSquare, Calendar } from "lucide-react";

const HODHistory = () => {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get(
          "http://localhost:5000/api/visit_logs/history",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        // Only keep "Completed" logs as per your logic
        setHistory(res.data.filter((log) => log.action_taken === "Completed"));
      } catch (err) {
        console.error("Failed to fetch history:", err.message);
      }
    };
    fetchHistory();
  }, [token]);

  // Filtered by search (student, visitor, purpose)
  const filteredHistory = history.filter(
    (log) =>
      log.student?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
      log.purpose.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">
             Archive of Completed Interactions
          </p>
        </div>

        {/* Neumorphic Search Bar */}
        <div className="relative group w-full md:w-80">
           <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
           </div>
           <input
             type="text"
             placeholder="Search by student, visitor, or purpose..."
             className="w-full pl-12 pr-4 py-3 rounded-2xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white placeholder-slate-400/70 transition-all"
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
      </div>

      {/* 2. Timeline View */}
      {filteredHistory.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 neu-inset rounded-[2rem]">
           <History size={48} className="opacity-20 mb-4" />
           <p className="text-sm font-bold uppercase tracking-widest opacity-60">No history records found.</p>
        </div>
      ) : (
        <div className="relative pl-4 md:pl-8 border-l-2 border-slate-200 dark:border-slate-800 space-y-8">
          {filteredHistory.map((log) => (
            <div key={log.visit_id} className="relative group">
              
              {/* Timeline Dot */}
              <span className="absolute -left-[25px] md:-left-[41px] top-6 w-5 h-5 rounded-full bg-indigo-500 border-4 border-[var(--body-bg)] shadow-md group-hover:scale-125 transition-transform duration-300 z-10"></span>

              {/* History Card */}
              <div className="p-6 rounded-[1.5rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                
                {/* Card Header: Purpose & Date */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                   <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">
                      {log.purpose}
                   </h3>
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 px-3 py-1.5 rounded-lg">
                      <Calendar size={12} />
                      {new Date(log.check_in_time).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* Left Column: People */}
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg neu-inset bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500">
                            <User size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Student</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{log.student?.full_name || "N/A"}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg neu-inset bg-amber-50 dark:bg-amber-900/20 text-amber-500">
                            <User size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Visitor</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                               {log.visitor_name} <span className="text-xs font-normal opacity-60">({log.visitor_role})</span>
                            </p>
                         </div>
                      </div>
                   </div>

                   {/* Right Column: Time & Notes */}
                   <div className="space-y-3">
                      <div className="flex items-center gap-3">
                         <div className="p-2 rounded-lg neu-inset bg-emerald-50 dark:bg-emerald-900/20 text-emerald-500">
                            <Clock size={16} />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Duration</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 font-mono">
                               {new Date(log.check_in_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - 
                               {log.end_time ? new Date(log.end_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : " ..."}
                            </p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Footer: HOD Notes */}
                {log.hod_notes && (
                   <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-1">
                      <div className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-100 dark:border-slate-700/50">
                         <MessageSquare size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Session Outcome</p>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 italic">"{log.hod_notes}"</p>
                         </div>
                      </div>
                   </div>
                )}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HODHistory;