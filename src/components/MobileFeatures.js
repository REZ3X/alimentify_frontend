'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const features = [
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
];

export default function MobileFeatures() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-85%"]);

  return (
    <div ref={containerRef} className="md:hidden h-[200vh] relative">
      <div className="sticky top-0 h-dvh flex items-center justify-center overflow-hidden">
        <div className="relative w-full max-w-md mx-4 py-12 bg-white rounded-[3rem] shadow-xl shadow-[#FAB12F]/5 overflow-hidden border border-[#FAB12F]/10">
          {/* Decorative blobs */}
          <div className="absolute inset-0 overflow-hidden rounded-[3rem] pointer-events-none">
            <div className="absolute top-0 left-0 w-64 h-64 bg-[#FEF3E2] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-60"></div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FAB12F]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-12 px-6">
              <span className="text-[#FA812F] font-mono font-bold tracking-wider uppercase text-sm mb-2 block">Features</span>
              <h2 className="text-3xl font-mono font-bold text-gray-900 mb-4">Why Choose Alimentify?</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Advanced technology meets simple design to help you achieve your health goals.
              </p>
            </div>

            <div className="overflow-hidden">
              <motion.div style={{ x }} className="flex gap-6 px-6 w-max">
                {features.map((feature, idx) => (
                  <div key={idx} className="w-[75vw] p-6 rounded-3xl bg-[#FEF3E2]/50 border border-[#FAB12F]/20 backdrop-blur-sm">
                    <div className="w-12 h-12 bg-[#FAB12F] rounded-xl flex items-center justify-center mb-4 text-white shadow-lg shadow-[#FAB12F]/30">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-mono font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.desc}
                    </p>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
