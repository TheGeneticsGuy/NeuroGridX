import express from 'express';
import { protect, admin } from '../middleware/auth.middleware';
import { getUsers, updateUserBciStatus } from '../controllers/admin.controller';

const router = express.Router();

// Need to protect these routes!
console.log('Protect:', protect);
console.log('Admin:', admin);
router.use(protect);
router.use(admin);

router.route('/users').get(getUsers);
router.route('/users/:id/bci-status').put(updateUserBciStatus);

export default router;