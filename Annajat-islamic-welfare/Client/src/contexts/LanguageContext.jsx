import React, { createContext, useState, useContext, useEffect } from 'react';

// English translations
const en = {
  // Navigation
  home: 'Home',
  about: 'About Us',
  programs: 'Programs',
  gallery: 'Gallery',
  events: 'Events',
  donate: 'Donate',
  contact: 'Contact',
  donateNow: 'Donate Now',
  
  // Home Page
  our: 'Our',
  missions: 'Missions',
  missionDescription: 'Serving humanity through Islamic principles since 2000',
  zakatDistribution: 'Zakat Distribution',
  zakatDistributionDesc: 'Systematic distribution of Zakat to eligible recipients',
  socialWelfare: 'Social Welfare',
  socialWelfareDesc: 'Comprehensive support for underprivileged families',
  islamicEducation: 'Islamic Education',
  islamicEducationDesc: 'Quran and Islamic studies for all ages',
  annualEvents: 'Annual Events',
  annualEventsDesc: 'Large scale religious gatherings and programs',
  learnMore: 'Learn More',
  annualEvent: 'Annual Event',
  wazMahfil: 'Waz Mahfil',
  wazMahfilDescription: 'Annual religious gathering with renowned Islamic scholars',
  dates: 'Dates',
  attendees: 'Attendees',
  viewEventDetails: 'View Event Details',
  
  // Donation Page
  makeA: 'Make a',
  difference: 'Difference',
  donationHeroText: 'Your donation can change lives. Give with sincerity.',
  secureDonation: '100% Secure Donation',
  selectDonationType: 'Select Donation Type',
  zakat: 'Zakat',
  zakatDescription: 'Obligatory charity (2.5% of wealth)',
  sadaqah: 'Sadaqah',
  sadaqahDescription: 'Voluntary charity for blessings',
  fidya: 'Fidya',
  fidyaDescription: 'Compensation for missed fasts',
  wazSupport: 'Waz Mahfil Support',
  wazSupportDescription: 'Support our annual religious gathering',
  orphanSupport: 'Orphan Support',
  orphanSupportDescription: 'Monthly support for orphan children',
  educationFund: 'Education Fund',
  educationFundDescription: 'Support educational programs',
  ofWealth: 'of Wealth',
  monthly: 'Monthly',
  fidyaAmount: 'Fidya Amount',
  fidyaExplanation: 'Per day compensation for missed obligatory fasts',
  fidyaNote: 'Amount based on current food prices',
  donationBenefits: 'Benefits of Your Donation',
  benefit1: 'Purifies wealth and increases blessings',
  benefit2: 'Helps eradicate poverty from community',
  benefit3: 'Earns continuous rewards (Sadaqah Jariyah)',
  benefit4: 'Supports Islamic education and dawah',
  securityAssurance: 'Security Assurance',
  securityDescription: 'Your payment information is encrypted and secure',
  encryptedConnection: '256-bit SSL Encrypted',
  quickDonate: 'Quick Donate',
  
  // Donation Form
  donorInformation: 'Donor Information',
  donationAmount: 'Donation Amount',
  enterCustomAmount: 'Enter custom amount or use slider',
  fullName: 'Full Name',
  enterFullName: 'Enter your full name',
  emailAddress: 'Email Address',
  phoneNumber: 'Phone Number',
  country: 'Country',
  city: 'City',
  enterCity: 'Enter city',
  postalCode: 'Postal Code',
  address: 'Address',
  enterAddress: 'Enter your address',
  donateAnonymously: 'Donate anonymously',
  makeMonthlyDonation: 'Make this a monthly donation',
  recommended: 'Recommended',
  specialInstructions: 'Special Instructions',
  donationMessagePlaceholder: 'Any special instructions for your donation...',
  selectPaymentMethod: 'Select Payment Method',
  creditCard: 'Credit Card',
  mobileBanking: 'Mobile Banking',
  bankTransfer: 'Bank Transfer',
  crypto: 'Cryptocurrency',
  totalAmount: 'Total Amount',
  paymentGatewayFee: 'Payment Gateway Fee',
  proceedToPayment: 'Proceed to Payment',
  securePaymentNote: 'Secure payment processed by SSLCommerz',
  
  // Common
  fillRequiredFields: 'Please fill all required fields',
  minimumAmount: 'Minimum donation amount is ৳10',
  donationProcessing: 'Processing your donation...',
  donationError: 'Error processing donation. Please try again.',
};

