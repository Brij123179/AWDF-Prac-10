import express from 'express';
import { eventController } from '../controllers/eventController.js';

const router = express.Router();

router.get('/logs', eventController.getLogs);
router.delete('/logs', eventController.clearLogs);
router.post('/config', eventController.updateConfig);
router.post('/trigger-error', eventController.triggerError);

export default router;

