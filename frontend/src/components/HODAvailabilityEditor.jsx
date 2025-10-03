import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, MessageSquare, CheckCircle, XCircle, Loader, Save } from 'lucide-react';
import { useAuth } from '../App.jsx';

// Base URL for the HOD API routes
const API_BASE_URL = 'http://localhost:5000/api/hod/availability';

const HODAvailabilityEditor = () => {
    const { user, token } = useAuth();
    const [status, setStatus] = useState({
        is_available: false,
        status_message: 'Loading status...',
        estimated_return_time: '',
    });
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState('');

    // --- Helper function to format time for display ---
    const formatTimeForInput = (isoTime) => {
        // Formats ISO string (e.g., "2025-10-03T18:00:00.000Z") to "18:00" for time input
        if (!isoTime) return '';
        const date = new Date(isoTime);
        return date.toTimeString().substring(0, 5);
    };

    // --- 1. Fetch Current Status (READ) ---
    const fetchStatus = async () => {
        if (!user || !token) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const response = await axios.get(API_BASE_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            // Convert return time to a display format
            const data = response.data;
            data.estimated_return_time = formatTimeForInput(data.estimated_return_time);

            setStatus(data);
            setMessage('');
        } catch (error) {
            console.error("Error fetching HOD status:", error);
            // This is the error seen in your screenshot: it means the API is rejecting the fetch.
            setMessage('Failed to load availability status. (Check backend/DB for HOD entry)');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();
    }, [user, token]); 

    // --- 2. Update Status (WRITE) ---
    const handleUpdate = async (updateData) => {
        setIsSaving(true);
        setMessage('');

        // Merge existing status with new update
        const finalData = { ...status, ...updateData };
        setStatus(finalData); // Optimistic update

        try {
            await axios.put(API_BASE_URL, finalData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setMessage('Status updated successfully!');
        } catch (error) {
            console.error("Error saving HOD status:", error.response?.data?.message || error.message);
            // Revert status on failure (You'll need to fetchStatus() here to truly revert)
            setMessage('Error: Could not save status.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handler for the Availability Toggle Switch
    const handleToggle = () => {
        const newState = !status.is_available;
        let updateData = {
            is_available: newState,
            status_message: newState ? 'Available for interactions.' : 'In a meeting/Unavailable.',
            // Clear return time if available, keep current if unavailable
            estimated_return_time: newState ? '' : status.estimated_return_time 
        };
        handleUpdate(updateData);
    };

    // Handler for updating inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setStatus(prev => ({ ...prev, [name]: value }));
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500 flex items-center justify-center border rounded-xl bg-white"><Loader className="w-5 h-5 animate-spin mr-2" /> Loading Availability...</div>;
    }

    const isUnavailable = !status.is_available;
    const saveButtonDisabled = isSaving; 

    return (
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
            {/* Status Message */}
            {message && (
                <div className={`p-3 mb-4 text-sm rounded-lg ${message.includes('success') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message}
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                
                {/* 1. Availability Toggle (The Status Card) */}
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
                            <div className={`block w-14 h-8 rounded-full transition-colors ${status.is_available ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${status.is_available ? 'translate-x-full' : 'translate-x-0'}`}></div>
                        </div>
                        <div className="font-medium text-gray-800">
                            Status: <span className={`font-bold ${status.is_available ? 'text-green-600' : 'text-red-600'}`}>
                                {status.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
                            </span>
                        </div>
                    </label>
                    <p className="mt-4 text-sm text-gray-500 flex items-start">
                        {status.is_available ? 
                            <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0 mt-0.5" /> : 
                            <XCircle className="w-4 h-4 mr-2 text-red-500 flex-shrink-0 mt-0.5" />
                        }
                        {/* Display the actual message from state */}
                        <span className="font-semibold">{status.status_message}</span>
                    </p>
                </div>

                {/* 2. Status Message Input */}
                <div className="col-span-1">
                    <label htmlFor="status_message" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <MessageSquare className="w-4 h-4 mr-2 text-indigo-500" /> Custom Status Message
                    </label>
                    <textarea
                        id="status_message"
                        name="status_message"
                        value={status.status_message || ''}
                        onChange={handleChange}
                        className="w-full h-16 p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm resize-none"
                        placeholder="e.g., At a faculty meeting, out to lunch..."
                    />
                </div>

                {/* 3. Estimated Return Time */}
                <div className="col-span-1">
                    <label htmlFor="estimated_return_time" className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" /> Est. Return Time
                    </label>
                    <input
                        id="estimated_return_time"
                        name="estimated_return_time"
                        type="time"
                        value={status.estimated_return_time || ''}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        // Disable if HOD is AVAILABLE
                        disabled={!isUnavailable} 
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Only functional when status is UNAVAILABLE.
                    </p>
                </div>
            </div>
            
            {/* Save Button for Inputs */}
            <div className="mt-6 border-t pt-4 flex justify-end">
                <button
                    onClick={() => handleUpdate({ is_available: status.is_available, status_message: status.status_message, estimated_return_time: status.estimated_return_time })} // Send all three fields explicitly
                    disabled={saveButtonDisabled}
                    className={`px-6 py-2 rounded-lg text-white font-medium transition-colors flex items-center ${
                        saveButtonDisabled 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isSaving ? <Loader className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Custom Status'}
                </button>
            </div>
        </div>
    );
};

export default HODAvailabilityEditor;