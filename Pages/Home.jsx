import React, { useEffect } from 'react';
import Navbar from '@/Components/navigation/Navbar';
import ParticlesBackground from '@/Components/effects/ParticlesBackground';
import HeroSection from '@/Components/sections/HeroSection';

export default function Home() {
  useEffect(() => {
    // Smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-gray-950 text-white overflow-x-hidden">
      {/* Particles background */}
      <ParticlesBackground />
      
      {/* Navbar */}
      <Navbar />
      
      {/* Main content */}
      <main>
        {/* Hero */}
        <div id="hero">
          <HeroSection />
        </div>
      </main>
      
      {/* Global gradient overlay */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
    </div>
  );
}
