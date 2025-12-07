import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getGlobalAnalytics, getUserAnalytics } from '../controllers/analytics.controller';

const router = express.Router();

router.use(protect);
router.use(admin);

router.get('/global', getGlobalAnalytics);
router.get('/user/:userId', getUserAnalytics);

export default router;