import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AuthForm from './components/AuthForm.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import HODToDoList from './components/HODToDoList.jsx';
import HODAppointments from './components/HODAppointments.jsx';
import HODAvailabilityEditor from './components/HODAvailabilityEditor.jsx'; 
import Appointments from "./components/Appointments.jsx";
import HODHistory from "./components/HODHistory.jsx";
import HODStudents from './components/HODStudents.jsx';
// --- Authentication Context ---
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token') || null);

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

    return <AuthContext.Provider value={{ token, user, login, logout }}>{children}</AuthContext.Provider>;
};

// --- Protected Route ---
const ProtectedRoute = ({ allowedRoles }) => {
    const { token, user, logout } = useAuth();

    if (!token || !user) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        logout();
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

// --- HOD Inner Pages ---
const HODHome = () => (
    <div className="space-y-8">
        <h2 className="text-2xl font-semibold text-gray-800 border-b pb-2 mb-4">Overview</h2>
        <HODAvailabilityEditor />
        <HODToDoList />
        <HODAppointments />
    </div>
);

// --- Proctor Layout ---
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
    </ProctorLayout>
);

// --- Main App ---
const App = () => (
    <Router>
        <AuthProvider>
            <Routes>
                {/* Public */}
                <Route path="/" element={<AuthForm />} />

                {/* HOD Protected */}
                <Route element={<ProtectedRoute allowedRoles={['HOD']} />}>
                    <Route
                        path="/hod/dashboard"
                        element={
                            <DashboardLayout>
                                <HODHome />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/hod/appointments"
                        element={
                            <DashboardLayout>
                                <Appointments />
                            </DashboardLayout>
                        }
                    />
                    <Route
                        path="/hod/students"
                        element={
                            <DashboardLayout>
                                <HODStudents />
                            </DashboardLayout>
                        }
                    />

                    <Route
                        path="/hod/history"
                        element={
                            <DashboardLayout>
                            <HODHistory />
                            </DashboardLayout>
                        }
                        />

                </Route>

                {/* Proctor Protected */}
                <Route element={<ProtectedRoute allowedRoles={['Proctor']} />}>
                    <Route path="/proctor/dashboard" element={<ProctorDashboard />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    </Router>
);


export default App;
