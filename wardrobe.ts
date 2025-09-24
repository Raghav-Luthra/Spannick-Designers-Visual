import React from 'react';
import { ArrowDown, Zap, Flame, Target } from 'lucide-react';

const Hero: React.FC = () => {
  const scrollToProducts = () => {
    const element = document.getElementById('products');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black"></div>
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2Fsvg%22%3E%3Cdefs%3E%3Cpattern%20id%3D%22g[...]
      
      {/* Animated Teal Orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-400/5 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 text-center max-w-5xl mx-auto px-4">
        {/* Brand Logo Placeholder */}
        <div className="mb-8 flex justify-center">
          <div className="relative group">
            <div className="w-48 h-48 relative">{/* Increased from w-32 h-32 to w-48 h-48 */}
              <img 
                src="/PHOTO-2025-09-01-20-56-59-removebg-preview.png" 
                alt="The Gladiator Logo" 
                className="w-full h-full object-contain drop-shadow-2xl group-hover:scale-105 transition-all duration-500"
              />
              <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-2xl group-hover:bg-teal-400/30 group-hover:blur-3xl transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-8xl font-black font-orbitron mb-6 tracking-wider">
          <span className="bg-gradient-to-r from-white via-teal-100 to-white bg-clip-text text-transparent">
            THE
          </span>
          <br />
          <span className="bg-gradient-to-r from-teal-400 via-teal-300 to-teal-400 bg-clip-text text-transparent animate-pulse">
            GLADIATOR
          </span>
        </h1>

        {/* Tagline */}
        <div className="relative mb-12">
          <p className="text-2xl md:text-4xl font-bold text-gray-200 tracking-wide">
            FEEL THE <span className="text-teal-400">FURY</span>
          </p>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent"></div>
        </div>

        {/* Feature Icons */}
        <div className="flex justify-center space-x-12 mb-12">
          <div className="text-center group">
            <Zap className="w-8 h-8 text-teal-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-sm text-gray-300">ENERGIZE</p>
          </div>
          <div className="text-center group">
            <Flame className="w-8 h-8 text-teal-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-sm text-gray-300">IGNITE</p>
          </div>
          <div className="text-center group">
            <Target className="w-8 h-8 text-teal-400 mx-auto mb-2 group-hover:scale-110 transition-transform duration-300" />
            <p className="text-sm text-gray-300">CONQUER</p>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-6">
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Unleash your inner warrior with premium flavored sodas crafted for those who dare to be bold.
          </p>
          
          <button
            onClick={scrollToProducts}
            className="group relative inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-teal-600 to-teal-500 rounded-full font-semibold text-lg transition-all duration-300 hover:[...]
          >
            <span className="mr-2">DISCOVER FLAVORS</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-1 transition-transform duration-300" />
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-teal-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-teal-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
