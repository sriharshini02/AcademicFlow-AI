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
import ProctorLayout from './components/ProctorLayout.jsx';
import ProctorProfile from './components/ProctorProfile.jsx';
import ProctorSettings from './components/ProctorSettings.jsx';
import ProctorDashboard from './components/ProctorDashboard.jsx';
import ProctorStudents from './components/ProctorStudents.jsx';
import HODProfile from './components/HODProfile.jsx';
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

    return (
        <AuthContext.Provider value={{ token, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
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

// --- HOD Home View ---
const HODHome = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 items-start">
        
        {/* LEFT COLUMN: Stacked Availability and Pending */}
        <div className="flex flex-col gap-6 lg:gap-8">
            <section className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <HODAvailabilityEditor />
            </section>
            
            {/* We pass a prop to HODAppointments to only show Pending here */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <HODAppointments view="left_stack" />
            </section>
        </div>

        {/* RIGHT COLUMN: Task Queue and Scheduled Stack */}
        <div className="flex flex-col gap-6 lg:gap-8">
            <section className="animate-in fade-in slide-in-from-bottom-3 duration-700">
                <HODToDoList />
            </section>
            
            {/* Scheduled visits can go here or remain in the combined component */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <HODAppointments view="right_stack" />
            </section>
        </div>
    </div>
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
                    <Route path="/hod/profile" element={<DashboardLayout><HODProfile /></DashboardLayout>} />
                </Route>

                {/* Proctor Protected */}
                <Route element={<ProtectedRoute allowedRoles={['Proctor']} />}>
                    <Route
                        path="/proctor/dashboard"
                        element={
                            <ProctorLayout>
                                <ProctorDashboard />
                            </ProctorLayout>
                        }
                    />
                    <Route
                        path="/proctor/students"
                        element={
                            <ProctorLayout>
                                <ProctorStudents />
                            </ProctorLayout>
                        }
                    />
                    <Route
                        path="/proctor/profile"
                        element={
                            <ProctorLayout>
                                <ProctorProfile />
                            </ProctorLayout>
                        }
                    />
                    <Route
                        path="/proctor/settings"
                        element={
                            <ProctorLayout>
                                <ProctorSettings />
                            </ProctorLayout>
                        }
                    />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AuthProvider>
    </Router>
);

export default App;
