import { Router } from 'express';
import { AuthController } from '../controller/auth.controller.js';
import { validate } from '../middleware/validation.js';
import { registerDto, loginDto, verifyDto, resendVerificationDto } from '../dto/auth.dto.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();
const authController = new AuthController();

router.use(authLimiter);

router.post('/register', validate(registerDto), authController.register);
router.post('/verify', validate(verifyDto), authController.verify);
router.post(
  '/resend-verification',
  validate(resendVerificationDto),
  authController.resendVerificationCode
);
router.post('/login', validate(loginDto), authController.login);
router.post('/refresh', authController.refreshToken);
router.post('/logout', authenticate, authController.logout);

export default router;
