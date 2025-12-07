'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

function UserAvatar({ user, className }) {
    const [imageError, setImageError] = useState(false);

    if (user.profile_image && !imageError) {
        return (
            <img
                src={user.profile_image}
                alt={user.name}
                className={`${className} object-cover`}
                onError={() => setImageError(true)}
            />
        );
    }

    return (
        <div className={`${className} bg-[#FEF3E2] flex items-center justify-center overflow-hidden`}>
            <svg className="w-3/5 h-3/5 text-[#FAB12F]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
        </div>
    );
}

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Handle scroll effect for extra polish
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!user) return null;

    return (
        <>
            <nav className={`fixed top-4 left-4 right-4 md:top-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-7xl md:px-8 z-50 transition-all duration-300 ${scrolled ? 'translate-y-0' : 'translate-y-0'}`}>
                <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-full p-2 pl-4 pr-2 flex justify-between items-center w-full relative">
                    {/* Logo */}
                    <Link href="/my" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-[#FAB12F] rounded-full flex items-center justify-center shadow-lg shadow-[#FAB12F]/20 transform group-hover:rotate-12 transition-transform duration-300 border-2 border-white">
                            <img src="/assets/white-icon.png" alt="Alimentify" className="w-5 h-5 object-contain" />
                        </div>
                        <span className="text-xl font-mono font-bold text-gray-900 tracking-tight hidden sm:block">Alimentify</span>
                    </Link>

                    {/* Desktop User Menu */}
                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative group">
                            <button className="flex items-center gap-3 pl-4 pr-2 py-1.5 rounded-full bg-white/50 hover:bg-white/80 border border-white/50 hover:border-[#FAB12F]/30 transition-all duration-300 shadow-sm group-hover:shadow-md">
                                <div className="text-right mr-1">
                                    <p className="text-sm font-bold text-gray-900 leading-none">{user.name}</p>
                                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider mt-0.5">@{user.username}</p>
                                </div>
                                <UserAvatar user={user} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                <svg className="w-4 h-4 text-gray-400 group-hover:text-[#FAB12F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Desktop Dropdown */}
                            <div className="absolute right-0 mt-4 w-72 bg-white/90 backdrop-blur-xl rounded-4xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right translate-y-2 group-hover:translate-y-0 p-4 z-50">
                                <div className="flex items-center gap-3 mb-4 p-2 bg-[#FEF3E2]/50 rounded-2xl">
                                    <UserAvatar user={user} className="w-10 h-10 rounded-full shadow-sm" />
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.gmail}</p>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <Link href="/profile" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#FEF3E2] hover:text-[#FAB12F] rounded-xl transition-colors group/item">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover/item:bg-[#FAB12F]/20 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                        </span>
                                        Profile Settings
                                    </Link>
                                    <Link href="/my/profile-edit" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#FEF3E2] hover:text-[#FAB12F] rounded-xl transition-colors group/item">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover/item:bg-[#FAB12F]/20 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                        </span>
                                        Health Data
                                    </Link>
                                    <Link href="/my/notifications" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-[#FEF3E2] hover:text-[#FAB12F] rounded-xl transition-colors group/item">
                                        <span className="w-8 h-8 rounded-lg bg-gray-100 group-hover/item:bg-[#FAB12F]/20 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                        </span>
                                        Notifications
                                    </Link>
                                    
                                    <div className="h-px bg-gray-100 my-2" />
                                    
                                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors group/item">
                                        <span className="w-8 h-8 rounded-lg bg-red-50 group-hover/item:bg-red-100 flex items-center justify-center transition-colors">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                        </span>
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2.5 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-[#FAB12F] text-white rotate-90' : 'bg-gray-100 text-gray-600 hover:bg-[#FEF3E2] hover:text-[#FAB12F]'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay - Creative Floating Card */}
            {isMenuOpen && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
                        onClick={() => setIsMenuOpen(false)}
                    />
                    
                    {/* Floating Menu Card */}
                    <div className="fixed top-24 left-4 right-4 z-50 md:hidden">
                        <div className="bg-white/90 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-6 transform transition-all duration-300 animate-in slide-in-from-top-4 fade-in">
                            {/* User Header */}
                            <div className="flex flex-col items-center text-center mb-8">
                                <div className="w-20 h-20 rounded-full p-1 bg-linear-to-br from-[#FAB12F] to-[#FA812F] mb-3 shadow-lg">
                                    <UserAvatar user={user} className="w-full h-full rounded-full border-4 border-white" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                                <p className="text-sm text-gray-500 font-medium">@{user.username}</p>
                            </div>

                            {/* Menu Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <Link 
                                    href="/profile" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-900 hover:bg-[#FEF3E2] hover:text-[#FAB12F] transition-colors group"
                                >
                                    <svg className="w-6 h-6 mb-2 text-gray-500 group-hover:text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    <span className="text-xs font-bold">Profile</span>
                                </Link>
                                <Link 
                                    href="/my/profile-edit" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-900 hover:bg-[#FEF3E2] hover:text-[#FAB12F] transition-colors group"
                                >
                                    <svg className="w-6 h-6 mb-2 text-gray-500 group-hover:text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                                    <span className="text-xs font-bold">Health Data</span>
                                </Link>
                                <Link 
                                    href="/my/notifications" 
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 text-gray-900 hover:bg-[#FEF3E2] hover:text-[#FAB12F] transition-colors group"
                                >
                                    <svg className="w-6 h-6 mb-2 text-gray-500 group-hover:text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
                                    <span className="text-xs font-bold">Notifs</span>
                                </Link>
                                <button 
                                    onClick={logout}
                                    className="flex flex-col items-center justify-center p-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                                >
                                    <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    <span className="text-xs font-bold">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </>
    );
}