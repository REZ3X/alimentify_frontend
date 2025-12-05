'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import Link from 'next/link';
import MobileFeatures from '@/components/MobileFeatures';

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
      <div className="min-h-screen flex items-center justify-center bg-[#FEF3E2]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#FAB12F] border-t-[#FA812F] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#FA812F] font-mono">{authenticating ? 'Completing sign in...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEF3E2] text-gray-800 font-sans selection:bg-[#FAB12F] selection:text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 opacity-40 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#FAB12F 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

      {/* Navigation */}
      <nav className="fixed w-full bg-[#FEF3E2]/80 backdrop-blur-md z-50 border-b border-[#FAB12F]/20 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FAB12F] rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-[#FAB12F]/30 border-2 border-white">
              <span className="text-white font-mono font-bold text-xl">A</span>
            </div>
            <h1 className="text-2xl font-mono font-bold text-gray-900 tracking-tighter">Alimentify</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/auth/login"
              className="hidden sm:block px-4 py-2 text-gray-700 hover:text-[#FA812F] font-mono font-medium transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-6 py-2 bg-[#FA812F] text-white rounded-xl font-mono font-medium hover:bg-[#FAB12F] transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 border-2 border-transparent hover:border-[#FEF3E2]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-left relative z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white border border-[#FAB12F]/30 rounded-full shadow-sm animate-fade-in-up">
              <span className="w-2 h-2 rounded-full bg-[#FA812F] animate-pulse"></span>
              <span className="text-[#FA812F] font-mono text-xs font-bold tracking-wide uppercase">AI-Powered Nutrition Analysis</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-mono font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
              Scan Food.<br />
              <span className="text-[#FA812F] relative inline-block">
                Eat Smart.
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#FAB12F] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              Instantly analyze calories, macros, and health benefits with our advanced AI. Your personal nutritionist in your pocket.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register"
                className="group relative px-8 py-4 bg-[#FA812F] text-white rounded-2xl font-mono font-bold overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Start Scanning
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
                <div className="absolute inset-0 bg-[#FAB12F] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
              <Link
                href="#features"
                className="px-8 py-4 bg-white text-gray-800 rounded-2xl font-mono font-bold border-2 border-[#FEF3E2] hover:border-[#FAB12F] hover:bg-[#FEF3E2] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 text-[#FA812F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Demo
              </Link>
            </div>

            {/* Mobile Hero Visual */}
            <div className="lg:hidden relative mt-12 mb-8 mx-auto max-w-[300px]">
              <div className="aspect-3/4 bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-900 relative transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gray-800">
                  <img src="/images/salad.jpg" alt="Scanning food" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  {/* Camera Viewfinder UI */}
                  <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-[#FAB12F] shadow-[0_0_20px_#FAB12F] animate-[scan_2s_ease-in-out_infinite] z-10"></div>
                  
                  {/* Floating Tags */}
                  <div className="absolute bottom-8 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg transform transition-all animate-fade-in-up">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#FEF3E2] rounded-full flex items-center justify-center text-xl">🥗</div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm">Healthy Salad</div>
                          <div className="text-[#FA812F] text-xs font-bold">320 kcal</div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-[#FA812F] h-full w-[85%]"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative blobs behind */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#FAB12F]/30 rounded-full blur-3xl -z-10"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-[#FA812F]/30 rounded-full blur-3xl -z-10"></div>
            </div>
          </div>

          {/* Abstract App Visualization */}
          <div className="relative hidden lg:block h-[600px] w-full">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FAB12F]/20 rounded-full blur-3xl animate-pulse" />
            
            {/* Phone Frame */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[640px] bg-white rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden transform rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
              {/* Screen Content */}
              <div className="w-full h-full bg-gray-50 relative">
                {/* Header */}
                <div className="h-24 bg-[#FA812F] rounded-b-3xl p-6 flex justify-between items-end pb-4">
                  <div className="w-8 h-8 bg-white/20 rounded-full backdrop-blur-sm" />
                  <div className="w-24 h-4 bg-white/20 rounded-full backdrop-blur-sm" />
                </div>
                
                {/* Food Image Placeholder */}
                <div className="mx-6 -mt-8 h-48 bg-gray-200 rounded-2xl shadow-lg relative overflow-hidden group">
                   <img src="/images/salad.jpg" alt="Food analysis" className="w-full h-full object-cover" />
                   {/* Scanning Line */}
                   <div className="absolute top-0 left-0 w-full h-1 bg-[#FAB12F] shadow-[0_0_15px_#FAB12F] animate-[scan_2s_ease-in-out_infinite]" />
                </div>

                {/* Stats Cards */}
                <div className="p-6 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="text-xs text-gray-400 font-mono mb-1">CALORIES</div>
                    <div className="text-xl font-bold text-gray-800">320</div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm">
                    <div className="text-xs text-gray-400 font-mono mb-1">PROTEIN</div>
                    <div className="text-xl font-bold text-[#FA812F]">24g</div>
                  </div>
                  <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#FEF3E2] flex items-center justify-center text-xl">🥗</div>
                    <div>
                      <div className="font-bold text-gray-800">Healthy Choice</div>
                      <div className="text-xs text-gray-500">High in fiber & vitamins</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute top-20 right-20 bg-white p-4 rounded-2xl shadow-xl animate-bounce delay-100">
              <span className="text-2xl">🥑</span>
            </div>
            <div className="absolute bottom-40 left-10 bg-white p-4 rounded-2xl shadow-xl animate-bounce delay-300">
              <span className="text-2xl">🍎</span>
            </div>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-y border-[#FAB12F]/20 bg-white/40 backdrop-blur-sm rounded-3xl mb-24">
          {[
            { label: "Active Users", value: "10k+" },
            { label: "Foods Scanned", value: "500k+" },
            { label: "Accuracy", value: "99%" },
            { label: "App Rating", value: "4.9/5" }
          ].map((stat, idx) => (
            <div key={idx} className="text-center">
              <div className="text-3xl md:text-4xl font-mono font-bold text-[#FA812F] mb-1">{stat.value}</div>
              <div className="text-sm text-gray-600 font-medium uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Section */}
        <MobileFeatures />
        
        <div id="features" className="hidden md:block relative py-24 bg-white rounded-[3rem] shadow-xl shadow-[#FAB12F]/5 mx-4 md:mx-0 mb-32">
          {/* Decorative blobs - Wrapped to prevent overflow issues with sticky */}
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEF3E2] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FAB12F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <span className="text-[#FA812F] font-mono font-bold tracking-wider uppercase text-sm mb-2 block">Features</span>
              <h2 className="text-4xl md:text-5xl font-mono font-bold text-gray-900 mb-6">Why Choose Alimentify?</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                Advanced technology meets simple design to help you achieve your health goals.
              </p>
            </div>
            
            {/* Desktop Grid View */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Instant Scanning",
                  desc: "Snap a photo and get instant nutritional analysis powered by advanced AI.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )
                },
                {
                  title: "Detailed Info",
                  desc: "Comprehensive breakdowns of calories, macros, vitamins, and health scores.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  title: "Smart Advice",
                  desc: "Personalized suggestions for healthier alternatives and complementary foods.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                }
              ].map((feature, idx) => (
                <div key={idx} className="group relative p-8 rounded-3xl bg-[#FEF3E2]/30 border border-[#FAB12F]/20 hover:bg-[#FEF3E2] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <div className="w-14 h-14 bg-[#FAB12F] rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-[#FAB12F]/30 group-hover:scale-110 transition-transform duration-300 rotate-3 group-hover:rotate-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-mono font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.desc}
                  </p>
                  <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                    <svg className="w-6 h-6 text-[#FA812F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-32 relative">
          <div className="text-center mb-20">
            <span className="text-[#FA812F] font-mono font-bold tracking-wider uppercase text-sm mb-2 block">Workflow</span>
            <h2 className="text-4xl md:text-5xl font-mono font-bold text-gray-900 mb-6">Simple Steps to Health</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              From photo to nutritional facts in seconds.
            </p>
          </div>
          
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connecting Line (Desktop) */}
              <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-linear-to-r from-[#FAB12F]/20 via-[#FAB12F] to-[#FAB12F]/20 border-t-2 border-dashed border-[#FAB12F] -z-10"></div>
              {/* Connecting Line (Mobile) */}
              <div className="md:hidden absolute top-12 bottom-12 left-1/2 w-0.5 bg-linear-to-b from-[#FAB12F]/20 via-[#FAB12F] to-[#FAB12F]/20 border-l-2 border-dashed border-[#FAB12F] -z-10 -translate-x-1/2"></div>
              
              {[
                { step: "01", title: "Capture", desc: "Take a photo of your food using our smart camera." },
                { step: "02", title: "Analyze", desc: "AI identifies ingredients and calculates nutrition." },
                { step: "03", title: "Results", desc: "Get detailed insights and health recommendations." }
              ].map((item, idx) => (
                <div key={idx} className="relative flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8 relative z-10 shadow-xl shadow-[#FAB12F]/10 group-hover:scale-110 transition-transform duration-300 border-4 border-[#FEF3E2]">
                    <span className="text-3xl font-mono font-bold text-[#FA812F]">{item.step}</span>
                    {/* Orbiting dot */}
                    <div className="absolute inset-0 rounded-full border border-[#FAB12F]/30 animate-[spin_4s_linear_infinite]" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FAB12F] rounded-full" />
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-[#FAB12F]/10 w-full hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                    <h3 className="text-xl font-mono font-bold text-gray-900 mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="relative overflow-hidden rounded-[3rem] bg-[#FA812F] shadow-2xl mx-4 md:mx-0">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FAB12F] rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FAB12F] rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 animate-pulse delay-700" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative p-12 md:p-24 text-center z-10">
            <h2 className="text-4xl md:text-6xl font-mono font-bold text-white mb-8 tracking-tight">Ready to Eat Smarter?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of users making informed decisions about their nutrition today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="inline-block px-12 py-5 bg-white text-[#FA812F] rounded-2xl font-mono font-bold hover:bg-[#FEF3E2] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
              >
                Create Free Account
              </Link>
              <Link
                href="/auth/login"
                className="inline-block px-12 py-5 bg-[#FA812F] border-2 border-white text-white rounded-2xl font-mono font-bold hover:bg-[#FAB12F] transition-all shadow-xl hover:shadow-2xl"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-[#FAB12F]/20 mt-12 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FAB12F] rounded-xl flex items-center justify-center">
                  <span className="text-white font-mono font-bold text-xl">A</span>
                </div>
                <h1 className="text-2xl font-mono font-bold text-gray-900">Alimentify</h1>
              </div>
              <p className="text-gray-600 max-w-sm">
                Empowering your health journey with AI-driven nutrition analysis. Make every meal count.
              </p>
            </div>
            <div>
              <h4 className="font-mono font-bold text-gray-900 mb-4">Product</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-[#FA812F]">Features</a></li>
                <li><a href="#" className="hover:text-[#FA812F]">Pricing</a></li>
                <li><a href="#" className="hover:text-[#FA812F]">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-mono font-bold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2 text-gray-600">
                <li><a href="#" className="hover:text-[#FA812F]">About</a></li>
                <li><a href="#" className="hover:text-[#FA812F]">Blog</a></li>
                <li><a href="#" className="hover:text-[#FA812F]">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-mono">&copy; 2025 Alimentify. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-400 hover:text-[#FA812F]">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-[#FA812F]">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
