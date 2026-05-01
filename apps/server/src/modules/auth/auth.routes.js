import { Router } from 'express';
import { register, login, refresh, logoutHandler, getMe } from './auth.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', authenticate, logoutHandler);
router.get('/me', authenticate, getMe);

export default router;
