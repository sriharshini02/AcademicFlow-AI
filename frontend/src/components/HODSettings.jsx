import React, { useState, useEffect } from "react";
import axios from "axios";
import { User, Mail, Phone, Briefcase, Building, Edit3, Save, Lock, Loader, ArrowLeft } from "lucide-react";

const HODSettings = () => {
  const [profile, setProfile] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/hod/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile({
          name: res.data.name || "",
          email: res.data.email || "",
          password: "",
          department: res.data.hod_info?.department || "",
          contact_number: res.data.hod_info?.contact_number || "",
          office_room: res.data.hod_info?.office_room || "",
        });
      } catch (err) {
        console.error("Failed to fetch profile:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put("http://localhost:5000/api/hod/profile", profile, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Profile updated successfully ✅");
      setEditMode(false);
    } catch (err) {
      console.error("Update failed:", err.message);
      alert("Failed to update profile ❌");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
      <Loader className="animate-spin mb-2" />
      <span className="text-xs font-bold uppercase tracking-widest">Syncing Data...</span>
    </div>
  );

  return (
    <div className="w-full">
      {/* NOTE: The parent modal already has a Title and Close (X) button.
         This component now only renders the Profile Card or the Edit Form.
      */}

      {!editMode ? (
        // ---------------- VIEW MODE ----------------
        <div className="space-y-8 animate-in fade-in duration-500">
          
          {/* Avatar & Hero */}
          <div className="flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-full neu-raised bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-5xl font-black text-indigo-500 border-4 border-[var(--body-bg)] shadow-xl mb-4">
              {profile.name ? profile.name[0].toUpperCase() : "H"}
            </div>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
              {profile.name}
            </h3>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">
              {profile.email}
            </p>
            <div className="flex gap-2 mt-3">
              <Badge icon={<Building size={10} />} text={`${profile.department || "General"} Dept`} color="indigo" />
              <Badge icon={<Briefcase size={10} />} text={profile.office_room || "No Office"} color="emerald" />
            </div>
          </div>

          {/* Details Card */}
          <div className="p-6 rounded-[1.5rem] neu-inset bg-slate-50/50 dark:bg-slate-900/30 border border-white/50 dark:border-white/5">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1">Contact Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ViewField icon={<Phone size={16} />} label="Phone" value={profile.contact_number} />
              <ViewField icon={<Mail size={16} />} label="Email" value={profile.email} />
            </div>
          </div>

          {/* Edit Trigger */}
          <button
            onClick={() => setEditMode(true)}
            className="w-full py-4 rounded-xl bg-indigo-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Edit3 size={16} /> Edit Profile
          </button>
        </div>
      ) : (
        // ---------------- EDIT MODE ----------------
        <form
          onSubmit={(e) => { e.preventDefault(); handleSave(); }}
          className="space-y-6 animate-in fade-in slide-in-from-right-8"
        >
          {/* Top Bar: Back Button */}
          <div className="flex items-center gap-2 mb-2">
             <button 
               type="button" 
               onClick={() => setEditMode(false)}
               className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-indigo-500 transition-colors"
             >
               <ArrowLeft size={18} />
             </button>
             <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Editing Profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <EditField label="Full Name" name="name" value={profile.name} onChange={handleChange} icon={<User size={16} />} />
            <EditField label="Email" name="email" value={profile.email} onChange={handleChange} icon={<Mail size={16} />} />
            <EditField label="Contact No" name="contact_number" value={profile.contact_number} onChange={handleChange} icon={<Phone size={16} />} />
            <EditField label="Office Room" name="office_room" value={profile.office_room} onChange={handleChange} icon={<Briefcase size={16} />} />
            
            {/* Read-Only Department */}
            <div className="md:col-span-2">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 mb-1 block">Department</label>
               <div className="w-full px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 text-sm font-bold flex items-center gap-3 cursor-not-allowed opacity-60">
                  <Building size={16} />
                  {profile.department}
               </div>
            </div>

            {/* Password Section */}
            <div className="md:col-span-2 pt-4 border-t border-slate-100 dark:border-slate-800">
               <EditField 
                  label="New Password" 
                  name="password" 
                  type="password"
                  value={profile.password} 
                  onChange={handleChange} 
                  icon={<Lock size={16} />}
                  placeholder="Leave blank to keep current password"
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {saving ? <Loader className="animate-spin" size={16} /> : <Save size={16} />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      )}
    </div>
  );
};

// --- Sub Components ---

const Badge = ({ icon, text, color }) => (
  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest bg-${color}-50 dark:bg-${color}-900/20 text-${color}-600 dark:text-${color}-400 border border-${color}-100 dark:border-${color}-800`}>
    {icon} {text}
  </span>
);

const ViewField = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 shadow-sm">
    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-400">{icon}</div>
    <div className="overflow-hidden">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value || "—"}</p>
    </div>
  </div>
);

const EditField = ({ label, name, value, onChange, icon, type = "text", placeholder }) => (
  <div className="space-y-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 rounded-xl neu-inset bg-transparent outline-none text-sm font-bold text-slate-700 dark:text-white transition-all focus:ring-2 focus:ring-indigo-500/10 placeholder-slate-400/50"
      />
    </div>
  </div>
);

export default HODSettings;