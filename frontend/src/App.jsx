import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './components/AuthForm.jsx';
import DashboardLayout from './components/DashboardLayout.jsx'; // Import the layout component


// Import the new HOD Availability Editor component
import HODAvailabilityEditor from './components/HODAvailabilityEditor.jsx'; 

// --- Placeholder Components (Will be replaced with actual Dashboards) ---
// Define the inner pages of the HOD dashboard
const HODHome = () => 
    <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">Overview</h2>
        {/* The functional editor component */}
        <HODAvailabilityEditor />
        
        {/* Live Visitor Queue Placeholder */}
        <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-100">
            <h3 className="text-xl font-semibold mb-3 text-indigo-600">Live Visitor Queue (Pending)</h3>
            <p className="text-gray-500">Waiting for bot integration and queue component implementation...</p>
        </div>
    </div>;

// The main HOD Dashboard component using the layout
const HODDashboard = () => 
    <DashboardLayout>
        <HODHome />
    </DashboardLayout>
;

const ProctorLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <header className="bg-blue-900 text-white p-4">Proctor Portal</header>
    <div className="flex flex-1">
      <aside className="w-60 bg-blue-100 p-4">
        <ul>
          <li>👩‍🎓 Student Monitoring</li>
          <li>📊 Reports</li>
          <li>⚙️ Settings</li>
        </ul>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  </div>
);

const ProctorDashboard = () => (
  <ProctorLayout>
    <h2 className="text-xl font-bold">Proctor Home Overview</h2>
    {/* More proctor-specific widgets */}
  </ProctorLayout>
);


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
const ProtectedRoute = ({ allowedRoles }) => {
    const { token, user, logout } = useAuth();

    // 1. Check if user is logged in
    if (!token || !user) {
        return <Navigate to="/" replace />;
    }

    // 2. Check if the user's role is allowed for this route
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        logout(); 
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
                        {/* HOD Dashboard route now points to the component wrapped in the layout */}
                        <Route path="/hod/dashboard" element={<HODDashboard />} /> 
                        {/* Define other HOD routes here */}
                    </Route>

                    {/* Proctor Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['Proctor']} />}>
                         {/* Proctor Dashboard route now points to the component wrapped in the layout */}
                        <Route path="/proctor/dashboard" element={<ProctorDashboard />} />
                        {/* Define other Proctor routes here */}
                    </Route>

                    {/* Fallback for 404 - redirects to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
