import { Router } from 'express';
import { register, login, refresh, logoutHandler, getMe, updateProfile, updateAvatar, changePassword } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { avatarUpload } from '../../middleware/upload.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateProfile);
router.post('/me/avatar', authenticate, avatarUpload.single('avatar'), updateAvatar);
router.post('/me/password', authenticate, changePassword);

export default router;
