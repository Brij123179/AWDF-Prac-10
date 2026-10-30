import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRegisterInput, validateLoginInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegisterInput, registerUser);
router.post('/login', validateLoginInput, loginUser);
router.get('/me', protect, getMe);

export default router;
