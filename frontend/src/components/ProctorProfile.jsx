import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../App";

const ProctorProfile = () => {
  const { token } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/proctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProfile(res.data);
      } catch (err) {
        console.error("Error fetching profile:", err);
      }
    };
    fetchProfile();
  }, [token]);

  if (!profile) return <p className="text-gray-500">Loading...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">👩‍🏫 Proctor Profile</h2>
      <div className="space-y-3 text-gray-700 dark:text-gray-200">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Role:</strong> {profile.role}</p>
        <p><strong>Joined on:</strong> {new Date(profile.created_at).toLocaleDateString()}</p>
        <p><strong>Assigned Students:</strong> {profile.students?.length || 0}</p>
      </div>
    </div>
  );
};

export default ProctorProfile;
