'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, user } = useAuth();

    useEffect(() => {
        if (user) {
            router.push('/');
        }
    }, [user, router]);

    useEffect(() => {
        const handleCallback = async () => {
            const token = searchParams.get('token');
            if (token) {
                try {
                    api.setToken(token);
                    const userData = await api.getCurrentUser();
                    login(token, userData);
                } catch (err) {
                    setError('Authentication failed. Please try again.');
                    console.error(err);
                }
            }
        };

        handleCallback();
    }, [searchParams, login]);

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            setError('');
            const { auth_url } = await api.getGoogleAuthUrl();
            window.location.href = auth_url;
        } catch (err) {
            setError(err.message || 'Failed to initiate Google login');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2] px-4 relative overflow-hidden font-sans selection:bg-[#FAB12F] selection:text-white">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            
            {/* Decorative Blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo/Home Link */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-3 group">
                        <div className="w-12 h-12 bg-[#FAB12F] rounded-2xl flex items-center justify-center shadow-lg shadow-[#FAB12F]/30 transform group-hover:rotate-12 transition-transform duration-300 border-2 border-white">
                            <img src="/assets/white-icon.png" alt="Alimentify" className="w-6 h-6 object-contain" />
                        </div>
                        <span className="text-2xl font-mono font-bold text-gray-900 tracking-tight">Alimentify</span>
                    </Link>
                </div>

                <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-8 md:p-10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-mono font-bold text-gray-900 mb-3">Welcome Back</h1>
                        <p className="text-gray-600">Sign in to continue your healthy journey</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-red-600 text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-50 border-2 border-[#FEF3E2] hover:border-[#FAB12F] rounded-2xl px-6 py-4 text-gray-700 font-bold font-mono transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed group"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24">
                                    <path
                                        fill="#4285F4"
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    />
                                    <path
                                        fill="#34A853"
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    />
                                    <path
                                        fill="#FBBC05"
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    />
                                    <path
                                        fill="#EA4335"
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    />
                                </svg>
                                Continue with Google
                            </>
                        )}
                    </button>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link href="/auth/register" className="text-[#FA812F] font-bold hover:text-[#FAB12F] transition-colors">
                                Get Started
                            </Link>
                        </p>
                    </div>
                </div>
                
                {/* Footer Links */}
                <div className="mt-8 flex justify-center gap-6 text-sm text-gray-400 font-medium">
                    <a href="#" className="hover:text-[#FA812F] transition-colors">Privacy</a>
                    <a href="#" className="hover:text-[#FA812F] transition-colors">Terms</a>
                    <a href="#" className="hover:text-[#FA812F] transition-colors">Help</a>
                </div>
            </div>
        </div>
    );
}
