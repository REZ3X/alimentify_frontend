'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

function CheckEmailContent() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }
    }, [searchParams]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/50 p-8 relative z-10"
        >
            <div className="w-24 h-24 bg-linear-to-br from-[#FAB12F] to-[#FA812F] rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-orange-500/20 transform -rotate-6">
                <svg className="w-12 h-12 text-white transform rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            <div className="text-center">
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Check Your Email</h1>
                <p className="text-gray-600 mb-8 font-medium">
                    We've sent a verification link to
                </p>

                {email && (
                    <div className="bg-white/50 border border-white/60 rounded-2xl p-4 mb-8 shadow-sm">
                        <p className="text-lg font-bold text-gray-800 break-all font-mono">{email}</p>
                    </div>
                )}

                <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 mb-8 text-left">
                    <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0 text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-blue-900 mb-1">Important</p>
                            <p className="text-sm text-blue-800/80 leading-relaxed">
                                Click the verification link in the email to complete your registration and automatically log in.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 text-left mb-8">
                    <h3 className="font-bold text-gray-900 text-center mb-4 text-sm uppercase tracking-wider opacity-70">Next Steps</h3>

                    {[
                        { step: 1, text: "Open your email inbox" },
                        { step: 2, text: "Look for an email from Alimentify" },
                        { step: 3, text: "Click the verification link" }
                    ].map((item) => (
                        <div key={item.step} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors">
                            <div className="w-8 h-8 bg-[#FAB12F]/20 rounded-xl flex items-center justify-center shrink-0 text-[#FA812F] font-black text-sm">
                                {item.step}
                            </div>
                            <p className="text-sm font-medium text-gray-700">{item.text}</p>
                        </div>
                    ))}
                </div>

                <div className="border-t border-gray-200/50 pt-6">
                    <p className="text-sm font-medium text-gray-500 mb-3">Didn't receive the email?</p>
                    <div className="space-y-2 text-xs text-gray-400 font-medium">
                        <p>• Check your spam or junk folder</p>
                        <p>• Make sure the email address is correct</p>
                        <p>• Wait a few minutes and refresh</p>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200/50">
                    <p className="text-sm text-gray-600 font-medium">
                        Already verified?{' '}
                        <Link href="/auth/login" className="text-[#FA812F] font-bold hover:text-[#FAB12F] transition-colors">
                            Go to login
                        </Link>
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function CheckEmailLoading() {
    return (
        <div className="max-w-md w-full bg-white/60 backdrop-blur-xl rounded-4xl shadow-xl p-8 text-center border border-white/50">
            <div className="w-16 h-16 border-4 border-[#FAB12F]/30 border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-black text-gray-900">Loading...</h2>
        </div>
    );
}

export default function CheckEmailPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2] relative overflow-hidden p-4">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
            <div className="fixed top-0 left-0 w-96 h-96 bg-[#FAB12F]/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0"></div>
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-[#FA812F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none z-0"></div>

            <Suspense fallback={<CheckEmailLoading />}>
                <CheckEmailContent />
            </Suspense>
        </div>
    );
}
