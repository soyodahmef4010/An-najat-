const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  // Event Details
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  titleBangla: {
    type: String,
    required: [true, 'Bangla title is required']
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Event Information
  description: {
    type: String,
    required: [true, 'Event description is required']
  },
  descriptionBangla: String,
  shortDescription: String,
  
  // Event Type
  eventType: {
    type: String,
    enum: ['waz-mahfil', 'seminar', 'workshop', 'distribution', 'other'],
    default: 'waz-mahfil'
  },
  category: {
    type: String,
    enum: ['religious', 'educational', 'social', 'charity']
  },
  
  // Date & Time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: Date,
  startTime: String,
  endTime: String,
  isAllDay: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: String, // daily, weekly, monthly, yearly
  
  // Location
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: {
      type: String,
      default: 'Bangladesh'
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: String,
  
  // Speakers/Organizers
  speakers: [{
    name: String,
    designation: String,
    bio: String,
    image: String
  }],
  organizers: [{
    name: String,
    role: String,
    contact: String
  }],
  
  // Media
  coverImage: {
    type: String,
    required: [true, 'Cover image is required']
  },
  gallery: [{
    url: String,
    caption: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Registration
  requiresRegistration: {
    type: Boolean,
    default: false
  },
  registrationDeadline: Date,
  maxAttendees: Number,
  currentAttendees: {
    type: Number,
    default: 0
  },
  registrationLink: String,
  
  // Donation
  hasDonationTarget: {
    type: Boolean,
    default: false
  },
  donationTarget: Number,
  currentDonations: {
    type: Number,
    default: 0
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredOrder: Number,
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Statistics
  views: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
eventSchema.virtual('duration').get(function() {
  if (this.endDate) {
    const duration = this.endDate - this.startDate;
    const days = Math.ceil(duration / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  return '1 day';
});

eventSchema.virtual('isPast').get(function() {
  return this.endDate ? new Date() > this.endDate : new Date() > this.startDate;
});

eventSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.startDate;
});

eventSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.startDate && (this.endDate ? now <= this.endDate : true);
});

// Pre-save middleware
eventSchema.pre('save', function(next) {
  // Generate slug from title
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }
  
  // Set publishedAt if status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.updatedAt = Date.now();
  next();
});

// Indexes
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ isFeatured: 1 });
eventSchema.index({ eventType: 1 });
eventSchema.index({ slug: 1 }, { unique: true });
eventSchema.index({ 'venue.city': 1 });
eventSchema.index({ createdAt: -1 });

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;