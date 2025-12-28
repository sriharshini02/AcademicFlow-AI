import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { User, Mail, Lock, Save, Settings, Loader, CheckCircle, AlertTriangle } from "lucide-react";

const ProctorSettings = () => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/proctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email, password: "" });
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = async () => {
    setSaving(true);
    setStatus({ type: "", msg: "" });
    try {
      await axios.put("http://localhost:5000/api/proctor/settings/update", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus({ type: "success", msg: "Profile updated successfully!" });
      // Clear password field after successful update
      setFormData(prev => ({ ...prev, password: "" }));
      setTimeout(() => setStatus({ type: "", msg: "" }), 3000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setStatus({ type: "error", msg: "Failed to update profile. Try again." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400 font-bold italic animate-pulse">Loading settings...</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-3">
           <Settings className="text-slate-400" /> Account Settings
        </h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 ml-1">Manage Your Profile & Security</p>
      </div>

      {/* Main Settings Card */}
      <div className="p-8 rounded-[2rem] neu-raised bg-white dark:bg-slate-900 border border-white/20">
        
        <div className="space-y-6">
          
          {/* Name Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
            <div className="relative group">
               <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input
                 name="name"
                 value={formData.name}
                 onChange={handleChange}
                 className="w-full pl-12 pr-4 py-3.5 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/10"
                 placeholder="Enter your name"
               />
            </div>
          </div>

          {/* Email Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
            <div className="relative group">
               <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input
                 name="email"
                 type="email"
                 value={formData.email}
                 onChange={handleChange}
                 className="w-full pl-12 pr-4 py-3.5 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/10"
                 placeholder="name@college.edu"
               />
            </div>
          </div>

          <div className="h-px bg-slate-100 dark:bg-slate-800 my-6"></div>

          {/* Password Input */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Password</label>
            <div className="relative group">
               <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={18} />
               <input
                 name="password"
                 type="password"
                 value={formData.password}
                 onChange={handleChange}
                 placeholder="Leave blank to keep current password"
                 className="w-full pl-12 pr-4 py-3.5 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white placeholder-slate-400/50 transition-all focus:ring-2 focus:ring-indigo-500/10"
               />
            </div>
            <p className="text-[10px] text-slate-400 italic ml-1">Minimum 6 characters recommended.</p>
          </div>

          {/* Action Area */}
          <div className="pt-4 flex flex-col items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>

            {/* Status Message */}
            {status.msg && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold animate-in fade-in slide-in-from-bottom-2 ${
                status.type === 'success' 
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-900' 
                  : 'bg-rose-50 text-rose-600 border border-rose-100 dark:bg-rose-900/20 dark:border-rose-900'
              }`}>
                {status.type === 'success' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                {status.msg}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProctorSettings;