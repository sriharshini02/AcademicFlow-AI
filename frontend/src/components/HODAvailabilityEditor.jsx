import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MessageSquare, Loader, Save } from 'lucide-react';
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

  // --- Helper: Format Date or string to HH:MM for input/display ---
  const formatTimeForInput = (time) => {
    if (!time) return '';
    const date = typeof time === 'string' ? new Date(`1970-01-01T${time}`) : new Date(time);
    return date.toTimeString().substring(0, 5); // HH:MM
  };

  // --- Fetch HOD Status ---
  const fetchStatus = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const { data } = await axios.get(API_BASE_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Ensure frontend always gets HH:MM string
      setStatus({
        ...data,
        estimated_return_time: data.estimated_return_time
          ? formatTimeForInput(data.estimated_return_time)
          : '',
      });
      setMessage('');
    } catch (error) {
      console.error('Error fetching HOD status:', error);
      setMessage('Failed to load availability status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  // --- Update HOD Status ---
const handleUpdate = async (updateData) => {
  if (!token) return;
  setIsSaving(true);
  setMessage('');

  // Convert HH:MM string to a Date object for backend
  const [hours, minutes] = (updateData.estimated_return_time || '12:00').split(':');
    const now = new Date();
    const returnDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    parseInt(hours, 10),
    parseInt(minutes, 10),
    0,
    0
  ).toISOString();


  const safeData = {
    ...updateData,
    estimated_return_time: returnDate, // Date for backend only
  };

  setStatus(updateData); // keep state as string for rendering

  try {
    await axios.put(API_BASE_URL, safeData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage('Status updated successfully!');
  } catch (error) {
    console.error('Error saving HOD status:', error.response?.data?.message || error.message);
    setMessage('Error: Could not save status.');
  } finally {
    setIsSaving(false);
  }
};


  // --- Toggle Availability ---
  const handleToggle = () => {
  const newState = !status.is_available;
  const updatedStatus = {
    ...status,
    is_available: newState,
    status_message: newState
      ? 'Available for interactions.'
      : status.status_message || 'In a meeting/Unavailable.',
    estimated_return_time: newState ? '12:00' : status.estimated_return_time || '12:00',
  };
  setStatus(updatedStatus);  // optimistic update
  handleUpdate(updatedStatus); // send PUT with latest data
};

  // --- Handle Input Changes ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStatus((prev) => ({ ...prev, [name]: value }));
  };

  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 flex items-center justify-center border rounded-xl bg-white">
        <Loader className="w-5 h-5 animate-spin mr-2" /> Loading Availability...
      </div>
    );

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200 space-y-6">
      {/* Availability Widget */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-lg font-bold mb-2">Current Availability</h3>
        <p>
          Status:{' '}
          <span
            className={`ml-2 font-semibold ${
              status.is_available ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {status.is_available ? 'Available' : 'Unavailable'}
          </span>
        </p>
        {status.status_message && (
          <p className="text-gray-600 mt-1">{status.status_message}</p>
        )}
        {status.estimated_return_time && (
          <p className="text-sm text-gray-500">
            Back at: {status.estimated_return_time}
          </p>
        )}
      </div>

      {message && (
        <div
          className={`p-3 text-sm rounded-lg ${
            message.includes('success')
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Toggle */}
        <div className="col-span-1 border-r md:pr-6 border-gray-100">
          <label className="flex items-center space-x-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={status.is_available}
                onChange={handleToggle}
                disabled={isSaving}
              />
              <div
                className={`block w-14 h-8 rounded-full transition-colors ${
                  status.is_available ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
              <div
                className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${
                  status.is_available ? 'translate-x-full' : 'translate-x-0'
                }`}
              ></div>
            </div>
            <div className="font-medium text-gray-800">
              Status:{' '}
              <span
                className={`font-bold ${
                  status.is_available ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {status.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>
          </label>
        </div>

        {/* Status Message Input */}
        <div className="col-span-1">
          <label
            htmlFor="status_message"
            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
          >
            <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" /> Custom
            Status Message
          </label>
          <textarea
            id="status_message"
            name="status_message"
            value={status.status_message}
            onChange={handleChange}
            className="w-full h-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
            placeholder="e.g., At a faculty meeting, out to lunch..."
          />
        </div>

        {/* Estimated Return Time */}
        <div className="col-span-1">
          <label
            htmlFor="estimated_return_time"
            className="block text-sm font-medium text-gray-700 mb-2 flex items-center"
          >
            <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Est. Return Time
          </label>
          <input
            type="time"
            id="estimated_return_time"
            name="estimated_return_time"
            value={status.estimated_return_time || '12:00'}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            disabled={status.is_available}
          />
          <p className="text-xs text-gray-400 mt-1">
            Only functional when status is UNAVAILABLE.
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-6 border-t pt-4 flex justify-end">
        <button
          onClick={() => handleUpdate(status)}
          disabled={isSaving}
          className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center ${
            isSaving ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {isSaving ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isSaving ? 'Saving...' : 'Save Custom Status'}
        </button>
      </div>
    </div>
  );
};

export default HODAvailabilityEditor;
