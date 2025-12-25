import React, { useState } from 'react';
import { useAuth } from '../App.jsx'; 
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000/api/auth';
const ANITS_LOGO = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXxlD_GBa451W89CB4HBtNKLVdoJvj16dJmA&s";

const BG_IMAGE = "https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop";

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
                setFormData(prev => ({ ...prev, name: '', password: '' }));
            }
        } catch (error) {
            setMessage('Server unreachable.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-full flex items-center justify-end font-sans relative overflow-hidden bg-slate-900 selection:bg-indigo-100">
            {/* Professional Background with Gradient Overlay */}
            <div 
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
                style={{ backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95), rgba(15, 23, 42, 0.5)), url('${BG_IMAGE}')` }}
            ></div>

            {/* Left Content Area */}
            <div className="hidden lg:flex flex-col justify-center p-20 z-10 w-1/2 h-full text-white pb-32">
                <div className="flex items-center gap-3 mb-10">
                    <img src={ANITS_LOGO} alt="ANITS" className="h-10 w-10 rounded-lg shadow-2xl bg-white p-0.5" />
                    <span className="text-2xl font-bold tracking-[0.4em] uppercase opacity-90">ANVIS</span>
                </div>
                
                <h1 className="text-4xl xl:text-5xl font-black leading-[1.3] mb-12 drop-shadow-2xl">
                    Smart Interaction. <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 font-extrabold">Centralized Data.</span>
                </h1>
                
                <p className="text-lg text-slate-300 max-w-lg font-medium leading-relaxed mb-16 opacity-80">
                    Bridging the gap between parents and faculty with AI-powered bot notifications and real-time student insights for HODs and Proctors.
                </p>
                
                <div className="flex gap-12 border-l-2 border-cyan-500 pl-8 py-3">
                    <div className="group">
                        <p className="text-cyan-400 font-black text-2xl leading-none group-hover:scale-110 transition-transform">98%</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">Bot Accuracy</p>
                    </div>
                    <div className="group">
                        <p className="text-cyan-400 font-black text-2xl leading-none group-hover:scale-110 transition-transform">Instant</p>
                        <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold mt-2">System Alerts</p>
                    </div>
                </div>
            </div>

            {/* Floating Auth Card */}
            <div className="relative z-20 w-full lg:w-[48%] h-full flex items-center justify-center lg:justify-start lg:pr-12 xl:pr-24">
                <div className="w-full max-w-[480px] bg-white rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.7)] p-10 lg:p-14 animate-in fade-in zoom-in duration-500">
                    
                    <div className="mb-12">
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            {isLogin ? 'Sign in to access the ANVIS dashboard.' : 'Register as HOD or Proctor to join the portal.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {message && (
                            <div className={`p-3 text-[10px] rounded-xl font-black uppercase tracking-widest border text-center ${
                                message.includes('success') || message.includes('created') 
                                ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
                                : 'bg-rose-50 border-rose-100 text-rose-600'
                            }`}>
                                {message}
                            </div>
                        )}

                        <div className="space-y-5">
                            {/* Signup Only: Name */}
                            {!isLogin && (
                                <div className="space-y-1.5 w-full">
                                    <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black ml-1">Full Name</label>
                                    <input name="name" type="text" required value={formData.name} onChange={handleChange}
                                        placeholder="Full Name"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
                                </div>
                            )}

                            {/* Email Row */}
                            <div className="space-y-1.5 w-full">
                                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black ml-1">Email Address</label>
                                <input name="email" type="email" required value={formData.email} onChange={handleChange}
                                    placeholder="name@anits.edu.in"
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
                            </div>

                            {/* Conditional Layout: Login is stacked, Signup is side-by-side */}
                            <div className={isLogin ? "space-y-5" : "grid grid-cols-2 gap-4"}>
                                {!isLogin && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black ml-1">Account Role</label>
                                        <select name="role" value={formData.role} onChange={handleChange}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                                            <option value="Proctor">Proctor</option>
                                            <option value="HOD">HOD</option>
                                        </select>
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] uppercase tracking-widest text-slate-400 font-black">Password</label>
                                        {isLogin && <button type="button" className="text-[10px] text-cyan-600 font-bold hover:underline">Forgot?</button>}
                                    </div>
                                    <input name="password" type="password" required value={formData.password} onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all" />
                                </div>
                            </div>
                        </div>

                        <button type="submit" disabled={loading}
                            className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl text-xs tracking-[0.2em] uppercase transition-all active:scale-[0.98] shadow-2xl shadow-slate-300 mt-4">
                            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Register')}
                        </button>

                        <p className="text-center text-sm text-slate-500 mt-10 font-medium">
                            {isLogin ? "Need access?" : "Already a user?"}{' '}
                            <button type="button" onClick={() => setIsLogin(!isLogin)} className="text-cyan-600 font-bold hover:underline ml-1">
                                {isLogin ? 'Create an account' : 'Sign in here'}
                            </button>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AuthForm;