import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Shield, Building, Phone, DoorOpen, Loader } from 'lucide-react';

const HODProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hod/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        // Accessing data according to your controller structure
        setProfile(res.data);
      } catch (err) {
        console.error("Profile fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-4">
      <Loader className="animate-spin" size={32} />
      <span className="font-bold tracking-widest uppercase text-xs">Syncing HOD Identity...</span>
    </div>
  );

  // Safely extract nested data from hod_info alias in your controller
  const info = profile?.hod_info || {};

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-8 rounded-[2rem] neu-raised border border-white/20 dark:border-slate-800/50 bg-white dark:bg-slate-900/50">
        
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-slate-100 dark:border-slate-800 pb-12">
          <div className="p-1 rounded-full bg-gradient-to-tr from-cyan-400 to-indigo-600 shadow-xl">
            <div className="h-32 w-32 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-indigo-500">
              <User size={64} strokeWidth={1.5} />
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight mb-2 uppercase">
              {profile?.name}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <span className="px-4 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-800">
                {profile?.role}
              </span>
              <span className="px-4 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-800">
                Verified Account
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid - Real data from HODInfo model */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard 
            icon={<Mail className="text-cyan-500" />} 
            label="Official Email" 
            value={profile?.email} 
          />
          <InfoCard 
            icon={<Building className="text-indigo-500" />} 
            label="Department" 
            value={info.department} 
          />
          <InfoCard 
            icon={<DoorOpen className="text-amber-500" />} 
            label="Office Location" 
            value={info.office_room ? ` ${info.office_room}` : "Not Assigned"} 
          />
          <InfoCard 
            icon={<Phone className="text-rose-500" />} 
            label="Contact Number" 
            value={info.contact_number} 
          />
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value }) => (
  <div className="p-6 rounded-2xl neu-inset bg-slate-50/50 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 flex items-center gap-5">
    <div className="p-3 rounded-xl neu-raised bg-white dark:bg-slate-800 shadow-sm transition-transform hover:scale-110">
      {icon}
    </div>
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value || "N/A"}</p>
    </div>
  </div>
);

export default HODProfile;