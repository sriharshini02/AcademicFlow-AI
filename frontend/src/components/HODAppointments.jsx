import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { CalendarCheck, Clock, CheckCircle, User, MessageSquare, Loader } from "lucide-react";

// Added 'view' prop to allow splitting the component into the two columns
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
  <div className="p-4 rounded-2xl neu-raised dark:bg-white/[0.02] border border-white/10 transition-all hover:scale-[1.01] mb-3">
    <div className="flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg neu-inset ${type === 'pending' ? 'text-amber-500' : 'text-indigo-500'}`}>
            <User size={16} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">
              {visit.visitor_name}
            </p>
            <p className="text-[10px] opacity-60 dark:text-slate-400 mt-1">
              {visit.visitor_role} — {visit.student?.full_name || "General"}
            </p>
          </div>
        </div>
        
        {/* Restored Date and Time Display */}
        <div className="text-right shrink-0">
           <p className="text-[10px] font-black uppercase text-slate-400 flex items-center justify-end gap-1">
              <Clock size={10} /> 
              {dayjs(type === 'pending' ? visit.check_in_time : visit.scheduled_time).format("DD MMM, HH:mm")}
           </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 italic px-1">
        "{visit.purpose}"
      </p>

      <div className="flex gap-2 pt-1">
        {type === 'pending' && (
          <button
            className="flex-1 py-1.5 bg-emerald-500 text-white rounded-lg shadow-md hover:brightness-110 text-[10px] font-bold transition-all"
            onClick={() => updateStatus(visit.visit_id, "Scheduled", dayjs().add(30, "minute").toISOString())}
          >
            Schedule +30m
          </button>
        )}
        <button
          className="flex-1 py-1.5 bg-indigo-600 text-white rounded-lg shadow-md hover:brightness-110 text-[10px] font-bold transition-all"
          onClick={() => handleMarkCompleted(visit)}
        >
          Mark Completed
        </button>
      </div>
    </div>
  </div>
);

  if (loading) return <div className="p-10 text-center text-slate-400 animate-pulse">Syncing...</div>;

  return (
    <>
      {/* Show Pending in the left stack */}
      {view === "left_stack" && (
        <div className="p-6 rounded-[1.5rem] neu-raised h-fit">
          <div className="flex items-center gap-3 mb-5 px-1 text-amber-600">
            <CalendarCheck size={18} />
            <h3 className="text-base font-bold uppercase tracking-tight">Pending Appointments</h3>
          </div>
          {pending.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs italic">No pending requests.</p>
          ) : (
            pending.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="pending" />)
          )}
        </div>
      )}

      {/* Show Scheduled in the right stack */}
      {view === "right_stack" && (
        <div className="p-6 rounded-[1.5rem] neu-raised h-fit">
          <div className="flex items-center gap-3 mb-5 px-1 text-indigo-600">
            <CheckCircle size={18} />
            <h3 className="text-base font-bold uppercase tracking-tight">Scheduled Visits</h3>
          </div>
          {scheduled.length === 0 ? (
            <p className="text-center py-6 text-slate-400 text-xs italic">No scheduled visits.</p>
          ) : (
            scheduled.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="scheduled" />)
          )}
        </div>
      )}

      {/* Modal remains same but scoped inside the fragment */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
          <div className="neu-raised p-8 w-full max-w-md mx-4 dark:bg-slate-900">
            <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={18} /> Interaction Notes
            </h2>
            <div className="p-3 rounded-xl neu-inset mb-5">
              <textarea
                className="w-full bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 h-24"
                placeholder="Brief summary..."
                value={hodNotes}
                onChange={(e) => setHodNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNotesModal(false)} className="text-[10px] font-bold text-slate-400 uppercase">Cancel</button>
              <button onClick={handleSaveNotes} className="btn-vivid px-5 py-2 rounded-xl text-[10px] font-black">SAVE & ARCHIVE</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HODAppointments;