const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendEmail } = require('../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res.cookie('jwt', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, phone, password, passwordConfirm } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User already exists with this email', 400));
  }

  // Create new user
  const newUser = await User.create({
    name,
    email,
    phone,
    password,
    passwordConfirm
  });

  // Create verification token
  const verificationToken = newUser.createVerificationToken();
  await newUser.save({ validateBeforeSave: false });

  // Send verification email
  const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email/${verificationToken}`;
  
  try {
    await sendEmail({
      email: newUser.email,
      subject: 'Verify your email address',
      template: 'verification',
      context: {
        name: newUser.name,
        verificationUrl
      }
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    newUser.verificationToken = undefined;
    newUser.verificationTokenExpires = undefined;
    await newUser.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the verification email. Please try again later.', 500));
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check if user exists and password is correct
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // Check if account is locked
  if (user.isLocked()) {
    return next(new AppError('Account is temporarily locked. Please try again later.', 423));
  }

  // Check if email is verified
  if (!user.isVerified) {
    return next(new AppError('Please verify your email address first', 401));
  }

  // Reset login attempts on successful login
  if (user.loginAttempts > 0 || user.lockUntil) {
    await user.updateOne({
      $set: { loginAttempts: 0 },
      $unset: { lockUntil: 1 }
    });
  }

  createSendToken(user, 200, res);
});

// @desc    Logout user
// @route   GET /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  // Get hashed token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Email verified successfully'
  });
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  
  if (!user) {
    return next(new AppError('There is no user with that email address', 404));
  }

  // Generate reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send reset email
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  
  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 minutes)',
      template: 'password-reset',
      context: {
        name: user.name,
        resetUrl
      }
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('There was an error sending the email. Please try again later.', 500));
  }
});

// @desc    Reset password
// @route   PATCH /api/auth/reset-password/:token
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get user based on token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  // Set new password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Log the user in
  createSendToken(user, 200, res);
});

// @desc    Update password
// @route   PATCH /api/auth/update-password
// @access  Private
exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // Check if current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  // Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  createSendToken(user, 200, res);
});

// @desc    Protect routes - authentication middleware
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  
  // Get token from headers or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  // Verify token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Check if user changed password after token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User recently changed password. Please log in again.', 401));
  }

  // Check if user is active
  if (!currentUser.isActive) {
    return next(new AppError('Your account has been deactivated.', 401));
  }

  // Grant access to protected route
  req.user = currentUser;
  next();
});

// @desc    Restrict to certain roles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: 'donations',
    options: { sort: { donationDate: -1 }, limit: 10 }
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

module.exports = exports;