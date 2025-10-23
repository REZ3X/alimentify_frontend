'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authenticating, setAuthenticating] = useState(false);

  useEffect(() => {
    const handleOAuthToken = async () => {
      const token = searchParams.get('token');
      if (token && !user) {
        setAuthenticating(true);
        try {
          api.setToken(token);
          const userData = await api.getCurrentUser();
          login(token, userData);
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
    if (!loading && user && !searchParams.get('token')) {
      router.push('/my');
    }
  }, [user, loading, router, searchParams]);

  if (loading || authenticating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">{authenticating ? 'Completing sign in...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Alimentify</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="px-4 py-2 text-gray-700 hover:text-indigo-600 font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6">
            Scan Your Food,
            <br />
            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Know Your Nutrition
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Use AI-powered image recognition to instantly analyze nutritional content,
            calories, and health benefits of your meals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Start Scanning Now
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-md hover:shadow-lg text-lg border border-gray-200"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div id="features" className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Food Scanning</h3>
            <p className="text-gray-600">
              Simply snap a photo of your meal and get instant nutritional analysis powered by advanced AI.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Detailed Nutrition Info</h3>
            <p className="text-gray-600">
              Get comprehensive breakdowns of calories, macros, vitamins, and health scores for every meal.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Recommendations</h3>
            <p className="text-gray-600">
              Receive personalized suggestions for healthier alternatives and complementary foods.
            </p>
          </div>
        </div>

        <div className="mt-24 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Capture Image</h3>
              <p className="text-gray-600">Take a photo of your food using your camera or upload an existing image</p>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">AI Analysis</h3>
              <p className="text-gray-600">Our AI analyzes the image and identifies nutritional content instantly</p>
            </div>

            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Get Results</h3>
              <p className="text-gray-600">View detailed nutritional information and health recommendations</p>
            </div>
          </div>
        </div>

        <div className="mt-24 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Healthy Journey?</h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are making informed decisions about their nutrition.
          </p>
          <Link
            href="/auth/register"
            className="inline-block px-10 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            Create Free Account
          </Link>
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 mt-24 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-bold text-white">Alimentify</h1>
          </div>
          <p className="mb-4">Powered by AI to help you make better food choices.</p>
          <p className="text-sm">&copy; 2025 Alimentify. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
