'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

function DashboardContent() {
    const { user, loading, logout, login } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [authenticating, setAuthenticating] = useState(false);
    const [healthProfile, setHealthProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        const handleOAuthToken = async () => {
            const token = searchParams.get('token');
            if (token && !user) {
                setAuthenticating(true);
                try {
                    api.setToken(token);
                    const userData = await api.getCurrentUser();
                    login(token, userData);
                    router.replace('/my');
                } catch (err) {
                    console.error('Failed to authenticate with token:', err);
                    api.removeToken();
                    router.push('/auth/login');
                } finally {
                    setAuthenticating(false);
                }
            }
        };

        handleOAuthToken();
    }, [searchParams, user, login, router]);

    useEffect(() => {
        if (!loading && !user && !searchParams.get('token')) {
            router.push('/auth/login');
        } else if (!loading && user && !user.has_completed_health_survey) {
            router.push('/my/health-survey');
        }
    }, [user, loading, router, searchParams]);

    useEffect(() => {
        const fetchHealthProfile = async () => {
            if (user && user.has_completed_health_survey) {
                try {
                    const response = await api.getHealthProfile();
                    setHealthProfile(response.profile);
                } catch (error) {
                    console.error('Failed to fetch health profile:', error);
                } finally {
                    setLoadingProfile(false);
                }
            } else {
                setLoadingProfile(false);
            }
        };

        fetchHealthProfile();
    }, [user]);

    if (loading || authenticating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600 font-mono">{authenticating ? 'Completing sign in...' : 'Loading...'}</p>
                </div>
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

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-8 space-y-8">
                {/* Welcome Section */}
                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-4xl shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-8 md:p-10 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-[#FAB12F]/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-700"></div>
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-mono font-bold text-gray-900 mb-2">
                            Welcome back, <span className="text-[#FA812F]">{user.name.split(' ')[0]}</span>! 👋
                        </h2>
                        <p className="text-gray-600 text-lg max-w-2xl">
                            Ready to crush your nutrition goals today? Let's see how you're doing.
                        </p>
                    </div>
                </div>

                {!user.email_verification_status && (
                    <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200 rounded-4xl p-6 flex gap-4 items-start shadow-sm">
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center shrink-0 text-yellow-600">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-yellow-900 mb-1 font-mono">Verify Your Email</h3>
                            <p className="text-yellow-800 leading-relaxed">
                                We've sent a verification link to <strong>{user.gmail}</strong>.
                                Please check your inbox to unlock all features.
                            </p>
                        </div>
                    </div>
                )}

                {healthProfile && (
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <h2 className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-2 h-8 bg-[#FAB12F] rounded-full"></span>
                                Your Health Stats
                            </h2>
                            <Link
                                href="/my/profile-edit"
                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-[#FAB12F] text-gray-700 hover:text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md border border-gray-100 group"
                            >
                                <svg className="w-5 h-5 text-[#FAB12F] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Edit Profile
                            </Link>
                        </div>

                        {/* Daily Targets Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Calories', value: Math.round(healthProfile.daily_calories), unit: 'kcal', color: 'orange', icon: '🔥' },
                                { label: 'Protein', value: Math.round(healthProfile.daily_protein_g), unit: 'g', color: 'red', icon: '🥩' },
                                { label: 'Carbs', value: Math.round(healthProfile.daily_carbs_g), unit: 'g', color: 'blue', icon: '🌾' },
                                { label: 'Fat', value: Math.round(healthProfile.daily_fat_g), unit: 'g', color: 'yellow', icon: '🥑' },
                            ].map((item, idx) => (
                                <div key={idx} className="bg-white/60 backdrop-blur-md border border-white/50 rounded-4xl p-6 text-center hover:transform hover:scale-105 transition-all duration-300 shadow-sm hover:shadow-lg group">
                                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                                    <p className={`text-2xl font-mono font-bold text-${item.color}-600`}>{item.value}</p>
                                    <p className="text-xs text-gray-400">{item.unit}</p>
                                </div>
                            ))}
                        </div>

                        {/* Detailed Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-4xl p-6 shadow-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">BMI Score</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${healthProfile.bmi_category === 'Normal' ? 'bg-green-100 text-green-700' :
                                        healthProfile.bmi_category === 'Underweight' ? 'bg-blue-100 text-blue-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {healthProfile.bmi_category}
                                    </span>
                                </div>
                                <div className="flex items-end gap-2">
                                    <p className="text-4xl font-mono font-bold text-gray-900">{healthProfile.bmi.toFixed(1)}</p>
                                    <p className="text-sm text-gray-400 mb-1.5">kg/m²</p>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-4xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">BMR (Base)</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-4xl font-mono font-bold text-gray-900">{Math.round(healthProfile.bmr)}</p>
                                    <p className="text-sm text-gray-400 mb-1.5">kcal/day</p>
                                </div>
                            </div>

                            <div className="bg-white/60 backdrop-blur-md border border-white/50 rounded-4xl p-6 shadow-sm">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">TDEE (Total)</h3>
                                <div className="flex items-end gap-2">
                                    <p className="text-4xl font-mono font-bold text-gray-900">{Math.round(healthProfile.tdee)}</p>
                                    <p className="text-sm text-gray-400 mb-1.5">kcal/day</p>
                                </div>
                            </div>
                        </div>

                        {/* Goal & Activity */}
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-linear-to-br from-purple-50 to-white border border-purple-100 rounded-4xl p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">🎯</div>
                                <div>
                                    <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Current Goal</h3>
                                    <p className="text-xl font-bold text-gray-900 capitalize">{healthProfile.goal.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                            <div className="bg-linear-to-br from-green-50 to-white border border-green-100 rounded-4xl p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">🏃</div>
                                <div>
                                    <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Activity Level</h3>
                                    <p className="text-xl font-bold text-gray-900 capitalize">{healthProfile.activity_level.replace(/_/g, ' ')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-mono font-bold text-gray-900 flex items-center gap-2">
                        <span className="w-2 h-8 bg-[#FA812F] rounded-full"></span>
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        {[
                            { 
                                href: '/my/meals', 
                                title: 'Track Meals', 
                                desc: 'Log your daily food intake', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                    </svg>
                                ),
                                color: 'bg-green-100 text-green-600',
                                className: 'lg:col-span-2 lg:row-span-2',
                                isLarge: true
                            },
                            { 
                                href: '/my/scan', 
                                title: 'AI Food Scan', 
                                desc: 'Analyze food with AI camera', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                ),
                                color: 'bg-indigo-100 text-indigo-600',
                                className: 'lg:col-span-1'
                            },
                            { 
                                href: '/my/nutrition', 
                                title: 'Nutrition Search', 
                                desc: 'Search global food database', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                ),
                                color: 'bg-blue-100 text-blue-600',
                                className: 'lg:col-span-1'
                            },
                            { 
                                href: '/my/recipes', 
                                title: 'Healthy Recipes', 
                                desc: 'Discover nutritious meal ideas', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                ),
                                color: 'bg-orange-100 text-orange-600',
                                className: 'lg:col-span-1'
                            },
                            { 
                                href: '/my/food-wiki', 
                                title: 'Food Wiki', 
                                desc: 'Explore USDA food data', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                    </svg>
                                ),
                                color: 'bg-yellow-100 text-yellow-600',
                                className: 'lg:col-span-1'
                            },
                            { 
                                href: '/my/progress', 
                                title: 'View Progress', 
                                desc: 'Check your analytics & charts', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                ),
                                color: 'bg-purple-100 text-purple-600',
                                className: 'lg:col-span-2'
                            },
                            { 
                                href: '/my/reports', 
                                title: 'Nutrition Reports', 
                                desc: 'Generate & view reports', 
                                icon: (
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                ),
                                color: 'bg-teal-100 text-teal-600',
                                className: 'lg:col-span-2'
                            },
                        ].map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className={`group bg-white/80 backdrop-blur-xl border border-white/50 rounded-4xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#FAB12F]/50 transition-all duration-300 relative overflow-hidden ${action.className || ''} ${action.isLarge ? 'flex flex-col justify-between' : 'flex items-center gap-6'}`}
                            >
                                {/* Decorative background for all cards on hover */}
                                <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${action.color.split(' ')[0]} rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500`}></div>

                                <div className={`${action.isLarge ? 'mb-4' : ''} relative z-10`}>
                                    <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300 ${action.isLarge ? 'w-20 h-20 mb-6' : ''}`}>
                                        {action.icon}
                                    </div>
                                </div>
                                
                                <div className="relative z-10 flex-1">
                                    <h4 className={`font-bold text-gray-900 group-hover:text-[#FA812F] transition-colors ${action.isLarge ? 'text-2xl mb-2' : 'text-lg'}`}>{action.title}</h4>
                                    <p className={`text-gray-500 ${action.isLarge ? 'text-base' : 'text-sm mt-1'}`}>{action.desc}</p>
                                </div>

                                <div className={`opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300 ${action.isLarge ? 'absolute top-8 right-8' : 'ml-auto'}`}>
                                    <svg className="w-6 h-6 text-[#FAB12F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}

function DashboardLoading() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-mono">Loading...</p>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<DashboardLoading />}>
            <DashboardContent />
        </Suspense>
    );
}
