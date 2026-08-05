import rateLimit from 'express-rate-limit';

// Strict limit for credential endpoints only (login/register/password reset)
// — brute-force protection. Must NOT cover routine authenticated routes like
// /auth/me, which the frontend calls on every page mount; putting those under
// this limiter locks real users out of login itself.
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limit
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
