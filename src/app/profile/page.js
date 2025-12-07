'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';

export default function ProfilePage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/auth/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FEF3E2] relative overflow-x-hidden font-sans selection:bg-[#FAB12F] selection:text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Decorative Blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Navbar />

            <main className="relative z-10 max-w-4xl mx-auto px-4 pt-32 pb-12 space-y-6">
                {/* Profile Header Card */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 relative overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <button 
                        onClick={() => router.back()}
                        className="absolute top-6 left-6 p-3 rounded-full bg-white/50 hover:bg-white text-gray-600 hover:text-[#FAB12F] transition-all duration-300 shadow-sm border border-white/50 z-20 group"
                    >
                        <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#FAB12F]/10 rounded-full blur-3xl -translate-y-1/2 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full p-1.5 bg-linear-to-br from-[#FAB12F] to-[#FA812F] shadow-xl mb-6 group hover:scale-105 transition-transform duration-300">
                            {user.profile_image && !imageError ? (
                                <img
                                    src={user.profile_image}
                                    alt={user.name}
                                    className="w-full h-full rounded-full border-4 border-white object-cover bg-white"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-[#FEF3E2] border-4 border-white flex items-center justify-center overflow-hidden">
                                    <svg className="w-16 h-16 text-[#FAB12F]" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">{user.name}</h1>
                        <p className="text-gray-500 font-medium text-lg mb-6 font-mono">@{user.username}</p>

                        <div className="flex flex-wrap justify-center gap-3">
                            {user.email_verification_status ? (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-100/80 backdrop-blur-sm text-green-700 text-sm font-bold rounded-full border border-green-200 shadow-sm">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                                    Verified Account
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-100/80 backdrop-blur-sm text-yellow-700 text-sm font-bold rounded-full border border-yellow-200 shadow-sm animate-pulse">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                    Unverified
                                </span>
                            )}
                            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm text-gray-600 text-sm font-bold rounded-full border border-white/50 shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                </div>

                {!user.email_verification_status && (
                    <div className="bg-yellow-50/90 backdrop-blur-xl border border-yellow-200 rounded-4xl p-6 flex gap-4 items-start shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500 delay-100">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 text-yellow-600 shadow-sm">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-yellow-900 mb-1 font-mono">Verify Your Email</h3>
                            <p className="text-yellow-800 leading-relaxed text-sm">
                                We've sent a verification link to <strong>{user.gmail}</strong>.
                                Please check your inbox to unlock all features.
                            </p>
                        </div>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Account Info */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-4 fade-in duration-500 delay-200 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                            </div>
                            Account Details
                        </h3>
                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label>
                                <p className="text-gray-900 font-medium text-lg group-hover:text-[#FAB12F] transition-colors">{user.name}</p>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
                                <p className="text-gray-900 font-medium text-lg group-hover:text-[#FAB12F] transition-colors truncate">{user.gmail}</p>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Username</label>
                                <p className="text-gray-900 font-medium text-lg font-mono group-hover:text-[#FAB12F] transition-colors">@{user.username}</p>
                            </div>
                        </div>
                    </div>

                    {/* Activity Stats */}
                    <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-4 fade-in duration-500 delay-300 hover:shadow-lg transition-shadow">
                        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            </div>
                            Activity Log
                        </h3>
                        <div className="space-y-5">
                            <div className="group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Member Since</label>
                                <p className="text-gray-900 font-medium text-lg group-hover:text-purple-600 transition-colors">
                                    {new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            <div className="h-px bg-gray-100"></div>
                            <div className="group">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Last Profile Update</label>
                                <p className="text-gray-900 font-medium text-lg group-hover:text-purple-600 transition-colors">
                                    {new Date(user.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                            {user.email_verified_at && (
                                <>
                                    <div className="h-px bg-gray-100"></div>
                                    <div className="group">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Verified On</label>
                                        <p className="text-gray-900 font-medium text-lg group-hover:text-purple-600 transition-colors">
                                            {new Date(user.email_verified_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2.5rem] p-4 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom-4 fade-in duration-500 delay-400">
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-4xl transition-all duration-300 font-bold group"
                    >
                        <span className="w-8 h-8 rounded-full bg-red-100 group-hover:bg-red-200 flex items-center justify-center transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                        </span>
                        Sign Out of Account
                    </button>
                </div>
            </main>
        </div>
    );
}
