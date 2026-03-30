import { Router } from 'express';
import {
  register,
  login,
  loginByPhone,
  loginBySms,
  sendSmsCode,
  generateQrcode,
  checkQrcode,
  getMe,
  updatePassword,
} from '../controllers/auth';
import { authenticate } from '../middleware/auth';
import { userRateLimit } from '../middleware/rateLimit';

const router = Router();

router.post('/register', userRateLimit, register);
router.post('/login', userRateLimit, login);
router.post('/login/phone', userRateLimit, loginByPhone);
router.post('/login/sms', userRateLimit, loginBySms);
router.post('/sms/send', userRateLimit, sendSmsCode);
router.post('/qrcode/generate', generateQrcode);
router.post('/qrcode/check', checkQrcode);
router.get('/me', authenticate, getMe);
router.put('/password', authenticate, updatePassword);

export default router;
