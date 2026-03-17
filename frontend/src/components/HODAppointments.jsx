import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { CalendarCheck, Clock, CheckCircle, User, MessageSquare, Phone } from "lucide-react"; // ✅ Added Phone Icon

const HODAppointments = ({ view }) => {
  const [pending, setPending] = useState([]);
  const [scheduled, setScheduled] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [hodNotes, setHodNotes] = useState("");

  const token = localStorage.getItem("token");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const [pendingRes, scheduledRes] = await Promise.all([
        axios.get("http://localhost:5000/api/visit_logs/pending", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://localhost:5000/api/visit_logs/scheduled", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setPending(pendingRes.data);
      setScheduled(scheduledRes.data);
    } catch (err) {
      console.error("Failed to fetch appointments:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAppointments(); }, []);

  const updateStatus = async (id, action_taken, scheduled_time = null, hod_notes = null) => {
    try {
      await axios.put(
        `http://localhost:5000/api/visit_logs/${id}/update-status`,
        { action_taken, scheduled_time, hod_notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAppointments();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  const handleMarkCompleted = (visit) => {
    setSelectedVisit(visit);
    setShowNotesModal(true);
  };

  const handleSaveNotes = async () => {
    if (!selectedVisit) return;
    await updateStatus(selectedVisit.visit_id, "Completed", null, hodNotes);
    setShowNotesModal(false);
    setHodNotes("");
  };

  const AppointmentCard = ({ visit, type }) => (
    <div className="p-4 rounded-2xl neu-raised dark:bg-white/[0.02] border border-white/10 transition-all hover:scale-[1.01] mb-4">
      <div className="flex flex-col gap-4">
        
        {/* Header: Name, Role, Phone, and Time */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 mt-0.5 rounded-xl neu-inset ${type === 'pending' ? 'text-amber-500' : 'text-indigo-500'}`}>
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {visit.visitor_name}
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mt-1.5">
                {/* Role Badge */}
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-500">
                  {visit.visitor_role}
                </span>
                
                {/* Related Student (If any) */}
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {visit.student?.full_name ? `(${visit.student.full_name})` : "(General)"}
                </span>
              </div>

              {/* ✅ NEW: Contact Number Display */}
              {visit.contact_number && (
                <div className="flex items-center gap-1.5 mt-2 text-slate-500 dark:text-slate-400">
                  <Phone size={12} className="text-emerald-500" />
                  <span className="text-xs font-bold tracking-wide">{visit.contact_number}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Time Display */}
          <div className="text-right shrink-0">
            <p className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-end gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700/50">
              <Clock size={10} className={type === 'pending' ? 'text-amber-500' : 'text-indigo-500'} /> 
              {dayjs(type === 'pending' ? visit.check_in_time : visit.scheduled_time).format("DD MMM, HH:mm")}
            </p>
          </div>
        </div>

        {/* Purpose / Reason Box */}
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-60"></div>
          <p className="text-xs text-slate-600 dark:text-slate-300 italic pl-2 leading-relaxed">
            "{visit.purpose}"
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          {type === 'pending' && (
            <button
              className="flex-1 py-2 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-[10px] font-black uppercase tracking-widest transition-all"
              onClick={() => updateStatus(visit.visit_id, "Scheduled", dayjs().add(30, "minute").toISOString())}
            >
              Schedule +30m
            </button>
          )}
          <button
            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl shadow-md shadow-indigo-500/20 hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest transition-all"
            onClick={() => handleMarkCompleted(visit)}
          >
            Mark Completed
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse font-bold tracking-widest uppercase text-xs">Syncing Queue...</div>;

  return (
    <>
      {/* Show Pending in the left stack */}
      {view === "left_stack" && (
        <div className="p-6 rounded-[1.5rem] neu-raised h-fit border border-white/20">
          <div className="flex items-center gap-3 mb-6 px-1 text-amber-500">
            <CalendarCheck size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest">Pending Appointments</h3>
          </div>
          {pending.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No pending requests.</p>
          ) : (
            <div className="space-y-2">
              {pending.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="pending" />)}
            </div>
          )}
        </div>
      )}

      {/* Show Scheduled in the right stack */}
      {view === "right_stack" && (
        <div className="p-6 rounded-[1.5rem] neu-raised h-fit border border-white/20">
          <div className="flex items-center gap-3 mb-6 px-1 text-indigo-500">
            <CheckCircle size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest">Scheduled Visits</h3>
          </div>
          {scheduled.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-xs font-bold uppercase tracking-widest border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">No scheduled visits.</p>
          ) : (
            <div className="space-y-2">
              {scheduled.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="scheduled" />)}
            </div>
          )}
        </div>
      )}

      {/* Interaction Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-md z-50 animate-in fade-in duration-200">
          <div className="neu-raised p-8 w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-[2rem] border border-white/20 shadow-2xl">
            <h2 className="text-base font-black mb-5 text-slate-800 dark:text-white uppercase tracking-widest flex items-center gap-3">
              <MessageSquare className="text-indigo-500" size={20} /> Interaction Notes
            </h2>
            <div className="p-1 rounded-2xl neu-inset mb-6 bg-slate-50 dark:bg-slate-900/50">
              <textarea
                className="w-full bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 h-28 p-4 resize-none font-medium"
                placeholder="Brief summary of the discussion..."
                value={hodNotes}
                onChange={(e) => setHodNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-4">
              <button onClick={() => setShowNotesModal(false)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors px-2">Cancel</button>
              <button onClick={handleSaveNotes} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 transition-all">
                Save & Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HODAppointments;