import express from 'express';
import { contactController } from '../controllers/contactController.js';
import { validateContactInput } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.get('/', contactController.getAllMessages);
router.post('/', validateContactInput, contactController.submitMessage);

export default router;
