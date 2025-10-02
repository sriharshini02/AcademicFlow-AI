import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import Components
import AuthForm from './components/AuthForm.jsx';

// --- Placeholder Components (Will be replaced with actual Dashboards) ---
const HODDashboard = () => <div className="p-8 text-white bg-gray-700 min-h-screen">HOD Dashboard: Welcome, {useAuth().user.name}!</div>;
const ProctorDashboard = () => <div className="p-8 text-white bg-gray-800 min-h-screen">Proctor Dashboard: Welcome, {useAuth().user.name}!</div>;

// --- Authentication Context ---
const AuthContext = createContext(null);

// Custom hook to use the AuthContext easily
export const useAuth = () => {
    return useContext(AuthContext);
};

// Provider component to wrap the application and manage state
const AuthProvider = ({ children }) => {
    // Initialize state from localStorage to persist login across refreshes
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);

    // Update localStorage whenever user or token changes
    useEffect(() => {
        if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    }, [token, user]);

    const login = (newToken, userData) => {
        setToken(newToken);
        setUser(userData);
    };

    const logout = () => {
        setToken(null);
        setUser(null);
    };

    const value = { token, user, login, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Protected Route Wrapper ---
// Ensures only logged-in users with the correct role can access the route
const ProtectedRoute = ({ allowedRoles }) => {
    const { token, user, logout } = useAuth();

    // 1. Check if user is logged in
    if (!token || !user) {
        // Not authenticated, redirect to login page
        return <Navigate to="/" replace />;
    }

    // 2. Check if the user's role is allowed for this route
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Log out and redirect if the user tries to access a dashboard they shouldn't
        logout(); 
        // We could redirect to a 403 page, but redirecting to login is safer for this project
        return <Navigate to="/" replace />; 
    }

    // Authentication and authorization successful, render child routes
    return <Outlet />; 
};


// --- Main Application Component ---
const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Routes>
                    {/* Public Route: Login/Signup Form */}
                    <Route path="/" element={<AuthForm />} />

                    {/* HOD Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
                        <Route path="/hod/dashboard" element={<HODDashboard />} />
                        {/* Other HOD routes will go here (e.g., /hod/reports) */}
                    </Route>

                    {/* Proctor Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Proctor']} />}>
                        <Route path="/proctor/dashboard" element={<ProctorDashboard />} />
                        {/* Other Proctor routes will go here (e.g., /proctor/students) */}
                    </Route>

                    {/* Fallback for 404 - redirects to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
