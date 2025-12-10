'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CheckEmailPage() {
    const searchParams = useSearchParams();
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailParam = searchParams.get('email');
        if (emailParam) {
            setEmail(decodeURIComponent(emailParam));
        }
    }, [searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>

                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Check Your Email</h1>
                    <p className="text-gray-600 mb-6">
                        We've sent a verification link to
                    </p>

                    {email && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <p className="text-lg font-semibold text-gray-900 break-all">{email}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="text-left">
                                <p className="text-sm font-semibold text-blue-900 mb-1">Important:</p>
                                <p className="text-sm text-blue-800">
                                    Click the verification link in the email to complete your registration and automatically log in.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3 text-left mb-6">
                        <h3 className="font-semibold text-gray-900 text-center mb-3">What to do next:</h3>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 font-bold text-sm">1</span>
                            </div>
                            <p className="text-sm text-gray-700">Open your email inbox</p>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 font-bold text-sm">2</span>
                            </div>
                            <p className="text-sm text-gray-700">Look for an email from <strong>Alimentify</strong></p>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 font-bold text-sm">3</span>
                            </div>
                            <p className="text-sm text-gray-700">Click the verification link to complete your registration</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <p className="text-sm text-gray-600 mb-2">Didn't receive the email?</p>
                        <div className="space-y-2 text-xs text-gray-500">
                            <p>• Check your spam or junk folder</p>
                            <p>• Make sure {email || 'your email address'} is correct</p>
                            <p>• Wait a few minutes and refresh your inbox</p>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600">
                            Already verified?{' '}
                            <a href="/auth/login" className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                                Go to login
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
