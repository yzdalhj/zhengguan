import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config();

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');
const maxUser = parseInt(process.env.RATE_LIMIT_MAX_USER || '100');
const maxAdmin = parseInt(process.env.RATE_LIMIT_MAX_ADMIN || '30');

export const userRateLimit = rateLimit({
  windowMs,
  max: maxUser,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});

export const adminRateLimit = rateLimit({
  windowMs,
  max: maxAdmin,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});
