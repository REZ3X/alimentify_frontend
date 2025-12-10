'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function DashboardPage() {
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

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { href: '/my/meals', title: 'Track Meals', desc: 'Log your daily food intake', icon: '🍽️', color: 'bg-green-100 text-green-600' },
                            { href: '/my/scan', title: 'AI Food Scan', desc: 'Analyze food with AI camera', icon: '📸', color: 'bg-indigo-100 text-indigo-600' },
                            { href: '/my/nutrition', title: 'Nutrition Search', desc: 'Search global food database', icon: '🔍', color: 'bg-blue-100 text-blue-600' },
                            { href: '/my/recipes', title: 'Healthy Recipes', desc: 'Discover nutritious meal ideas', icon: '🥗', color: 'bg-orange-100 text-orange-600' },
                            { href: '/my/food-wiki', title: 'Food Wiki', desc: 'Explore USDA food data', icon: '📚', color: 'bg-yellow-100 text-yellow-600' },
                            { href: '/my/progress', title: 'View Progress', desc: 'Check your analytics & charts', icon: '📈', color: 'bg-purple-100 text-purple-600' },
                            { href: '/my/reports', title: 'Nutrition Reports', desc: 'Generate & view reports', icon: '📊', color: 'bg-teal-100 text-teal-600' },
                        ].map((action, idx) => (
                            <Link
                                key={idx}
                                href={action.href}
                                className="group bg-white/80 backdrop-blur-xl border border-white/50 rounded-4xl p-6 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] hover:border-[#FAB12F]/50 transition-all duration-300 flex items-center gap-6"
                            >
                                <div className={`w-16 h-16 ${action.color} rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                    {action.icon}
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 group-hover:text-[#FA812F] transition-colors">{action.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{action.desc}</p>
                                </div>
                                <div className="ml-auto opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">
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
