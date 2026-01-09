import React, { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CreditCard, Smartphone, Bank, QrCode, Shield, CheckCircle, AlertCircle } from 'lucide-react';
import DonationForm from '../components/donation/DonationForm';
import PaymentMethods from '../components/donation/PaymentMethods';
import DonationCalculator from '../components/donation/DonationCalculator';

const Donate = () => {
  const { t } = useLanguage();
  const [selectedType, setSelectedType] = useState('sadaqah');
  const [amount, setAmount] = useState(500);

  const donationTypes = [
    {
      id: 'zakat',
      title: t('zakat'),
      description: t('zakatDescription'),
      percentage: 2.5,
      minAmount: 100,
      icon: '🕌',
    },
    {
      id: 'sadaqah',
      title: t('sadaqah'),
      description: t('sadaqahDescription'),
      minAmount: 10,
      icon: '🤲',
    },
    {
      id: 'fidya',
      title: t('fidya'),
      description: t('fidyaDescription'),
      fixedAmount: 120,
      icon: '🌙',
    },
    {
      id: 'wazSupport',
      title: t('wazSupport'),
      description: t('wazSupportDescription'),
      minAmount: 100,
      icon: '📚',
    },
    {
      id: 'orphanSupport',
      title: t('orphanSupport'),
      description: t('orphanSupportDescription'),
      monthly: true,
      minAmount: 1000,
      icon: '👨‍👩‍👧‍👦',
    },
    {
      id: 'education',
      title: t('educationFund'),
      description: t('educationFundDescription'),
      minAmount: 500,
      icon: '📖',
    },
  ];

  useEffect(() => {
    const selected = donationTypes.find(type => type.id === selectedType);
    if (selected?.fixedAmount) {
      setAmount(selected.fixedAmount);
    }
  }, [selectedType]);

  return (
    <div className="pt-20 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-primary-950/90"></div>
        <div className="absolute inset-0 islamic-pattern"></div>
        <div className="relative container-custom section-padding">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-white">{t('makeA')} </span>
              <span className="text-gold-500">{t('difference')}</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-200 mb-8">
              {t('donationHeroText')}
            </p>
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gold-500/10 border border-gold-500/30">
              <Shield className="w-6 h-6 text-gold-500 mr-3" />
              <span className="text-gold-400 font-semibold">{t('secureDonation')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Donation Types */}
          <div className="lg:col-span-2">
            <div className="glass-card mb-8">
              <h2 className="text-3xl font-bold mb-6 text-white">{t('selectDonationType')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {donationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedType === type.id
                        ? 'border-gold-500 bg-gold-500/10'
                        : 'border-white/10 hover:border-gold-500/50 hover:bg-white/5'
                    }`}
                  >
                    <div className="text-3xl mb-3">{type.icon}</div>
                    <h3 className="font-bold text-white mb-2">{type.title}</h3>
                    <p className="text-sm text-primary-200">{type.description}</p>
                    {type.percentage && (
                      <div className="mt-3 inline-block px-3 py-1 rounded-full bg-primary-800 text-gold-400 text-sm">
                        {type.percentage}% {t('ofWealth')}
                      </div>
                    )}
                    {type.monthly && (
                      <div className="mt-3 inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-sm">
                        {t('monthly')}
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Donation Calculator for Zakat */}
              {selectedType === 'zakat' && (
                <DonationCalculator amount={amount} setAmount={setAmount} />
              )}

              {/* Fixed Amount for Fidya */}
              {selectedType === 'fidya' && (
                <div className="mb-8">
                  <div className="bg-primary-800/30 rounded-xl p-6 border border-gold-500/30">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-white">{t('fidyaAmount')}</h4>
                        <p className="text-primary-200">{t('fidyaExplanation')}</p>
                      </div>
                      <div className="text-3xl font-bold text-gold-500">৳ {amount}</div>
                    </div>
                    <div className="flex items-center text-sm text-gold-400">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {t('fidyaNote')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Donation Form */}
            <DonationForm
              donationType={selectedType}
              amount={amount}
              setAmount={setAmount}
            />
          </div>

          {/* Right Column - Info & Payment */}
          <div className="space-y-8">
            {/* Payment Methods */}
            <PaymentMethods />

            {/* Donation Info */}
            <div className="glass-card">
              <h3 className="text-2xl font-bold mb-4 text-white">{t('donationBenefits')}</h3>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-primary-200">{t('benefit1')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-primary-200">{t('benefit2')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-primary-200">{t('benefit3')}</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="w-5 h-5 text-gold-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-primary-200">{t('benefit4')}</span>
                </li>
              </ul>
            </div>

            {/* Security Assurance */}
            <div className="glass-card border border-gold-500/30">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-gold-500 mr-3" />
                <h3 className="text-xl font-bold text-white">{t('securityAssurance')}</h3>
              </div>
              <p className="text-primary-200 mb-4">
                {t('securityDescription')}
              </p>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-10 bg-white rounded flex items-center justify-center">
                  <span className="font-bold text-primary-900">SSL</span>
                </div>
                <div className="text-sm text-primary-200">
                  {t('encryptedConnection')}
                </div>
              </div>
            </div>

            {/* Quick Donation Amounts */}
            <div className="glass-card">
              <h3 className="text-xl font-bold mb-4 text-white">{t('quickDonate')}</h3>
              <div className="grid grid-cols-3 gap-3">
                {[100, 500, 1000, 2000, 5000, 10000].map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => setAmount(quickAmount)}
                    className={`py-3 rounded-lg transition-all duration-300 ${
                      amount === quickAmount
                        ? 'bg-gold-500 text-primary-900 font-bold'
                        : 'bg-primary-800/50 text-white hover:bg-primary-700'
                    }`}
                  >
                    ৳ {quickAmount}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quranic Verse */}
      <div className="bg-gradient-to-r from-primary-800 to-primary-900">
        <div className="container-custom py-12">
          <div className="max-w-4xl mx-auto text-center">
            <div className="text-4xl text-gold-500 mb-4 font-arabic">﴿ وَمَا تُقَدِّمُوا لِأَنْفُسِكُمْ مِنْ خَيْرٍ تَجِدُوهُ عِنْدَ اللَّهِ ﴾</div>
            <p className="text-xl text-primary-200">
              "And whatever good you put forward for yourselves - you will find it with Allah."
            </p>
            <p className="text-primary-300 mt-2">(Surah Al-Baqarah, 2:110)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Donate;