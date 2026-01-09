const Donation = require('../models/Donation');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');
const { sendReceiptEmail } = require('../utils/email');
const { SSLCommerzPayment } = require('sslcommerz-lts');
const Stripe = require('stripe');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// @desc    Create new donation
// @route   POST /api/donations/create
// @access  Public
exports.createDonation = catchAsync(async (req, res, next) => {
  const {
    donationType,
    amount,
    donor,
    paymentMethod,
    isAnonymous,
    isMonthly,
    message
  } = req.body;

  // Create donation record
  const donation = await Donation.create({
    donationType,
    amount,
    donor: {
      name: isAnonymous ? 'Anonymous' : donor.name,
      email: donor.email,
      phone: donor.phone,
      address: donor.address,
      country: donor.country || 'Bangladesh',
      city: donor.city,
      postalCode: donor.postalCode
    },
    paymentMethod,
    isAnonymous,
    isMonthly,
    isRecurring: isMonthly,
    message,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Generate payment gateway URL based on selected method
  let paymentData = {
    success: true,
    donation,
    message: 'Donation recorded successfully'
  };

  if (paymentMethod === 'card') {
    // Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents/paisa
      currency: 'bdt',
      metadata: {
        donationId: donation._id.toString(),
        receiptNumber: donation.receiptNumber
      }
    });

    paymentData.clientSecret = paymentIntent.client_secret;
    donation.transactionId = paymentIntent.id;
    donation.paymentGateway = 'stripe';
    await donation.save();

  } else if (paymentMethod === 'mobile' || paymentMethod === 'bank') {
    // SSLCommerz Integration for Bangladesh
    const sslcz = new SSLCommerzPayment(
      process.env.SSLCOMMERZ_STORE_ID,
      process.env.SSLCOMMERZ_STORE_PASSWORD,
      process.env.NODE_ENV === 'production'
    );

    const transactionData = {
      total_amount: amount,
      currency: 'BDT',
      tran_id: donation.receiptNumber,
      success_url: `${process.env.CLIENT_URL}/donation/success/${donation.receiptNumber}`,
      fail_url: `${process.env.CLIENT_URL}/donation/failed/${donation.receiptNumber}`,
      cancel_url: `${process.env.CLIENT_URL}/donation/cancel/${donation.receiptNumber}`,
      ipn_url: `${process.env.API_URL}/api/donations/sslcommerz-ipn`,
      shipping_method: 'NO',
      product_name: `${donationType} Donation`,
      product_category: 'Donation',
      product_profile: 'general',
      cus_name: donor.name,
      cus_email: donor.email,
      cus_add1: donor.address || 'N/A',
      cus_city: donor.city || 'N/A',
      cus_postcode: donor.postalCode || 'N/A',
      cus_country: 'Bangladesh',
      cus_phone: donor.phone,
      multi_card_name: 'internetbank,brac_visa,dbbl_visa,mastercard,visacard,amexcard',
      emi_option: 0,
      emi_max_inst_option: 0
    };

    try {
      const sslResponse = await sslcz.init(transactionData);
      paymentData.paymentUrl = sslResponse.GatewayPageURL;
      donation.transactionId = sslResponse.sessionkey;
      donation.paymentGateway = 'sslcommerz';
      await donation.save();
    } catch (error) {
      console.error('SSLCommerz Error:', error);
      return next(new AppError('Payment gateway error', 500));
    }
  }

  res.status(201).json(paymentData);
});

// @desc    Get donation receipt
// @route   GET /api/donations/receipt/:receiptNumber
// @access  Public
exports.getReceipt = catchAsync(async (req, res, next) => {
  const { receiptNumber } = req.params;

  const donation = await Donation.findOne({ receiptNumber });

  if (!donation) {
    return next(new AppError('Receipt not found', 404));
  }

  // Format receipt data
  const receiptData = {
    receiptNumber: donation.receiptNumber,
    date: donation.donationDate,
    donor: donation.donor,
    donationType: donation.donationType,
    amount: donation.amount,
    currency: donation.currency,
    paymentMethod: donation.paymentMethod,
    paymentStatus: donation.paymentStatus,
    isAnonymous: donation.isAnonymous,
    message: donation.message,
    organization: {
      name: 'An-Najaat Islami Samaj Kallyan Parishad',
      address: 'লাকেশ্বর বাজার, ছাতক, সুনামগঞ্জ',
      email: 'info@an-najaat.org',
      phone: '+880XXXXXXXXXX',
      registration: 'Registered Charity #XXXXXX'
    }
  };

  res.status(200).json({
    status: 'success',
    data: receiptData
  });
});

