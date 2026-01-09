import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Menu, X, Moon, Sun, Mosque, Donate } from 'lucide-react';
import gsap from 'gsap';

const Navbar = ({ darkMode, setDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('home') },
    { path: '/about', label: t('about') },
    { path: '/programs', label: t('programs') },
    { path: '/gallery', label: t('gallery') },
    { path: '/events', label: t('events') },
    { path: '/donate', label: t('donate') },
    { path: '/contact', label: t('contact') },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) {
      gsap.from('.mobile-menu-item', {
        x: -50,
        opacity: 0,
        stagger: 0.1,
        duration: 0.3,
      });
    }
  }, [isOpen]);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      scrolled ? 'glass-morphism py-2' : 'bg-transparent py-4'
    }`}>
      <div className="container-custom px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <Mosque className="w-10 h-10 text-gold-500 group-hover:text-gold-400 transition-colors duration-300" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 rounded-full animate-pulse-gold"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-white font-bangla">
                আন্ নাজাত ইসলামি সমাজ কল্যাণ পরিষদ
              </span>
              <span className="text-sm text-primary-200">
                An-Najaat Islami Social Welfare Council
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative font-medium transition-colors duration-300 group ${
                  location.pathname === item.path
                    ? 'text-gold-400'
                    : 'text-white hover:text-gold-300'
                }`}
              >
                {item.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gold-500 transition-all duration-300 group-hover:w-full ${
                  location.pathname === item.path ? 'w-full' : ''
                }`}></span>
              </Link>
            ))}

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors duration-300 font-bangla"
            >
              {language === 'bn' ? 'EN' : 'বাংলা'}
            </button>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors duration-300"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-gold-400" />
              ) : (
                <Moon className="w-5 h-5 text-gold-400" />
              )}
            </button>

            {/* Donate Button */}
            <Link
              to="/donate"
              className="btn-gold flex items-center space-x-2"
            >
              <Donate className="w-5 h-5" />
              <span>{t('donateNow')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center space-x-4">
            <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-lg glass-morphism hover:bg-white/10 transition-colors duration-300 font-bangla text-sm"
            >
              {language === 'bn' ? 'EN' : 'বাংলা'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors duration-300"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-white" />
              ) : (
                <Menu className="w-6 h-6 text-white" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden mt-4 pb-4 glass-morphism rounded-2xl">
            <div className="flex flex-col space-y-4 px-4">
              {navItems.map((item, index) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`mobile-menu-item py-3 px-4 rounded-xl transition-colors duration-300 ${
                    location.pathname === item.path
                      ? 'bg-primary-800/50 text-gold-400'
                      : 'text-white hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/donate"
                onClick={() => setIsOpen(false)}
                className="mobile-menu-item btn-gold flex items-center justify-center space-x-2 py-3"
              >
                <Donate className="w-5 h-5" />
                <span>{t('donateNow')}</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;