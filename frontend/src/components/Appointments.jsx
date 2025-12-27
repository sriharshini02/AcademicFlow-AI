import React, { useEffect, useState } from "react";
import axios from "axios";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import "react-big-calendar/lib/css/react-big-calendar.css";
import enUS from "date-fns/locale/en-US";
import { 
  LayoutList, Calendar as CalendarIcon, Clock, CheckCircle, 
  XCircle, AlertCircle, Filter, User, MessageSquare, ArrowRight 
} from "lucide-react";

// --- Calendar Setup ---
const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [filter, setFilter] = useState("All");
  const [viewMode, setViewMode] = useState("list");
  const [selected, setSelected] = useState(null);

  // --- Calendar Control State ---
  const [date, setDate] = useState(new Date());
  const [calView, setCalView] = useState("month");

  // Modal States
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [hodNotes, setHodNotes] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  
  const token = localStorage.getItem("token");

  // --- Fetch Data ---
  const fetchAppointments = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/visit_logs/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAppointments(res.data);
    } catch (err) {
      console.error("Error fetching appointments:", err.message);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  // --- NEW: Auto-Scroll Effect ---
  // This triggers when switching from Calendar -> List with a selected item
  useEffect(() => {
    if (viewMode === "list" && selected) {
      // Small timeout ensures the DOM has finished rendering the list before scrolling
      setTimeout(() => {
        const element = document.getElementById(`visit-${selected.visit_id}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [viewMode, selected]);

  // --- Calendar Data Prep ---
  const calendarEvents = appointments
    .filter(app => app.scheduled_time || app.check_in_time)
    .map(app => {
      const startDate = new Date(app.scheduled_time || app.check_in_time);
      const endDate = new Date(startDate.getTime() + 30 * 60000); 
      return {
        title: `${app.visitor_name} (${app.purpose})`,
        start: startDate,
        end: endDate,
        resource: app,
        status: app.action_taken
      };
    });

  const eventStyleGetter = (event) => {
    let backgroundColor = '#6366f1'; 
    if (event.status === 'Pending') backgroundColor = '#f59e0b'; 
    if (event.status === 'Completed') backgroundColor = '#10b981'; 
    if (event.status === 'Cancelled') backgroundColor = '#ef4444'; 
    return { style: { backgroundColor, borderRadius: '6px', opacity: 0.9, color: 'white', border: '0px', display: 'block', fontSize: '10px', fontWeight: 'bold', padding: '2px 5px' } };
  };

  // --- Filtering & Sorting ---
  const now = new Date();
  const filtered = appointments
    .filter((a) => {
      const scheduledTime = a.scheduled_time ? new Date(a.scheduled_time) : null;
      switch (filter) {
        case "Upcoming": return a.action_taken === "Scheduled" && scheduledTime && scheduledTime > now;
        case "Missed": return a.action_taken === "Scheduled" && scheduledTime && scheduledTime < now;
        case "Pending":
        case "Scheduled":
        case "Completed":
        case "Cancelled": return a.action_taken === filter;
        default: return true;
      }
    })
    .sort((a, b) => {
      const dateA = new Date(a.scheduled_time || a.check_in_time);
      const dateB = new Date(b.scheduled_time || b.check_in_time);
      return filter === "Upcoming" ? dateA - dateB : dateB - dateA;
    });

  const handleAction = async (visit_id, action, hod_notes = null, scheduled_time = null) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visit_logs/${visit_id}/update-status`,
        { action_taken: action, hod_notes, scheduled_time },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAppointments((prev) =>
        prev.map((a) => a.visit_id === visit_id ? { ...a, action_taken: action, scheduled_time, hod_notes } : a)
      );
    } catch (err) { console.error(`Failed to ${action}:`, err.message); }
  };

  const handleMarkCompleted = (visit) => { setSelectedVisit(visit); setShowNotesModal(true); };
  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    await handleAction(selectedVisit.visit_id, "Completed", hodNotes);
    setShowNotesModal(false); setHodNotes("");
  };
  const handleSchedule = (visit) => { setSelectedVisit(visit); setShowScheduleModal(true); };
  const handleConfirmSchedule = async () => {
    if (!scheduleDate || !scheduleTime) return alert("Select date & time");
    const scheduled_time = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    await handleAction(selectedVisit.visit_id, "Scheduled", null, scheduled_time);
    setShowScheduleModal(false); setScheduleDate(""); setScheduleTime("");
  };

  const getTimeBadge = (app) => {
    if (app.action_taken !== "Scheduled" || !app.scheduled_time) return null;
    const scheduled = new Date(app.scheduled_time);
    const diffMinutes = (scheduled - now) / (1000 * 60);
    if (diffMinutes >= -1 && diffMinutes <= 30) return <span className="px-2 py-1 rounded-md bg-amber-100 text-amber-700 font-bold text-[10px] animate-pulse flex items-center gap-1 border border-amber-200"><AlertCircle size={10}/> SOON</span>;
    if (diffMinutes < -1) return <span className="px-2 py-1 rounded-md bg-rose-100 text-rose-600 font-bold text-[10px] flex items-center gap-1 border border-rose-200"><XCircle size={10}/> MISSED</span>;
    return null;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending": return "text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400";
      case "Scheduled": return "text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 dark:text-indigo-400";
      case "Completed": return "text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400";
      case "Cancelled": return "text-rose-600 bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800 dark:text-rose-400";
      default: return "text-slate-500 bg-slate-50 border-slate-200";
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-full flex flex-col">
      {/* 1. Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">Appointments</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Calendar & Requests</p>
        </div>
        
        <div className="flex p-1.5 rounded-xl neu-inset bg-slate-100 dark:bg-slate-900/50">
          <button onClick={() => setViewMode("list")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "list" ? "neu-raised bg-white dark:bg-slate-800 text-indigo-600 shadow-sm transform scale-105" : "text-slate-400 hover:text-slate-600"}`}>
            <LayoutList size={14} /> List
          </button>
          <button onClick={() => setViewMode("calendar")} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300 ${viewMode === "calendar" ? "neu-raised bg-white dark:bg-slate-800 text-indigo-600 shadow-sm transform scale-105" : "text-slate-400 hover:text-slate-600"}`}>
            <CalendarIcon size={14} /> Calendar
          </button>
        </div>
      </div>

      {/* 2. Filters */}
      {viewMode === "list" && (
        <div className="overflow-x-auto pb-2 no-scrollbar flex-shrink-0">
          <div className="flex gap-3 min-w-max">
            {["All", "Upcoming", "Missed", "Pending", "Scheduled", "Completed", "Cancelled"].map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${filter === tab ? "neu-inset text-indigo-500 bg-indigo-50/50 border-indigo-100 dark:bg-indigo-900/20" : "neu-raised text-slate-500 border-transparent hover:text-indigo-400"}`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Main Content */}
      <div className="flex-1 min-h-[500px]">
        {viewMode === "list" ? (
          <div className="space-y-4">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 neu-inset rounded-3xl">
                <Filter size={48} className="opacity-20 mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">No {filter} appointments found</p>
              </div>
            ) : (
              filtered.map((app) => (
                <div 
                  id={`visit-${app.visit_id}`} // --- NEW: Unique ID for scrolling ---
                  key={app.visit_id} 
                  onClick={() => setSelected(selected?.visit_id === app.visit_id ? null : app)} 
                  className={`group relative p-4 rounded-[1.25rem] neu-raised border border-white/40 dark:border-white/5 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden ${selected?.visit_id === app.visit_id ? "ring-2 ring-indigo-500/20" : ""}`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${app.action_taken === 'Pending' ? 'bg-amber-400' : app.action_taken === 'Scheduled' ? 'bg-indigo-500' : app.action_taken === 'Completed' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  
                  <div className="pl-4 flex flex-col md:flex-row items-center gap-4 w-full">
                    
                    {/* Left: Info */}
                    <div className="flex items-center gap-4 flex-1 w-full md:w-auto">
                       <div className="p-3 rounded-xl neu-inset bg-slate-50 dark:bg-slate-900/50 text-slate-400 group-hover:text-indigo-500 transition-colors">
                          <User size={20} />
                       </div>
                       <div className="min-w-0">
                          <h3 className="font-bold text-slate-800 dark:text-white text-sm truncate">{app.purpose}</h3>
                          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                             <span className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Student:</span> 
                             {app.student?.full_name || "Unknown"}
                          </p>
                       </div>
                    </div>

                    {/* Center: Time Context */}
                    <div className="hidden md:flex items-center justify-center gap-6 px-6 py-2 rounded-xl bg-slate-50/50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 min-w-[200px]">
                       <div className="flex flex-col items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Date</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                             <CalendarIcon size={12} className="text-indigo-400" />
                             {new Date(app.scheduled_time || app.check_in_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </div>
                       </div>
                       <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
                       <div className="flex flex-col items-center">
                          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Time</span>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                             <Clock size={12} className="text-indigo-400" />
                             {new Date(app.scheduled_time || app.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}
                          </div>
                       </div>
                    </div>

                    {/* Right: Status */}
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                      {getTimeBadge(app)}
                      <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getStatusColor(app.action_taken)}`}>
                        {app.action_taken}
                      </span>
                      <ArrowRight size={14} className={`text-slate-300 transition-transform duration-300 ${selected?.visit_id === app.visit_id ? 'rotate-90 text-indigo-500' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  {selected?.visit_id === app.visit_id && (
                    <div className="mt-4 pl-4 border-t border-slate-100 dark:border-slate-800 pt-4 animate-in slide-in-from-top-2">
                       {app.hod_notes && (
                         <div className="flex items-start gap-2 bg-indigo-50/50 dark:bg-slate-800/50 p-3 rounded-xl mb-4 border border-indigo-100/50">
                            <MessageSquare size={14} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-slate-600 dark:text-slate-300"><span className="font-bold text-indigo-500 uppercase text-[9px] mr-2">HOD Note:</span>{app.hod_notes}</p>
                         </div>
                       )}
                       <div className="flex flex-wrap gap-3 justify-end">
                          {["Pending", "Scheduled"].includes(app.action_taken) && (
                            <>
                              <button onClick={(e) => { e.stopPropagation(); handleSchedule(app); }} className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm text-[10px] font-black uppercase hover:border-indigo-300 hover:text-indigo-600 transition-all dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">Reschedule</button>
                              <button onClick={(e) => { e.stopPropagation(); handleAction(app.visit_id, "Cancelled"); }} className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-rose-500 shadow-sm text-[10px] font-black uppercase hover:bg-rose-50 hover:border-rose-200 transition-all dark:bg-slate-800 dark:border-slate-700">Cancel</button>
                              <button onClick={(e) => { e.stopPropagation(); handleMarkCompleted(app); }} className="px-6 py-2 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 text-[10px] font-black uppercase hover:bg-indigo-700 transition-all">Mark Complete</button>
                            </>
                          )}
                       </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-6 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20 h-[650px] shadow-inner text-slate-700 dark:text-slate-200">
             <Calendar
               localizer={localizer}
               events={calendarEvents}
               startAccessor="start"
               endAccessor="end"
               style={{ height: "100%" }}
               eventPropGetter={eventStyleGetter}
               date={date}
               onNavigate={setDate} 
               view={calView}
               onView={setCalView}
               onSelectEvent={(event) => {
                 setSelected(event.resource);
                 setViewMode("list");
                 setFilter("All");
               }}
               views={['month', 'week', 'day']}
               messages={{ next: "Next", previous: "Back", today: "Today" }}
             />
          </div>
        )}
      </div>

      {/* --- MODALS (Unchanged) --- */}
      {showScheduleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-sm neu-raised border border-white/20">
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2"><CalendarIcon className="text-indigo-500" /> Schedule</h2>
            <div className="space-y-4">
              <input type="date" className="w-full px-4 py-3 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              <input type="time" className="w-full px-4 py-3 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowScheduleModal(false)} className="flex-1 py-3 rounded-xl neu-raised text-slate-500 font-bold text-xs uppercase">Cancel</button>
              <button onClick={handleConfirmSchedule} className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-black text-xs uppercase shadow-lg">Confirm</button>
            </div>
          </div>
        </div>
      )}

      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-md neu-raised border border-white/20">
            <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-4">Final Notes</h2>
            <textarea className="w-full p-4 rounded-xl neu-inset bg-transparent outline-none text-sm h-32 resize-none" value={hodNotes} onChange={(e) => setHodNotes(e.target.value)} placeholder="Summary..." />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNotesModal(false)} className="flex-1 py-3 rounded-xl neu-raised text-slate-500 font-bold text-xs uppercase">Back</button>
              <button onClick={handleSaveNotes} className="flex-1 py-3 rounded-xl bg-emerald-500 text-white font-black text-xs uppercase shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;