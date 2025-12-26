import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MessageSquare, Loader, Save, Power } from 'lucide-react';
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

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold italic">Initialising...</div>;

  return (
    /* h-fit prevents the card from stretching vertically to match the Task Queue */
    <div className="academic-status-card rounded-[1.5rem] p-5 h-fit w-full max-w-md flex flex-col border border-white/10 shadow-2xl transition-all self-start">
      
      {/* 1. Header: Fixed Toggle Animation */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl bg-white/10 ${status.is_available ? 'text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'text-rose-400'}`}>
            <Power size={18} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-[9px] font-black uppercase tracking-widest text-cyan-300 opacity-60">Status</h3>
            <p className="text-sm font-black text-white leading-none tracking-tight">
              {status.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
            </p>
          </div>
        </div>
        
        {/* Toggle Switch with fixed translation logic */}
        <button 
          onClick={handleToggle} 
          className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative shadow-inner shrink-0 ${status.is_available ? 'bg-cyan-500/20' : 'bg-rose-500/20'}`}
        >
          <div className={`h-4 w-4 rounded-full shadow-lg transition-all duration-300 transform ${status.is_available ? 'translate-x-5 bg-cyan-400' : 'translate-x-0 bg-rose-500'}`} />
        </button>
      </div>

      {/* 2. Optimized Fields */}
      <div className="space-y-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
            <MessageSquare size={10} className="text-cyan-400" /> Message
          </label>
          <textarea 
            name="status_message" value={status.status_message} 
            onChange={(e) => setStatus({...status, status_message: e.target.value})}
            className="w-full h-10 bg-transparent border-none outline-none text-sm font-bold text-white placeholder-slate-500 resize-none leading-snug brightness-125"
            placeholder="System status..."
          />
        </div>

        {!status.is_available && (
          <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-3/5 animate-in slide-in-from-top-1 duration-300">
            <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5 mb-1">
              <Clock size={10} className="text-indigo-400" /> Return
            </label>
            <input 
              type="time" name="estimated_return_time" value={status.estimated_return_time}
              onChange={(e) => setStatus({...status, estimated_return_time: e.target.value})}
              className="w-full bg-transparent border-none outline-none text-[11px] font-bold text-white cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* 3. Footer: Brighter Success Label */}
      <div className="mt-4 flex flex-col items-center gap-3">
        <button 
          onClick={() => handleUpdate(status)}
          disabled={isSaving}
          className="btn-vivid w-2/3 py-2 rounded-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-transform"
        >
          {isSaving ? <Loader className="animate-spin" size={12} /> : <Save size={12} />}
          <span className="text-[9px] font-black tracking-widest uppercase">Save Status</span>
        </button>

        {message && (
          <p className="text-center text-[12px] font-black text-emerald-400 uppercase tracking-tighter animate-pulse drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default HODAvailabilityEditor;