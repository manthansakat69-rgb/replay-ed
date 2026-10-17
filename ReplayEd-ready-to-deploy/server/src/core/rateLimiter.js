import { RateLimitError } from './errors.js';

/**
 * In-memory sliding window rate limiter for endpoints such as /api/code/run and /api/events.
 *
 * @param {object} options
 * @param {number} [options.windowMs=60000] - Window length in ms (default 1 min)
 * @param {number} [options.maxRequests=30] - Max allowed requests per window
 * @param {string} [options.message]
 * @returns {import('express').RequestHandler}
 */
export function createRateLimiter({
  windowMs = 60000,
  maxRequests = 30,
  message = 'Too many requests. Please slow down and try again shortly.',
} = {}) {
  const requestHistory = new Map();

  return (req, res, next) => {
    const key = req.ip || req.headers['x-forwarded-for'] || 'anonymous';
    const now = Date.now();

    let timestamps = requestHistory.get(key) || [];
    timestamps = timestamps.filter((t) => now - t < windowMs);

    if (timestamps.length >= maxRequests) {
      return next(new RateLimitError(message));
    }

    timestamps.push(now);
    requestHistory.set(key, timestamps);

    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - timestamps.length));

    next();
  };
}
