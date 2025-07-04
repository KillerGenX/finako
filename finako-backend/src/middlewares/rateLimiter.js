// Rate limiting middleware untuk prevent abuse
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Basic rate limiter untuk semua endpoints
const basicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Max 1000 requests per IP per window
  message: {
    success: false,
    error: 'Too Many Requests',
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiter untuk authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Max 10 login attempts per IP per window
  message: {
    success: false,
    error: 'Too Many Login Attempts',
    message: 'Too many login attempts from this IP, please try again after 15 minutes.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Register rate limiter (untuk prevent spam registrations)
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  max: 5, // Max 5 registrations per IP per hour
  message: {
    success: false,
    error: 'Registration Limit Exceeded',
    message: 'Too many registration attempts from this IP, please try again after 1 hour.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down middleware untuk gradual throttling
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 menit
  delayAfter: 500, // Mulai delay setelah 500 requests
  delayMs: 500, // Tambah 500ms delay per request
  maxDelayMs: 5000, // Max delay 5 detik
});

module.exports = {
  basicLimiter,
  authLimiter,
  registerLimiter,
  speedLimiter
};
