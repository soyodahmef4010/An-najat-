import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import gsap from 'gsap';
import { ChevronDown, Heart, Star, Sparkles } from 'lucide-react';

const HeroSection = () => {
  const { t } = useLanguage();
  const heroRef = useRef(null);
  const textRef = useRef(null);
  const ctaRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );
    
    tl.fromTo(textRef.current.querySelectorAll('.hero-text'),
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' },
      '-=0.5'
    );
    
    tl.fromTo(ctaRef.current,
      { opacity: 0, scale: 0.8 },
      { opacity: 1, scale: 1, duration: 0.8, ease: 'back.out(1.7)' }
    );

    // Floating animation for decorative elements
    gsap.to('.float-element', {
      y: 20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });
  }, []);

  const scrollToContent = () => {
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 islamic-pattern opacity-10"></div>
      
      {/* Animated Mosque SVG */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg 
          className="w-full h-full max-w-4xl opacity-5"
          viewBox="0 0 800 400"
        >
          <path
            d="M400,50 L450,100 L550,100 L600,50 L400,50 Z"
            fill="#f5b312"
            stroke="#f5b312"
            strokeWidth="2"
          />
          <path
            d="M350,100 L450,200 L550,200 L650,100 L350,100 Z"
            fill="#3a8d3a"
            stroke="#2d7a2d"
            strokeWidth="2"
          />
          <rect x="375" y="200" width="50" height="150" fill="#2d7a2d" />
          <rect x="475" y="200" width="50" height="150" fill="#2d7a2d" />
        </svg>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 float-element">
        <Star className="w-8 h-8 text-gold-500 opacity-60" />
      </div>
      <div className="absolute top-40 right-20 float-element" style={{ animationDelay: '0.5s' }}>
        <Heart className="w-10 h-10 text-primary-400 opacity-40" />
      </div>
      <div className="absolute bottom-40 left-1/4 float-element" style={{ animationDelay: '1s' }}>
        <Sparkles className="w-12 h-12 text-gold-400 opacity-50" />
      </div>

      <div className="relative z-10 container-custom px-4 text-center" ref={heroRef}>
        <div className="max-w-6xl mx-auto" ref={textRef}>
          {/* Organization Name */}
          <div className="hero-text mb-6">
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-4 font-bangla">
              <span className="text-white">আন্ নাজাত </span>
              <span className="text-gold-500">ইসলামি সমাজ</span>
            </h1>
            <h2 className="text-3xl md:text-4xl text-primary-200 font-bangla">
              কল্যাণ পরিষদ
            </h2>
          </div>

          {/* English Title */}
          <div className="hero-text mb-8">
            <h3 className="text-2xl md:text-3xl text-gold-400 mb-2">
              An-Najaat Islami Social Welfare Council
            </h3>
            <p className="text-xl text-primary-300">
              Serving Humanity Since 2000
            </p>
          </div>

          {/* Tagline */}
          <div className="hero-text mb-12">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary-800/30 to-primary-900/30 border border-primary-700/30 backdrop-blur-sm">
              <span className="text-lg text-primary-200">
                <span className="text-gold-400 font-semibold">"</span>
                সেবাই আমাদের ব্রত, কল্যাণই আমাদের লক্ষ্য
                <span className="text-gold-400 font-semibold">"</span>
              </span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hero-text flex flex-col sm:flex-row gap-6 justify-center" ref={ctaRef}>
            <Link
              to="/donate"
              className="btn-gold text-lg px-8 py-4 flex items-center justify-center space-x-3 group"
            >
              <Heart className="w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
              <span className="font-bold">{t('donateNow')}</span>
            </Link>
            <Link
              to="/programs"
              className="btn-primary text-lg px-8 py-4 border-2 border-primary-600 hover:border-primary-500"
            >
              Our Programs
            </Link>
          </div>

          {/* Stats Preview */}
          <div className="hero-text mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { value: '২৩+', label: 'Years of Service', bnLabel: 'সেবার বছর' },
              { value: '৫০০+', label: 'Programs', bnLabel: 'প্রোগ্রাম' },
              { value: '১০,০০০+', label: 'Families Helped', bnLabel: 'পরিবার সাহায্য' },
              { value: '২৫ কোটি+', label: 'Donations', bnLabel: 'অনুদান' }
            ].map((stat, index) => (
              <div key={index} className="glass-card py-4">
                <div className="text-3xl md:text-4xl font-bold text-gold-500 mb-2">{stat.value}</div>
                <div className="text-primary-300 text-sm">{stat.label}</div>
                <div className="text-primary-400 text-xs font-bangla">{stat.bnLabel}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <button
        onClick={scrollToContent}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce"
      >
        <ChevronDown className="w-8 h-8 text-gold-500" />
      </button>
    </section>
  );
};

export default HeroSection;