const Donation = require('../models/Donation');
const User = require('../models/User');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard/stats
// @access  Private/Admin
exports.getDashboardStats = catchAsync(async (req, res, next) => {
  const today = new Date();
  const startOfToday = new Date(today.setHours(0, 0, 0, 0));
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Total Donations
  const totalDonations = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalCount: { $sum: 1 }
      }
    }
  ]);

  // Today's Donations
  const todayDonations = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: startOfToday }
      }
    },
    {
      $group: {
        _id: null,
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Monthly Donations
  const monthlyDonations = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // Yearly Donations
  const yearlyDonations = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: startOfYear }
      }
    },
    {
      $group: {
        _id: null,
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  // User Statistics
  const userStats = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Recent Donations
  const recentDonations = await Donation.find({ paymentStatus: 'completed' })
    .sort('-createdAt')
    .limit(10)
    .select('donationType amount donor.name createdAt');

  // Upcoming Events
  const upcomingEvents = await Event.find({
    startDate: { $gte: new Date() },
    status: 'published'
  })
  .sort('startDate')
  .limit(5)
  .select('title startDate venue.name');

  const stats = {
    donations: {
      total: totalDonations[0] || { totalAmount: 0, totalCount: 0 },
      today: todayDonations[0] || { amount: 0, count: 0 },
      monthly: monthlyDonations[0] || { amount: 0, count: 0 },
      yearly: yearlyDonations[0] || { amount: 0, count: 0 }
    },
    users: userStats.reduce((acc, stat) => {
      acc[stat._id] = stat.count;
      return acc;
    }, {}),
    recentDonations,
    upcomingEvents,
    charts: {
      monthlyTrend: await getMonthlyTrend(),
      donationTypes: await getDonationTypeDistribution(),
      paymentMethods: await getPaymentMethodDistribution()
    }
  };

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// Helper functions for chart data
async function getMonthlyTrend() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyData = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    },
    {
      $limit: 6
    }
  ]);

  return monthlyData.map(data => ({
    month: `${data._id.year}-${String(data._id.month).padStart(2, '0')}`,
    amount: data.amount,
    count: data.count
  }));
}

async function getDonationTypeDistribution() {
  const distribution = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: '$donationType',
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return distribution;
}

async function getPaymentMethodDistribution() {
  const distribution = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: '$paymentMethod',
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    }
  ]);

  return distribution;
}

// @desc    Get all users with pagination
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const users = await User.find()
    .skip(skip)
    .limit(limit)
    .select('-password')
    .sort('-createdAt');

  const total = await User.countDocuments();

  res.status(200).json({
    status: 'success',
    results: users.length,
    total,
    data: users
  });
});

// @desc    Update user
// @route   PATCH /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const updates = req.body;

  // Remove password from updates
  delete updates.password;
  delete updates.passwordConfirm;

  const user = await User.findByIdAndUpdate(
    id,
    updates,
    {
      new: true,
      runValidators: true
    }
  ).select('-password');

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user
  });
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});