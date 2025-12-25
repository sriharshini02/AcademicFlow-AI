import React, { useState } from 'react';
import { useAuth } from '../App.jsx'; 
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/auth';
const ANITS_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXxlD_GBa451W89CB4HBtNKLVdoJvj16dJmA&s";

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'Proctor',
    });
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const { login: authLogin } = useAuth();
    const navigate = useNavigate();

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
            : formData;

        try {
            const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || 'Authentication failed.');
                return;
            }

            if (isLogin) {
                authLogin(data.accessToken, data.user);
                navigate(data.user.role === 'HOD' ? '/hod/dashboard' : '/proctor/dashboard');
            } else {
                setMessage('Account created! Please log in.');
                setIsLogin(true);
            }
        } catch (error) {
            setMessage('Server unreachable. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 lg:p-10 font-sans relative"
             style={{ 
                background: 'linear-gradient(135deg, #60a5fa 0%, #7c3aed 100%)',
             }}>
            
            {/* Main Centered Box */}
            <div className="z-10 w-full max-w-5xl bg-[#1e293b]/90 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col lg:flex-row overflow-hidden border border-white/20">
                
                {/* LEFT PANEL: The Interaction Side */}
                <div className="w-full lg:w-[55%] flex flex-col p-10 lg:p-14 justify-center">
                    <div className="flex items-center gap-3 mb-10">
                        <img src={ANITS_LOGO} alt="ANITS" className="h-10 w-10 rounded-xl shadow-md bg-white p-1" />
                        <span className="text-xl font-bold text-white tracking-tight">ANITS Portal</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-4xl font-bold text-white mb-2">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-slate-300 text-base font-medium">
                            {isLogin ? 'Sign in to access student data.' : 'Join the academic proctoring network.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <div className="p-3 text-sm rounded-xl bg-red-500/20 border border-red-500/30 text-red-200">
                                {message}
                            </div>
                        )}

                        {/* Registration Grid / Login Stack */}
                        <div className={isLogin ? "space-y-6" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Full Name</label>
                                    <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                        placeholder="Enter your name"
                                        className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:border-blue-400 transition-all placeholder:text-slate-500" />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    placeholder="yourname@anits.edu.in"
                                    className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:border-blue-400 transition-all placeholder:text-slate-500" />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="text-xs uppercase tracking-widest text-slate-400 font-bold">Password</label>
                                    {isLogin && <button type="button" className="text-xs text-blue-400 hover:underline">Forgot?</button>}
                                </div>
                                <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                    placeholder="••••••••"
                                    className="w-full px-5 py-3.5 bg-slate-800/50 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:border-blue-400 transition-all placeholder:text-slate-500" />
                            </div>

                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest text-slate-400 font-bold ml-1">Academic Role</label>
                                    <select name="role" value={formData.role} onChange={handleChange}
                                        className="w-full px-5 py-3.5 bg-slate-800 border border-slate-700 rounded-2xl text-white text-sm outline-none focus:border-blue-400 transition-all appearance-none cursor-pointer">
                                        <option value="Proctor">Proctor</option>
                                        <option value="HOD">HOD</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-2xl text-sm transition-all active:scale-[0.98] shadow-lg shadow-blue-500/20">
                            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>

                        <p className="text-center text-sm text-slate-400 mt-4">
                            {isLogin ? "Need an account?" : "Already a member?"}{' '}
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-blue-400 font-bold hover:underline">
                                {isLogin ? 'Sign Up' : 'Log In'}
                            </button>
                        </p>
                    </form>
                </div>

                {/* RIGHT PANEL: Visual Branding Side */}
                <div className="hidden lg:flex lg:w-[45%] bg-[#0f172a]/60 p-12 flex-col justify-between relative border-l border-white/5">
                    <div className="z-20">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-6">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-4xl font-bold text-white leading-tight">
                            Insights for <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Student Success.</span>
                        </h3>
                    </div>

                    <div className="z-20 p-8 rounded-[2rem] bg-white/[0.05] border border-white/10 backdrop-blur-md">
                        <div className="text-blue-400 mb-4 font-serif text-4xl leading-none">“</div>
                        <p className="text-slate-200 text-sm italic leading-relaxed mb-6">
                            Transforming fragmented student records into actionable insights. Empower your proctoring with data-driven conversations.
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 p-[2px]">
                                <div className="h-full w-full rounded-full bg-[#0f172a] flex items-center justify-center text-[10px] font-bold text-white uppercase">Admin</div>
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold">Academic Council</p>
                                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Official System</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Decorative Background Blob behind right panel text */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] pointer-events-none"></div>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;