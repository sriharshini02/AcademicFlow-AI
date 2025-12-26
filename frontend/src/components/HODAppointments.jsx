import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { CalendarCheck, Clock, CheckCircle, User, MessageSquare, Loader } from "lucide-react";

const HODAppointments = () => {
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

  if (loading) return (
    <div className="flex items-center justify-center p-10 text-slate-400 gap-2">
      <Loader className="animate-spin" /> <span>Syncing Appointments...</span>
    </div>
  );

  const AppointmentCard = ({ visit, type }) => (
    <div className="p-5 rounded-2xl neu-raised dark:bg-white/[0.02] border border-white/10 transition-all hover:scale-[1.01] mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl neu-inset ${type === 'pending' ? 'text-amber-500' : 'text-indigo-500'}`}>
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-bold text-slate-800 dark:text-slate-200">
                {visit.visitor_name} <span className="text-xs font-normal opacity-60">({visit.visitor_role})</span>
              </p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-bold text-slate-500">
                {visit.student?.full_name || "General"}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1.5">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1">
                <Clock size={12} /> {dayjs(type === 'pending' ? visit.check_in_time : visit.scheduled_time).format("DD MMM, HH:mm")}
              </p>
              <p className="text-[11px] font-medium text-slate-500 italic flex items-center gap-1">
                <MessageSquare size={12} /> {visit.purpose}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          {type === 'pending' && (
            <button
              className="flex-1 md:flex-none px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-bold"
              onClick={() => updateStatus(visit.visit_id, "Scheduled", dayjs().add(30, "minute").toISOString())}
            >
              Schedule +30m
            </button>
          )}
          <button
            className="flex-1 md:flex-none px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-xs font-bold"
            onClick={() => handleMarkCompleted(visit)}
          >
            Mark Completed
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Pending List */}
      <div className="p-6 rounded-[1.5rem] neu-raised h-full">
        <div className="flex items-center gap-3 mb-6 px-2 text-amber-600">
          <CalendarCheck size={20} />
          <h3 className="text-lg font-bold uppercase tracking-tight">Pending Appointments</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto no-scrollbar pr-1">
          {pending.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm italic">No pending requests.</p>
          ) : (
            pending.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="pending" />)
          )}
        </div>
      </div>

      {/* Scheduled List */}
      <div className="p-6 rounded-[1.5rem] neu-raised h-full">
        <div className="flex items-center gap-3 mb-6 px-2 text-indigo-600">
          <CheckCircle size={20} />
          <h3 className="text-lg font-bold uppercase tracking-tight">Scheduled Visits</h3>
        </div>
        <div className="max-h-[500px] overflow-y-auto no-scrollbar pr-1">
          {scheduled.length === 0 ? (
            <p className="text-center py-10 text-slate-400 text-sm italic">No visits scheduled.</p>
          ) : (
            scheduled.map((visit) => <AppointmentCard key={visit.visit_id} visit={visit} type="scheduled" />)
          )}
        </div>
      </div>

      {/* Meeting Notes Modal */}
      {showNotesModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 animate-in fade-in duration-300">
          <div className="neu-raised p-8 w-full max-w-md mx-4 dark:bg-slate-900">
            <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white flex items-center gap-2">
              <MessageSquare className="text-indigo-500" /> Interaction Notes
            </h2>
            <div className="p-4 rounded-xl neu-inset mb-6">
              <textarea
                className="w-full bg-transparent border-none outline-none text-sm text-slate-700 dark:text-slate-200 resize-none h-32"
                placeholder="Briefly describe the interaction outcome..."
                value={hodNotes}
                onChange={(e) => setHodNotes(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowNotesModal(false)} className="px-5 py-2.5 rounded-xl neu-raised text-slate-500 font-bold text-xs uppercase hover:text-slate-700">
                Cancel
              </button>
              <button onClick={handleSaveNotes} className="btn-vivid px-6 py-2.5 rounded-xl shadow-xl text-xs font-black">
                SAVE & ARCHIVE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HODAppointments;