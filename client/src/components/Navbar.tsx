import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { favoritesApi, authApi, stockApi } from "../lib/api";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const Navbar: React.FC = () => {
    const { user, logout, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State for profile picture modal
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileUrl, setProfileUrl] = useState("");
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Calculate Portfolio Value
    const { data: favorites } = useQuery({
        queryKey: ['favorites'],
        queryFn: favoritesApi.getAll
    });

    const { data: stocks } = useQuery({
        queryKey: ['stocks'],
        queryFn: () => stockApi.getStocks()
    });

    const portfolioValue = React.useMemo(() => {
        if (!favorites || !stocks) return 0;

        return favorites.reduce((total, fav) => {
            const liveStock = stocks.find(s => s.ticker === fav.ticker);
            const price = liveStock?.currentPrice || fav.Stock?.currentPrice || 0;
            return total + (price * (fav.shares || 0));
        }, 0);
    }, [favorites, stocks]);

    // Update Profile Mutation
    const updateProfileMutation = useMutation({
        mutationFn: authApi.updateProfile,
    });

    const handleUpdateProfile = async () => {
        if (!profileUrl.trim()) return;
        setIsUpdatingProfile(true);
        try {
            const updatedUser = await updateProfileMutation.mutateAsync({ profilePicture: profileUrl });

            const accessToken = localStorage.getItem('accessToken');
            const refreshToken = localStorage.getItem('refreshToken');

            if (accessToken && refreshToken) {
                login(accessToken, refreshToken, updatedUser);
            }
            setIsProfileModalOpen(false);
        } catch (e) {
            console.error(e);
            alert("Failed to update profile picture");
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const tabs = [
        { id: "favorites", label: "Watchlist", path: "/favorites" },
        { id: "portfolio", label: "Portfolio", path: "/portfolio" },
        { id: "quotes", label: "Quotes", path: "/quotes" },
        { id: "research", label: "Research", path: "/research" },
    ];

    const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="w-full bg-background-dark border-b border-border relative z-50">
            <div className="px-6 lg:px-10 py-4 flex items-center justify-between">
                {/* Left: Logo + Search */}
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-3 text-white">
                        <div className="size-8 flex items-center justify-center bg-primary/20 rounded-lg text-primary">
                            <span className="material-symbols-outlined">candlestick_chart</span>
                        </div>
                        <h2 className="text-white text-xl font-bold tracking-tight">
                            Stock Quote Sheet
                        </h2>
                    </div>
                    {/* Search Bar */}
                    <div className="hidden md:flex items-center bg-[#2d372a] rounded-xl h-10 w-80 px-4 group focus-within:ring-1 ring-primary/50 transition-all">
                        <span
                            className="material-symbols-outlined text-text-secondary text-[20px] cursor-pointer hover:text-white transition-colors"
                            onClick={() => {
                                const input = document.getElementById('navbar-search-input') as HTMLInputElement;
                                if (input && input.value.trim()) {
                                    navigate(`/company/${input.value.trim().toUpperCase()}`);
                                    input.value = '';
                                }
                            }}
                        >
                            search
                        </span>
                        <input
                            id="navbar-search-input"
                            className="bg-transparent border-none text-white placeholder-text-secondary text-sm w-full focus:ring-0 focus:outline-none ml-2"
                            placeholder="Search tickers, companies..."
                            type="text"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.trim()) {
                                        navigate(`/company/${target.value.trim().toUpperCase()}`);
                                        target.value = '';
                                    }
                                }
                            }}
                        />
                    </div>
                </div>

                {/* Center: Navigation Tabs */}
                <div className="hidden lg:flex items-center gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${isActive(tab.path)
                                ? "bg-primary text-black"
                                : "text-text-secondary hover:text-white hover:bg-surface-dark"
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Right: User Profile + Actions */}
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-white text-sm font-medium">{user?.displayName || user?.username}</p>
                        <p className="text-text-secondary text-xs">
                            Portfolio Value: <span className="text-primary font-bold">${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </p>
                    </div>
                    <button className="relative text-text-secondary hover:text-white transition-colors">
                        <span className="material-symbols-outlined">notifications</span>
                        <span className="absolute top-0 right-0 size-2 bg-accent-red rounded-full border-2 border-background-dark"></span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="text-text-secondary hover:text-red-400 transition-colors"
                        title="Logout"
                    >
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                    <button
                        onClick={() => {
                            setProfileUrl(user?.profilePicture || "");
                            setIsProfileModalOpen(true);
                        }}
                        className="bg-center bg-no-repeat bg-cover rounded-full size-10 border-2 border-border hover:border-primary transition-colors relative overflow-hidden"
                        style={{
                            backgroundImage: `url("${user?.profilePicture || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB6NjdPzyMl1UkwO2a4kWQQc3KpcVci9Mkk782SRrF0TODZMGHCn-6V423km0SbNW1LV2-1AUy3SVVtUEuXOnCq_I4CS4xvl_FlmsvLBLSN3lYVpKOgfN1ZH6O1URpsP1zj5ShTddnFVdeWyFMmhFbqlJUl2HX2kDi4Xeff7XgS1ZcVWDQUzHXbTqBiE5uz8yR3ob7WgMdh62Rth9oLvDpgFAD_7OKcK4hsxjeLZtROEwwKFfN8Evzy0grviIoWi7HvB5wCNvmhFQ'}")`,
                        }}
                    >
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-white text-xs">edit</span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Profile Picture Modal */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-[#1a2119] border border-[#2d372a] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-[#2d372a] flex justify-between items-center bg-[#232b22]">
                            <h2 className="text-xl font-bold text-white">Update Profile Picture</h2>
                            <button onClick={() => setIsProfileModalOpen(false)} className="text-[#a5b6a0] hover:text-white transition-colors">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-6">
                            <p className="text-[#a5b6a0] text-sm mb-4">
                                Enter a URL for your profile picture.
                            </p>
                            <input
                                type="text"
                                value={profileUrl}
                                onChange={(e) => setProfileUrl(e.target.value)}
                                placeholder="https://example.com/my-photo.jpg"
                                className="w-full bg-[#131712] border border-[#2d372a] rounded-lg px-4 py-2 text-white placeholder-text-secondary focus:border-primary focus:outline-none mb-4"
                                autoFocus
                            />
                            {profileUrl && (
                                <div className="flex justify-center mb-2">
                                    <div className="size-20 rounded-full bg-center bg-cover border-2 border-primary" style={{ backgroundImage: `url("${profileUrl}")` }}></div>
                                </div>
                            )}
                        </div>
                        <div className="p-6 pt-0 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setIsProfileModalOpen(false)}
                                className="px-4 py-2 rounded-full text-white font-bold text-sm hover:bg-[#2d372a] transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleUpdateProfile}
                                disabled={updateProfileMutation.isPending || !profileUrl}
                                className="px-6 py-2 rounded-full bg-primary text-black font-bold text-sm hover:bg-[#45b025] transition-colors disabled:opacity-50"
                            >
                                {updateProfileMutation.isPending ? 'Saving...' : 'Save Picture'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;
