'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';

export default function CallbackPage() {
    const [status, setStatus] = useState('processing');
    const [error, setError] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const errorParam = searchParams.get('error');

            if (errorParam) {
                setStatus('error');
                setError('Authentication was cancelled or failed');
                setTimeout(() => router.push('/auth/login'), 3000);
                return;
            }

            if (!code) {
                setStatus('error');
                setError('No authorization code received');
                setTimeout(() => router.push('/auth/login'), 3000);
                return;
            }

            try {
                const response = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/auth/google/callback?code=${code}`
                );

                if (!response.ok) {
                    throw new Error('Authentication failed');
                }

                const data = await response.json();

                if (data.token && data.user) {
                    setStatus('success');
                    login(data.token, data.user);
                } else {
                    throw new Error('Invalid response from server');
                }
            } catch (err) {
                setStatus('error');
                setError(err.message || 'Authentication failed');
                setTimeout(() => router.push('/auth/login'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                {status === 'processing' && (
                    <>
                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authenticating...</h2>
                        <p className="text-gray-600">Please wait while we sign you in</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Success!</h2>
                        <p className="text-gray-600">Redirecting to dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Failed</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <p className="text-sm text-gray-500">Redirecting to login...</p>
                    </>
                )}
            </div>
        </div>
    );
}
