import express from 'express';
import {
  registerUser,
  loginUser,
  refreshTokens,
  confirmEmail,
  resendConfirmationEmail,
  getUserProfile,
} from './UserController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshTokens);
router.get('/confirm-email', confirmEmail);
router.post('/resend-email', resendConfirmationEmail);
router.get('/profile', authMiddleware, getUserProfile);
export default router;
