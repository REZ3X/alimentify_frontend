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

      {/* Navigation - Floating Pill */}
      <nav className="fixed top-4 left-4 right-4 md:top-6 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-7xl md:px-8 z-50">
        <div className="bg-linear-to-br from-white/80 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] rounded-full p-2 pl-3 flex justify-between items-center w-full relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-[#FAB12F] rounded-full flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-[#FAB12F]/30 border-2 border-white overflow-hidden">
              <img src="/assets/white-icon.png" alt="Alimentify" className="w-5 h-5 object-contain" />
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-1 sm:gap-2 pr-1">
            <Link
              href="/auth/login"
              className="px-3 sm:px-5 py-2 text-gray-600 hover:text-[#FA812F] font-mono font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
            <Link
              href="/auth/register"
              className="px-4 sm:px-6 py-2 sm:py-2.5 bg-[#FA812F] text-white rounded-full font-mono font-bold text-xs sm:text-sm hover:bg-[#FAB12F] transition-all shadow-lg shadow-[#FAB12F]/20 hover:shadow-xl hover:-translate-y-0.5 whitespace-nowrap"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
          <div className="text-center lg:text-left relative z-10">
            
            <h1 className="text-5xl md:text-7xl font-mono font-bold text-gray-900 mb-8 leading-[1.1] tracking-tight">
              Scan Food,<br />
              <span className="text-[#FA812F] relative inline-block">
                Eat Smart.
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#FAB12F] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Instantly analyze calories, macros, and health benefits with our advanced AI. Your personal nutritionist in your pocket.
            </p>
            
            <div className="flex flex-row gap-3 sm:gap-4 items-center justify-center lg:justify-start">
              <Link
                href="/auth/register"
                className="group relative px-4 sm:px-8 py-3 sm:py-4 bg-[#FA812F] text-white rounded-2xl font-mono font-bold overflow-hidden shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <span className="relative z-10 flex items-center gap-2 text-sm sm:text-base">
                  Start Scanning
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </span>
                <div className="absolute inset-0 bg-[#FAB12F] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </Link>
              <Link
                href="#features"
                className="px-4 sm:px-8 py-3 sm:py-4 bg-white text-gray-800 rounded-2xl font-mono font-bold border-2 border-[#FEF3E2] hover:border-[#FAB12F] hover:bg-[#FEF3E2] transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-[#FA812F]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Steps
              </Link>
            </div>

            {/* Mobile Hero Visual */}
            <div className="lg:hidden relative mt-12 mb-8 mx-auto max-w-[300px]">
              <div className="aspect-3/4 bg-gray-900 rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-900 relative transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute inset-0 bg-gray-800">
                  <img src="/images/salad.jpg" alt="Scanning food" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  {/* Camera Viewfinder UI */}
                  <div className="absolute inset-0 z-20 p-5 flex flex-col justify-between pointer-events-none">
                    {/* Top Corners & Status */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 border-t-[3px] border-l-[3px] border-[#FAB12F] rounded-tl-2xl"></div>
                      <div className="bg-black/30 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-2 mt-2">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_#ef4444]"></div>
                        <span className="text-[10px] font-mono font-bold text-white tracking-[0.2em]">AI SCANNING</span>
                      </div>
                      <div className="w-12 h-12 border-t-[3px] border-r-[3px] border-[#FAB12F] rounded-tr-2xl"></div>
                    </div>

                    {/* Center Focus Reticle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-white/20 rounded-3xl">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4">
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/60"></div>
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/60"></div>
                      </div>
                      {/* Corner accents for focus box */}
                      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/60 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-white/60 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-white/60 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/60 rounded-br-lg"></div>
                    </div>

                    {/* Scanning Beam */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-[#FAB12F] to-transparent shadow-[0_0_20px_#FAB12F] animate-[scan_2s_ease-in-out_infinite]"></div>
                  </div>
                  
                  {/* Floating Tags */}
                  <div className="absolute bottom-8 left-4 right-4 z-30">
                    <div className="bg-linear-to-br from-white/80 via-white/40 to-white/20 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] p-4 rounded-2xl transform transition-all animate-fade-in-up relative overflow-hidden">
                      <div className="relative z-10 flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-white/50 rounded-full flex items-center justify-center text-xl shadow-inner backdrop-blur-sm">🥗</div>
                        <div>
                          <div className="font-bold text-gray-900 text-sm drop-shadow-sm">Healthy Salad</div>
                          <div className="text-[#FA812F] text-xs font-bold">320 kcal</div>
                        </div>
                      </div>
                      <div className="relative z-10 w-full bg-gray-200/50 h-1.5 rounded-full overflow-hidden backdrop-blur-sm">
                        <div className="bg-[#FA812F] h-full w-[85%] shadow-[0_0_10px_#FA812F]"></div>
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-8 mb-24">
          {[
            { 
              label: "Active Users", 
              value: "10k+", 
              icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              )
            },
            { 
              label: "Foods Scanned", 
              value: "500k+", 
              icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )
            },
            { 
              label: "Accuracy", 
              value: "99%", 
              icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              )
            },
            { 
              label: "App Rating", 
              value: "4.9/5", 
              icon: (
                <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
              )
            }
          ].map((stat, idx) => (
            <div key={idx} className="relative group">
              <div className="absolute inset-0 bg-[#FAB12F] rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="relative h-full bg-white/60 backdrop-blur-xl border border-white/50 p-4 md:p-8 rounded-2xl text-center hover:-translate-y-1 transition-transform duration-300 shadow-[0_8px_32px_0_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-2">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#FEF3E2] rounded-full flex items-center justify-center text-[#FA812F] mb-1 shadow-inner">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-4xl font-mono font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-600 font-bold uppercase tracking-wider">{stat.label}</div>
              </div>
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
        <div className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] bg-[#FA812F] shadow-2xl mx-4 md:mx-0 mb-12">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-[#FAB12F] rounded-full blur-3xl opacity-40 -translate-y-1/2 translate-x-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-[#FAB12F] rounded-full blur-3xl opacity-40 translate-y-1/2 -translate-x-1/2 animate-pulse delay-700" />
          
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
          
          <div className="relative p-8 md:p-24 text-center z-10">
            <h2 className="text-3xl md:text-6xl font-mono font-bold text-white mb-6 md:mb-8 tracking-tight">Ready to Eat Smarter?</h2>
            <p className="text-lg md:text-xl text-white/90 mb-8 md:mb-12 max-w-2xl mx-auto font-medium">
              Join thousands of users making informed decisions about their nutrition today.
            </p>
            <div className="flex flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/auth/register"
                className="px-6 sm:px-12 py-3.5 sm:py-5 bg-white text-[#FA812F] rounded-2xl font-mono font-bold text-sm sm:text-base hover:bg-[#FEF3E2] transition-all shadow-xl hover:shadow-2xl hover:scale-105 whitespace-nowrap"
              >
                Get Started
              </Link>
              <Link
                href="/auth/login"
                className="px-6 sm:px-12 py-3.5 sm:py-5 bg-[#FA812F] border-2 border-white text-white rounded-2xl font-mono font-bold text-sm sm:text-base hover:bg-[#FAB12F] transition-all shadow-xl hover:shadow-2xl whitespace-nowrap"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white relative pt-24 pb-12 mt-24 overflow-hidden">
        {/* Decorative Top Border/Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-[#FAB12F]/20 to-transparent"></div>
        
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEF3E2] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FAB12F]/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            {/* Brand Section */}
            <div className="lg:col-span-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#FAB12F] rounded-xl flex items-center justify-center shadow-lg shadow-[#FAB12F]/20">
                  <img src="/assets/white-icon.png" alt="Alimentify" className="w-5 h-5 object-contain" />
                </div>
                <h1 className="text-2xl font-mono font-bold text-gray-900 tracking-tight">Alimentify</h1>
              </div>
              <p className="text-gray-500 leading-relaxed mb-8 max-w-md">
                Empowering your health journey with AI-driven nutrition analysis. 
                We believe that understanding what you eat is the first step to a healthier life.
              </p>
              <div className="flex gap-4">
                {/* Social Icons */}
                <a href="#" className="w-10 h-10 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#FA812F] hover:bg-[#FA812F] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#FA812F] hover:bg-[#FA812F] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-[#FEF3E2] flex items-center justify-center text-[#FA812F] hover:bg-[#FA812F] hover:text-white transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" clipRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </a>
              </div>
            </div>

            {/* Links Section */}
            <div className="lg:col-span-3 sm:col-span-6">
              <h4 className="font-mono font-bold text-gray-900 mb-6">Product</h4>
              <ul className="space-y-4">
                {['Features', 'Pricing', 'API', 'Integrations'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 hover:text-[#FA812F] transition-colors font-medium text-sm flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FAB12F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-3 sm:col-span-6">
              <h4 className="font-mono font-bold text-gray-900 mb-6">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-gray-500 hover:text-[#FA812F] transition-colors font-medium text-sm flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FAB12F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400 font-medium">
              &copy; 2025 Alimentify Inc. All rights reserved.
            </p>
            <div className="flex gap-8">
              <a href="#" className="text-sm text-gray-400 hover:text-[#FA812F] transition-colors">Privacy Policy</a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#FA812F] transition-colors">Terms of Service</a>
              <a href="#" className="text-sm text-gray-400 hover:text-[#FA812F] transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
