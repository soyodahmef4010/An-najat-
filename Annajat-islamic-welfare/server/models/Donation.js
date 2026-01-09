const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donation Details
  donationType: {
    type: String,
    required: [true, 'Donation type is required'],
    enum: ['zakat', 'sadaqah', 'fidya', 'wazSupport', 'orphanSupport', 'education', 'other']
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [10, 'Minimum donation amount is 10 BDT']
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  
  // Payment Details
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['card', 'mobile', 'bank', 'crypto']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentGateway: {
    type: String,
    enum: ['stripe', 'sslcommerz', 'manual', null],
    default: null
  },
  gatewayResponse: Object,
  
  // Donor Information
  donor: {
    name: {
      type: String,
      required: [true, 'Donor name is required']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required']
    },
    address: String,
    country: {
      type: String,
      default: 'Bangladesh'
    },
    city: String,
    postalCode: String
  },
  
  // Additional Information
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isMonthly: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  message: String,
  
  // System Fields
  receiptNumber: {
    type: String,
    unique: true
  },
  receiptSent: {
    type: Boolean,
    default: false
  },
  emailReceiptId: String,
  
  // Timestamps
  donationDate: {
    type: Date,
    default: Date.now
  },
  nextRecurringDate: Date,
  
  // Admin Fields
  status: {
    type: String,
    enum: ['active', 'verified', 'suspended'],
    default: 'active'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: String,
  
  // Metadata
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Generate receipt number before save
donationSchema.pre('save', async function(next) {
  if (!this.receiptNumber) {
    const year = new Date().getFullYear();
    const count = await mongoose.model('Donation').countDocuments({
      donationDate: {
        $gte: new Date(`${year}-01-01`),
        $lt: new Date(`${year + 1}-01-01`)
      }
    });
    this.receiptNumber = `AN-NJ-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Indexes for performance
donationSchema.index({ donationDate: -1 });
donationSchema.index({ 'donor.email': 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ donationType: 1 });
donationSchema.index({ receiptNumber: 1 }, { unique: true });
donationSchema.index({ isRecurring: 1, nextRecurringDate: 1 });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('bn-BD', {
    style: 'currency',
    currency: this.currency
  }).format(this.amount);
});

// Virtual for display name
donationSchema.virtual('displayName').get(function() {
  return this.isAnonymous ? 'Anonymous Donor' : this.donor.name;
});

// Method to send receipt
donationSchema.methods.sendReceipt = async function() {
  // This would integrate with email service
  console.log(`Sending receipt for donation ${this.receiptNumber} to ${this.donor.email}`);
  return true;
};

const Donation = mongoose.model('Donation', donationSchema);

module.exports = Donation;