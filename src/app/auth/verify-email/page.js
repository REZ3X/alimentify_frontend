'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';

function VerifyEmailContent() {
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const verifyEmail = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setMessage('No verification token provided');
                return;
            }

            try {
                const response = await api.verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');

                if (response.token && response.user) {
                    api.setToken(response.token);

                    if (typeof window !== 'undefined') {
                        localStorage.setItem('user', JSON.stringify(response.user));
                    }

                    setTimeout(() => {
                        window.location.href = '/';
                    }, 2000);
                } else {
                    setTimeout(() => {
                        router.push('/auth/login');
                    }, 3000);
                }
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Failed to verify email');
            }
        };

        verifyEmail();
    }, [searchParams, router]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 text-center relative z-10"
        >
            {status === 'verifying' && (
                <div className="py-8">
                    <div className="w-20 h-20 border-4 border-[#FAB12F]/30 border-t-[#FA812F] rounded-full animate-spin mx-auto mb-6" />
                    <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Verifying Email...</h2>
                    <p className="text-gray-600 font-medium">Please wait while we verify your email address</p>
                </div>
            )}

            {status === 'success' && (
                <div className="py-4">
                    <div className="w-24 h-24 bg-green-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20 transform -rotate-3">
                        <svg className="w-12 h-12 text-green-600 transform rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Email Verified!</h2>
                    <p className="text-gray-600 mb-6 font-medium text-lg">{message}</p>
                    <div className="flex items-center justify-center gap-2 text-[#FA812F] font-bold animate-pulse">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging you in...
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="py-4">
                    <div className="w-24 h-24 bg-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/20 transform rotate-3">
                        <svg className="w-12 h-12 text-red-600 transform -rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Verification Failed</h2>
                    <p className="text-gray-600 mb-8 font-medium">{message}</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className="w-full py-4 bg-linear-to-r from-[#FAB12F] to-[#FA812F] text-white rounded-2xl hover:shadow-lg hover:shadow-orange-500/30 transition-all font-bold tracking-wide text-lg transform hover:-translate-y-0.5"
                    >
                        Back to Login
                    </button>
                </div>
            )}
        </motion.div>
    );
}

function VerifyEmailLoading() {
    return (
        <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-xl p-8 text-center border border-white/50">
            <div className="w-16 h-16 border-4 border-[#FAB12F]/30 border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900">Loading...</h2>
            <p className="text-gray-600 font-medium">Please wait</p>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2] relative overflow-hidden p-4">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Suspense fallback={<VerifyEmailLoading />}>
                <VerifyEmailContent />
            </Suspense>
        </div>
    );
}
