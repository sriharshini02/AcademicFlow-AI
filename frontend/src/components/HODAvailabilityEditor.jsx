import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MessageSquare, Loader, Save, Power, BellRing } from 'lucide-react';
import { useAuth } from '../App.jsx';

const API_BASE_URL = 'http://localhost:5000/api/hod/availability';

const HODAvailabilityEditor = () => {
  const { token } = useAuth();
  const [status, setStatus] = useState({
    is_available: false,
    status_message: '',
    estimated_return_time: '',
  });
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // --- Restored: Helper to format ISO time for <input type="time"> ---
  const formatTimeForInput = (time) => {
    if (!time) return '';
    const date = new Date(time);
    if (isNaN(date.getTime())) return ''; 
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const fetchStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus({
        ...data,
        estimated_return_time: data.estimated_return_time ? formatTimeForInput(data.estimated_return_time) : '',
      });
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  useEffect(() => { fetchStatus(); }, [token]);

  const handleUpdate = async (updateData) => {
    if (!token) return;
    setIsSaving(true);
    let safeTime = updateData.estimated_return_time || '12:00';
    const [hours, minutes] = safeTime.split(':').map(Number);
    const localDate = new Date();
    localDate.setHours(hours, minutes, 0, 0);

    try {
      await axios.put(API_BASE_URL, { ...updateData, estimated_return_time: localDate.toISOString() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage('Status Synced Successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) { setMessage('Error saving status'); } finally { setIsSaving(false); }
  };

  const handleToggle = () => {
    const newState = !status.is_available;
    const updated = { ...status, is_available: newState };
    setStatus(updated);
    handleUpdate(updated);
  };

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold">Initializing Availability...</div>;

  return (
    <div className="academic-status-card rounded-[2rem] p-8 flex flex-col lg:flex-row gap-8 items-center border border-white/10">
      
      {/* 1. Availability Status Header */}
      <div className="flex items-center gap-6 min-w-[280px]">
        <div className={`p-4 rounded-2xl bg-white/10 border border-white/10 shadow-inner ${status.is_available ? 'text-cyan-400' : 'text-rose-400'}`}>
          <Power size={32} strokeWidth={3} />
        </div>
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300 opacity-70 mb-1">Availability Status</h3>
          <p className="text-2xl font-black text-white tracking-tight">
            Status: {status.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </p>
        </div>
      </div>

      {/* 2. Form Inputs with High Contrast Inset */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1 flex items-center gap-2">
            <MessageSquare size={14} className="text-cyan-400" /> Custom Status Message
          </label>
          <textarea 
            name="status_message" value={status.status_message} 
            onChange={(e) => setStatus({...status, status_message: e.target.value})}
            className="w-full h-20 p-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all resize-none"
            placeholder="Available for interactions..."
          />
        </div>

        <div className="flex flex-col justify-between">
          <div className={`space-y-2 transition-all duration-300 ${status.is_available ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-300 ml-1 flex items-center gap-2">
              <Clock size={14} className="text-indigo-400" /> Est. Return Time
            </label>
            <input 
              type="time" name="estimated_return_time" value={status.estimated_return_time}
              onChange={(e) => setStatus({...status, estimated_return_time: e.target.value})}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {/* Toggle and Sync Message Area */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3">
               <button onClick={handleToggle} className="w-14 h-7 rounded-full p-1 bg-white/10 border border-white/5 relative shadow-inner">
                  <div className={`absolute top-1 h-5 w-5 rounded-full shadow-lg transition-all duration-500 ${status.is_available ? 'left-8 bg-cyan-400' : 'left-1 bg-rose-500'}`} />
               </button>
               <span className={`text-[10px] font-black uppercase tracking-widest ${status.is_available ? 'text-cyan-400' : 'text-rose-400'}`}>
                 {status.is_available ? 'Interaction Active' : 'Do Not Disturb'}
               </span>
            </div>
            {message && <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter animate-pulse">{message}</span>}
          </div>
        </div>
      </div>

      {/* 3. Primary Action Button */}
      <button 
        onClick={() => handleUpdate(status)}
        disabled={isSaving}
        className="btn-vivid px-6 py-10 rounded-3xl flex flex-col items-center justify-center gap-3 min-w-[150px]"
      >
        {isSaving ? <Loader className="animate-spin" /> : <Save size={24} />}
        <span className="text-[10px] text-center">Save Custom Status</span>
      </button>
    </div>
  );
};

export default HODAvailabilityEditor;