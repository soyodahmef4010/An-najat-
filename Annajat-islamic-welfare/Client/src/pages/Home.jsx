import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { HandHeart, Users, BookOpen, Calendar, ChevronRight, Star } from 'lucide-react';
import HeroSection from '../components/home/HeroSection';
import StatsCounter from '../components/home/StatsCounter';
import QuranAyah from '../components/home/QuranAyah';
import ProgramsGrid from '../components/home/ProgramsGrid';
import DuaSlider from '../components/home/DuaSlider';
import DonationCTA from '../components/home/DonationCTA';

gsap.registerPlugin(ScrollTrigger);

const Home = () => {
  const { t } = useLanguage();
  const sectionRefs = useRef([]);

  useEffect(() => {
    sectionRefs.current.forEach((section) => {
      if (section) {
        gsap.fromTo(
          section,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            scrollTrigger: {
              trigger: section,
              start: 'top 80%',
              end: 'bottom 20%',
              toggleActions: 'play none none reverse',
            },
          }
        );
      }
    });

    // Animate floating elements
    gsap.to('.float-element', {
      y: 20,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut',
    });
  }, []);

  const features = [
    {
      icon: <HandHeart className="w-12 h-12" />,
      title: t('zakatDistribution'),
      description: t('zakatDistributionDesc'),
      color: 'from-emerald-500 to-teal-600',
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: t('socialWelfare'),
      description: t('socialWelfareDesc'),
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: t('islamicEducation'),
      description: t('islamicEducationDesc'),
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: <Calendar className="w-12 h-12" />,
      title: t('annualEvents'),
      description: t('annualEventsDesc'),
      color: 'from-amber-500 to-orange-600',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <HeroSection />

      {/* Stats Counter */}
      <StatsCounter />

      {/* Quran Ayah Section */}
      <QuranAyah />

      {/* Features Section */}
      <section className="section-padding islamic-pattern">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">{t('our')} </span>
              <span className="text-gold-500">{t('missions')}</span>
            </h2>
            <p className="text-xl text-primary-200 max-w-3xl mx-auto">
              {t('missionDescription')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                ref={(el) => (sectionRefs.current[index] = el)}
                className="glass-card hover:transform hover:-translate-y-2 transition-all duration-500 group"
              >
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${feature.color} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-primary-200 mb-6">{feature.description}</p>
                <Link
                  to="/programs"
                  className="inline-flex items-center text-gold-400 hover:text-gold-300 font-semibold group"
                >
                  {t('learnMore')}
                  <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Programs Preview */}
      <ProgramsGrid />

      {/* Dua Slider */}
      <DuaSlider />

      {/* Annual Waz Mahfil Section */}
      <section className="section-padding bg-gradient-to-br from-primary-800 to-primary-900">
        <div className="container-custom">
          <div className="glass-card max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-12">
              <div className="lg:w-1/2">
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 mb-6">
                  <Star className="w-5 h-5 text-gold-500 mr-2" />
                  <span className="text-gold-400 font-semibold">{t('annualEvent')}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  {t('wazMahfil')} <span className="text-gold-500">2024</span>
                </h2>
                <p className="text-xl text-primary-200 mb-8">
                  {t('wazMahfilDescription')}
                </p>
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-primary-900/50 rounded-xl p-4">
                    <div className="text-gold-400 font-bold text-2xl mb-2">১৫-২০</div>
                    <div className="text-primary-200">{t('dates')}</div>
                  </div>
                  <div className="bg-primary-900/50 rounded-xl p-4">
                    <div className="text-gold-400 font-bold text-2xl mb-2">৫০,০০০+</div>
                    <div className="text-primary-200">{t('attendees')}</div>
                  </div>
                </div>
                <Link
                  to="/events"
                  className="btn-gold inline-flex items-center space-x-2"
                >
                  <Calendar className="w-5 h-5" />
                  <span>{t('viewEventDetails')}</span>
                </Link>
              </div>
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gold-500 to-primary-500 rounded-3xl opacity-20 blur-xl"></div>
                  <img
                    src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                    alt="Waz Mahfil Gathering"
                    className="relative rounded-2xl shadow-2xl w-full h-96 object-cover"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-gold-500 to-primary-600 p-6 rounded-2xl shadow-2xl">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">২৩</div>
                      <div className="text-white font-bangla">বছর</div>
                      <div className="text-primary-100 text-sm">সফলতা</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Donation CTA */}
      <DonationCTA />
    </div>
  );
};

export default Home;