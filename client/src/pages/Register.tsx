import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        displayName: ""
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Auto-login after register
                login(data.accessToken, data.refreshToken, data.user);
                navigate('/quotes');
            } else {
                setError(data.error || 'Registration failed');
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-background-light dark:bg-background-dark font-display min-h-screen flex flex-col items-center justify-center relative overflow-hidden selection:bg-primary selection:text-black">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <svg
                    className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 opacity-[0.03] blur-xl text-primary transform scale-150"
                    fill="none"
                    viewBox="0 0 1440 600"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M-100 400 L 100 350 L 300 500 L 500 200 L 700 400 L 900 150 L 1100 300 L 1300 100 L 1500 250"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="40"
                    ></path>
                </svg>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background-dark/50 to-background-dark pointer-events-none"></div>
            </div>

            <div className="relative z-10 w-full max-w-md p-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-500">
                <div className="bg-surface-dark/60 backdrop-blur-md border border-white/5 rounded-2xl shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] p-8 w-full">
                    <div className="flex flex-col items-center gap-6 mb-8">
                        <div className="size-12 rounded-xl bg-gradient-to-br from-primary/20 to-transparent flex items-center justify-center border border-white/5 shadow-inner">
                            <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M42.4379 44C42.4379 44 36.0744 33.9038 41.1692 24C46.8624 12.9336 42.2078 4 42.2078 4L7.01134 4C7.01134 4 11.6577 12.932 5.96912 23.9969C0.876273 33.9029 7.27094 44 7.27094 44L42.4379 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <div className="text-center space-y-1">
                            <h1 className="text-2xl font-bold tracking-tight text-white">
                                Create an Account
                            </h1>
                            <p className="text-sm text-gray-400">
                                Join to start tracking your portfolio.
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleRegister} className="flex flex-col gap-4">
                        {error && <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/20 rounded-lg">{error}</div>}

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="username">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">person</span>
                                </div>
                                <input
                                    className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-sm transition-all outline-none"
                                    id="username"
                                    placeholder="jdoe"
                                    type="text"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="email">Email (Optional)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                </div>
                                <input
                                    className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-sm transition-all outline-none"
                                    id="email"
                                    placeholder="name@example.com"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="displayName">Display Name (Optional)</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">badge</span>
                                </div>
                                <input
                                    className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-sm transition-all outline-none"
                                    id="displayName"
                                    placeholder="John Doe"
                                    type="text"
                                    value={formData.displayName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-300 ml-1" htmlFor="password">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">lock</span>
                                </div>
                                <input
                                    className="block w-full rounded-lg bg-white border border-white/10 text-black placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary pl-10 pr-4 py-3 text-sm transition-all outline-none"
                                    id="password"
                                    placeholder="••••••••"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full bg-primary hover:bg-primary/90 text-background-dark font-bold py-3 px-4 rounded-lg transition-all transform active:scale-[0.98] shadow-[0_0_20px_-5px_rgba(83,210,45,0.3)] hover:shadow-[0_0_25px_-5px_rgba(83,210,45,0.5)] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                            {!loading && <span className="material-symbols-outlined text-[20px] font-bold">arrow_forward</span>}
                        </button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-sm text-gray-500">
                            Already have an account?{" "}
                            <Link
                                className="text-primary hover:text-primary/80 font-semibold transition-colors"
                                to="/login"
                            >
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