// @desc    Get donation statistics
// @route   GET /api/donations/stats
// @access  Public
exports.getDonationStats = catchAsync(async (req, res, next) => {
  const stats = await Donation.aggregate([
    {
      $match: {
        paymentStatus: 'completed',
        status: 'active'
      }
    },
    {
      $group: {
        _id: null,
        totalAmount: { $sum: '$amount' },
        totalDonations: { $sum: 1 },
        averageAmount: { $avg: '$amount' },
        byType: {
          $push: {
            type: '$donationType',
            amount: '$amount'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAmount: 1,
        totalDonations: 1,
        averageAmount: 1,
        breakdown: {
          $reduce: {
            input: '$byType',
            initialValue: {},
            in: {
              $mergeObjects: [
                '$$value',
                {
                  $let: {
                    vars: {
                      type: { $toLower: '$$this.type' },
                      amount: '$$this.amount'
                    },
                    in: {
                      $arrayToObject: [[
                        '$$type',
                        {
                          $cond: {
                            if: { $in: ['$$type', { $objectToArray: '$$value' }] },
                            then: { $add: ['$$value.$$type', '$$amount'] },
                            else: '$$amount'
                          }
                        }
                      ]]
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  ]);

  // Monthly breakdown for current year
  const currentYear = new Date().getFullYear();
  const monthlyStats = await Donation.aggregate([
    {
      $match: {
        donationDate: {
          $gte: new Date(`${currentYear}-01-01`),
          $lt: new Date(`${currentYear + 1}-01-01`)
        },
        paymentStatus: 'completed'
      }
    },
    {
      $group: {
        _id: { $month: '$donationDate' },
        amount: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id': 1 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      overall: stats[0] || {
        totalAmount: 0,
        totalDonations: 0,
        averageAmount: 0,
        breakdown: {}
      },
      monthly: monthlyStats
    }
  });
});

// @desc    Get recent donations
// @route   GET /api/donations/recent
// @access  Public
exports.getRecentDonations = catchAsync(async (req, res, next) => {
  const limit = parseInt(req.query.limit) || 10;

  const donations = await Donation.find({
    paymentStatus: 'completed',
    isAnonymous: false
  })
  .sort('-donationDate')
  .limit(limit)
  .select('donationType amount donor.name donationDate isAnonymous message');

  res.status(200).json({
    status: 'success',
    results: donations.length,
    data: donations
  });
});

// @desc    Get all donations (Admin)
// @route   GET /api/donations
// @access  Private/Admin
exports.getAllDonations = catchAsync(async (req, res, next) => {
  const features = new APIFeatures(Donation.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const donations = await features.query;
  const total = await Donation.countDocuments(features.filterObj);

  res.status(200).json({
    status: 'success',
    results: donations.length,
    total,
    data: donations
  });
});

// @desc    Export donations as CSV
// @route   GET /api/donations/export/csv
// @access  Private/Admin
exports.exportDonationsCSV = catchAsync(async (req, res, next) => {
  const donations = await Donation.find({
    paymentStatus: 'completed',
    donationDate: {
      $gte: req.query.startDate || new Date(new Date().getFullYear(), 0, 1),
      $lte: req.query.endDate || new Date()
    }
  }).select('receiptNumber donationDate donationType amount currency donor.name donor.email donor.phone paymentMethod');

  const fields = [
    'receiptNumber',
    'donationDate',
    'donationType',
    'amount',
    'currency',
    'donor.name',
    'donor.email',
    'donor.phone',
    'paymentMethod'
  ];

  const json2csvParser = new Parser({ fields });
  const csv = json2csvParser.parse(donations);

  res.header('Content-Type', 'text/csv');
  res.attachment(`donations-${Date.now()}.csv`);
  res.send(csv);
});

// @desc    Export donations as PDF
// @route   GET /api/donations/export/pdf
// @access  Private/Admin
exports.exportDonationsPDF = catchAsync(async (req, res, next) => {
  const donations = await Donation.find({
    paymentStatus: 'completed',
    donationDate: {
      $gte: req.query.startDate || new Date(new Date().getFullYear(), 0, 1),
      $lte: req.query.endDate || new Date()
    }
  }).sort('donationDate');

  const doc = new PDFDocument({ margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=donations-${Date.now()}.pdf`);

  doc.pipe(res);

  // Header
  doc.fontSize(25).text('An-Najaat Charity', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text('Donation Report', { align: 'center' });
  doc.moveDown();

  // Summary
  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
  doc.fontSize(14).text(`Total Donations: ${donations.length}`);
  doc.text(`Total Amount: BDT ${totalAmount.toLocaleString('bn-BD')}`);
  doc.moveDown();

  // Table header
  const tableTop = doc.y;
  const tableLeft = 50;
  const columnWidth = 100;

  doc.font('Helvetica-Bold');
  doc.text('Receipt No', tableLeft, tableTop);
  doc.text('Date', tableLeft + columnWidth, tableTop);
  doc.text('Type', tableLeft + columnWidth * 2, tableTop);
  doc.text('Amount', tableLeft + columnWidth * 3, tableTop);
  doc.text('Donor', tableLeft + columnWidth * 4, tableTop);

  doc.moveDown();
  doc.font('Helvetica');

  // Table rows
  let y = doc.y;
  donations.forEach((donation, i) => {
    if (y > 700) { // New page if needed
      doc.addPage();
      y = 50;
    }

    doc.text(donation.receiptNumber, tableLeft, y);
    doc.text(donation.donationDate.toLocaleDateString(), tableLeft + columnWidth, y);
    doc.text(donation.donationType, tableLeft + columnWidth * 2, y);
    doc.text(`BDT ${donation.amount}`, tableLeft + columnWidth * 3, y);
    doc.text(donation.donor.name, tableLeft + columnWidth * 4, y);

    y += 20;
  });

  // Footer
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 50, 750, { align: 'center' });

  doc.end();
});

// @desc    Process SSLCommerz IPN
// @route   POST /api/donations/sslcommerz-ipn
// @access  Private/SSLCommerz
exports.processSSLCommerzIPN = catchAsync(async (req, res, next) => {
  const data = req.body;
  
  if (data.status !== 'VALID') {
    return res.status(400).json({ error: 'Invalid payment' });
  }

  const donation = await Donation.findOne({ receiptNumber: data.tran_id });

  if (!donation) {
    return res.status(404).json({ error: 'Donation not found' });
  }

  // Update donation status
  donation.paymentStatus = 'completed';
  donation.gatewayResponse = data;
  donation.paymentGateway = 'sslcommerz';
  await donation.save();

  // Send receipt email
  await sendReceiptEmail(donation);

  // Send success response to SSLCommerz
  res.status(200).json({ status: 'success' });
});

module.exports = exports;