// Bangla translations
const bn = {
  // Navigation
  home: 'হোম',
  about: 'আমাদের সম্পর্কে',
  programs: 'প্রোগ্রাম',
  gallery: 'গ্যালারী',
  events: 'ইভেন্ট',
  donate: 'দান করুন',
  contact: 'যোগাযোগ',
  donateNow: 'অনুদান করুন',
  
  // Home Page
  our: 'আমাদের',
  missions: 'মিশন',
  missionDescription: '২০০০ সাল থেকে ইসলামিক নীতির মাধ্যমে মানবতা সেবা',
  zakatDistribution: 'যাকাত বিতরণ',
  zakatDistributionDesc: 'যোগ্য প্রাপকদের কাছে যাকাতের ব্যবস্থাপত্র বিতরণ',
  socialWelfare: 'সামাজিক কল্যাণ',
  socialWelfareDesc: 'অসচ্ছল পরিবারের জন্য সমন্বিত সহায়তা',
  islamicEducation: 'ইসলামিক শিক্ষা',
  islamicEducationDesc: 'সব বয়সের জন্য কুরআন ও ইসলামিক শিক্ষা',
  annualEvents: 'বার্ষিক ইভেন্ট',
  annualEventsDesc: 'বৃহৎ আকারের ধর্মীয় সমাবেশ ও প্রোগ্রাম',
  learnMore: 'বিস্তারিত জানুন',
  annualEvent: 'বার্ষিক ইভেন্ট',
  wazMahfil: 'ওয়াজ মাহফিল',
  wazMahfilDescription: 'প্রখ্যাত ইসলামিক স্কলারদের সাথে বার্ষিক ধর্মীয় সমাবেশ',
  dates: 'তারিখ',
  attendees: 'অংশগ্রহণকারী',
  viewEventDetails: 'ইভেন্ট বিস্তারিত দেখুন',
  
  // Donation Page
  makeA: 'একটি',
  difference: 'পরিবর্তন করুন',
  donationHeroText: 'আপনার দান জীবন বদলে দিতে পারে। খাঁটি নিয়তে দান করুন।',
  secureDonation: '১০০% সুরক্ষিত দান',
  selectDonationType: 'দানের ধরন নির্বাচন করুন',
  zakat: 'যাকাত',
  zakatDescription: 'ফরজ দান (সম্পদের ২.৫%)',
  sadaqah: 'সদকা',
  sadaqahDescription: 'বারাকাতের জন্য স্বেচ্ছাসেবী দান',
  fidya: 'ফিদিয়া',
  fidyaDescription: 'ছুটে যাওয়া রোজার ক্ষতিপূরণ',
  wazSupport: 'ওয়াজ মাহফিল সহায়তা',
  wazSupportDescription: 'আমাদের বার্ষিক ধর্মীয় সমাবেশে সহায়তা করুন',
  orphanSupport: 'এতিম সহায়তা',
  orphanSupportDescription: 'এতিম শিশুদের জন্য মাসিক সহায়তা',
  educationFund: 'শিক্ষা তহবিল',
  educationFundDescription: 'শিক্ষামূলক প্রোগ্রাম সমর্থন করুন',
  ofWealth: 'সম্পদের',
  monthly: 'মাসিক',
  fidyaAmount: 'ফিদিয়া পরিমাণ',
  fidyaExplanation: 'ফরজ রোজা ছুটে যাওয়ার দৈনিক ক্ষতিপূরণ',
  fidyaNote: 'বর্তমান খাদ্য মূল্যের ভিত্তিতে পরিমাণ',
  donationBenefits: 'আপনার দানের সুবিধা',
  benefit1: 'সম্পদ পবিত্র করে এবং বারাকাত বৃদ্ধি করে',
  benefit2: 'সম্প্রদায় থেকে দারিদ্র্য দূর করতে সাহায্য করে',
  benefit3: 'নিরবিচ্ছিন্ন প্রতিদান (সদকায়ে জারিয়া) অর্জন করে',
  benefit4: 'ইসলামিক শিক্ষা ও দাওয়াহ সমর্থন করে',
  securityAssurance: 'সুরক্ষা নিশ্চয়তা',
  securityDescription: 'আপনার পেমেন্ট তথ্য এনক্রিপ্ট এবং সুরক্ষিত',
  encryptedConnection: '২৫৬-বিট SSL এনক্রিপ্টেড',
  quickDonate: 'দ্রুত দান',
  
  // Donation Form
  donorInformation: 'দাতার তথ্য',
  donationAmount: 'দানের পরিমাণ',
  enterCustomAmount: 'কাস্টম পরিমাণ লিখুন বা স্লাইডার ব্যবহার করুন',
  fullName: 'পূর্ণ নাম',
  enterFullName: 'আপনার পূর্ণ নাম লিখুন',
  emailAddress: 'ইমেল ঠিকানা',
  phoneNumber: 'ফোন নম্বর',
  country: 'দেশ',
  city: 'শহর',
  enterCity: 'শহর লিখুন',
  postalCode: 'পোস্টাল কোড',
  address: 'ঠিকানা',
  enterAddress: 'আপনার ঠিকানা লিখুন',
  donateAnonymously: 'বেনামে দান করুন',
  makeMonthlyDonation: 'এটিকে মাসিক দান করুন',
  recommended: 'সুপারিশকৃত',
  specialInstructions: 'বিশেষ নির্দেশনা',
  donationMessagePlaceholder: 'আপনার দানের জন্য বিশেষ নির্দেশনা...',
  selectPaymentMethod: 'পেমেন্ট পদ্ধতি নির্বাচন করুন',
  creditCard: 'ক্রেডিট কার্ড',
  mobileBanking: 'মোবাইল ব্যাংকিং',
  bankTransfer: 'ব্যাংক ট্রান্সফার',
  crypto: 'ক্রিপ্টোকারেন্সি',
  totalAmount: 'মোট পরিমাণ',
  paymentGatewayFee: 'পেমেন্ট গেটওয়ে ফি',
  proceedToPayment: 'পেমেন্ট করতে এগিয়ে যান',
  securePaymentNote: 'SSLCommerz দ্বারা সুরক্ষিত পেমেন্ট প্রক্রিয়াকরণ',
  
  // Common
  fillRequiredFields: 'অনুগ্রহ করে সমস্ত প্রয়োজনীয় ক্ষেত্র পূরণ করুন',
  minimumAmount: 'ন্যূনতম দানের পরিমাণ ৳১০',
  donationProcessing: 'আপনার দান প্রক্রিয়াকরণ হচ্ছে...',
  donationError: 'দান প্রক্রিয়াকরণে ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।',
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('bn');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('charity-language');
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('charity-language', newLanguage);
  };

  const t = (key) => {
    return language === 'en' ? en[key] || key : bn[key] || en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);