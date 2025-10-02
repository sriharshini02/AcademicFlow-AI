import React, { useState } from 'react';
// CORRECT PATH: Import useAuth hook from App.jsx 
import { useAuth } from '../App.jsx'; 
import { useNavigate } from 'react-router-dom';

// Base URL for your Express backend authentication API
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Simple icon placeholders
const LogInIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg>;
const UserPlusIcon = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" x2="19" y1="8" y2="14"/><line x1="22" x2="16" y1="11" y2="11"/></svg>;


const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    // Combined state for all form fields
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Proctor', // Default role for signup
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Get login function from AuthContext
    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

    // Handler to update formData state (Fixes the input focus issue)
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        const endpoint = isLogin ? 'login' : 'signup';
        const payload = isLogin 
            ? { email: formData.email, password: formData.password }
            : formData; // All fields for signup

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                // Display error message from backend
                setMessage(data.message || (isLogin ? 'Login failed.' : 'Signup failed.'));
                return;
            }

            if (isLogin) {
                // Successful Login: Store token and user data via context
                authLogin(data.accessToken, data.user);
                
                // Redirect user based on their role
                if (data.user.role === 'HOD') {
                    navigate('/hod/dashboard');
                } else if (data.user.role === 'Proctor') {
                    navigate('/proctor/dashboard');
                }
            } else {
                // Successful Signup: Encourage login
                setMessage('Account created successfully! Please log in.');
                setIsLogin(true); // Switch to login form
                // Clear fields for a new login attempt
                setFormData({ ...formData, name: '', password: '' });
            }
        } catch (error) {
            console.error('API Error:', error);
            // Display general network error
            setMessage('Network error or server unreachable. Check if backend is running.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl space-y-8">
                {/* Status Message Display */}
                {message && (
                    <div className={`p-3 text-sm rounded-lg ${message.includes('success') || message.includes('created') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} dark:bg-opacity-20`}>
                        {message}
                    </div>
                )}

                <div className="flex justify-center mb-6">
                    {isLogin ? 
                        <LogInIcon className="text-indigo-600 dark:text-indigo-400 w-8 h-8"/> : 
                        <UserPlusIcon className="text-green-600 dark:text-green-400 w-8 h-8"/>
                    }
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center">
                    {isLogin ? 'Welcome Back!' : 'Create Account'}
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Name Input (Only for Signup) */}
                    {!isLogin && (
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            placeholder="Full Name"
                        />
                    )}

                    {/* Role Selector (Only for Signup) */}
                    {!isLogin && (
                        <select
                            id="role"
                            name="role"
                            required
                            value={formData.role}
                            onChange={handleChange}
                            className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="Proctor">Proctor</option>
                            <option value="HOD">HOD</option>
                        </select>
                    )}
                    
                    {/* Email Input */}
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Email address"
                    />

                    {/* Password Input */}
                    <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        placeholder="Password"
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLogin ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-green-600 hover:bg-green-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition duration-150`}
                    >
                        {loading ? 'Processing...' : isLogin ? <><LogInIcon className="mr-2"/> Sign in</> : <><UserPlusIcon className="mr-2"/> Sign Up</>}
                    </button>
                    
                    <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                        <button type="button" onClick={() => setIsLogin(!isLogin)} className="font-medium text-indigo-600 hover:text-indigo-500 transition duration-150">
                            {isLogin ? "Create one" : "Sign in"}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthForm;