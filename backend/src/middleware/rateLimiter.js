/**
 * Rate Limiter Middleware
 * Prevents abuse by limiting the number of requests from a single IP
 */

const rateLimit = require('express-rate-limit');

/**
 * Rate limiter configuration
 * Allows 100 requests per 15 minutes per IP
 * This is a learning-friendly configuration; adjust for production
 */
const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for authentication routes
 * Prevents brute force attacks
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true, // Don't count successful requests
  message: {
    status: 'error',
    message: 'Too many authentication attempts, please try again later.'
  }
});

module.exports = rateLimiter;
module.exports.authRateLimiter = authRateLimiter;
