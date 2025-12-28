import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../App";
import { User, Mail, Shield, Calendar, Users, Loader } from "lucide-react";

const ProctorProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/proctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-10 text-slate-400">
      <Loader className="animate-spin mb-2" />
      <span className="text-xs font-bold uppercase tracking-widest">Loading Profile...</span>
    </div>
  );

  if (!profile) return <div className="text-center text-rose-500 font-bold p-6">Profile not found.</div>;

  return (
    <div className="space-y-8">
      {/* Avatar Section */}
      <div className="flex flex-col items-center">
        <div className="w-24 h-24 rounded-full neu-raised bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-indigo-500 mb-4 border-4 border-[var(--body-bg)]">
          {profile.name ? profile.name.charAt(0).toUpperCase() : "P"}
        </div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{profile.name}</h2>
        <span className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 text-[10px] font-black uppercase tracking-widest mt-2 border border-indigo-200 dark:border-indigo-800">
          {profile.role || "Faculty"}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileField 
          icon={<Mail size={16} />} 
          label="Email Address" 
          value={profile.email} 
          fullWidth
        />
        <ProfileField 
          icon={<Users size={16} />} 
          label="Assigned Students" 
          value={`${profile.students?.length || 0} Students`} 
        />
        <ProfileField 
          icon={<Calendar size={16} />} 
          label="Joined On" 
          value={new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} 
        />
      </div>
    </div>
  );
};

// Helper Component for consistent fields
const ProfileField = ({ icon, label, value, fullWidth }) => (
  <div className={`p-4 rounded-xl neu-inset bg-slate-50/50 dark:bg-slate-900/30 border border-white/50 dark:border-white/5 ${fullWidth ? 'col-span-1 md:col-span-2' : ''}`}>
    <div className="flex items-center gap-2 mb-1 text-slate-400">
      {icon}
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-sm font-bold text-slate-700 dark:text-slate-200 pl-6 truncate">
      {value || "—"}
    </div>
  </div>
);

export default ProctorProfile;