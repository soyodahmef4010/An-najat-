import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { User, Mail, Phone, MessageSquare, Globe, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DonationForm = ({ donationType, amount, setAmount }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country: 'Bangladesh',
    city: '',
    postalCode: '',
    isAnonymous: false,
    isMonthly: false,
    message: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('card');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error(t('fillRequiredFields'));
      return;
    }

    if (amount < 10) {
      toast.error(t('minimumAmount'));
      return;
    }

    // Create donation payload
    const donationData = {
      type: donationType,
      amount,
      currency: 'BDT',
      donor: {
        name: formData.isAnonymous ? 'Anonymous' : formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        country: formData.country,
        city: formData.city,
        postalCode: formData.postalCode,
      },
      isAnonymous: formData.isAnonymous,
      isMonthly: formData.isMonthly,
      message: formData.message,
      paymentMethod,
      timestamp: new Date().toISOString(),
    };

    try {
      // Here you would typically send to your backend
      console.log('Donation data:', donationData);
      
      // Simulate API call
      toast.success(t('donationProcessing'));
      
      // Redirect to payment gateway
      // window.location.href = `/payment?amount=${amount}&type=${donationType}`;
      
    } catch (error) {
      toast.error(t('donationError'));
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="glass-card">
      <h2 className="text-3xl font-bold mb-6 text-white">{t('donorInformation')}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Donation Amount */}
        <div className="bg-primary-800/30 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{t('donationAmount')}</h3>
              <p className="text-primary-200">{t('enterCustomAmount')}</p>
            </div>
            <div className="text-3xl font-bold text-gold-500">৳ {amount}</div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="range"
                min="10"
                max="100000"
                step="10"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full h-2 bg-primary-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-sm text-primary-300 mt-2">
                <span>৳ 10</span>
                <span>৳ 1,00,000</span>
              </div>
            </div>
            <div className="w-32">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-2 bg-primary-900 border border-primary-700 rounded-lg text-white text-center"
                min="10"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-white font-medium">
              <User className="inline-block w-4 h-4 mr-2" />
              {t('fullName')} *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder={t('enterFullName')}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white font-medium">
              <Mail className="inline-block w-4 h-4 mr-2" />
              {t('emailAddress')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder="example@email.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white font-medium">
              <Phone className="inline-block w-4 h-4 mr-2" />
              {t('phoneNumber')} *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder="+8801XXXXXXXXX"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white font-medium">
              <Globe className="inline-block w-4 h-4 mr-2" />
              {t('country')}
            </label>
            <select
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            >
              <option value="Bangladesh">Bangladesh</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-white font-medium">{t('city')}</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder={t('enterCity')}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white font-medium">{t('postalCode')}</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder="XXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-white font-medium">{t('address')}</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              placeholder={t('enterAddress')}
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAnonymous"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="w-5 h-5 text-gold-500 bg-primary-900 border-primary-700 rounded focus:ring-gold-500 focus:ring-offset-primary-900"
            />
            <label htmlFor="isAnonymous" className="ml-3 text-white">
              {t('donateAnonymously')}
            </label>
          </div>

          {donationType !== 'fidya' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isMonthly"
                name="isMonthly"
                checked={formData.isMonthly}
                onChange={handleInputChange}
                className="w-5 h-5 text-gold-500 bg-primary-900 border-primary-700 rounded focus:ring-gold-500 focus:ring-offset-primary-900"
              />
              <label htmlFor="isMonthly" className="ml-3 text-white">
                {t('makeMonthlyDonation')}
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded">
                  {t('recommended')}
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <label className="block text-white font-medium">
            <MessageSquare className="inline-block w-4 h-4 mr-2" />
            {t('specialInstructions')}
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            rows="3"
            className="w-full px-4 py-3 bg-primary-900/50 border border-primary-700 rounded-lg text-white placeholder-primary-400 focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            placeholder={t('donationMessagePlaceholder')}
          />
        </div>

        {/* Payment Method */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">{t('selectPaymentMethod')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'card', label: t('creditCard'), icon: '💳' },
              { id: 'mobile', label: t('mobileBanking'), icon: '📱' },
              { id: 'bank', label: t('bankTransfer'), icon: '🏦' },
              { id: 'crypto', label: t('crypto'), icon: '₿' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  paymentMethod === method.id
                    ? 'border-gold-500 bg-gold-500/10'
                    : 'border-white/10 hover:border-gold-500/50 hover:bg-white/5'
                }`}
              >
                <div className="text-2xl mb-2">{method.icon}</div>
                <div className="font-medium text-white">{method.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-2xl font-bold text-gold-500">৳ {amount}</div>
              <div className="text-primary-300">{t('totalAmount')}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-primary-300">{t('paymentGatewayFee')}</div>
              <div className="text-lg font-bold text-white">৳ 0.00</div>
            </div>
          </div>
          
          <button
            type="submit"
            className="w-full btn-gold py-4 text-lg"
          >
            {t('proceedToPayment')}
          </button>
          
          <p className="text-center text-primary-300 mt-4 text-sm">
            {t('securePaymentNote')}
          </p>
        </div>
      </form>
    </div>
  );
};

export default DonationForm;