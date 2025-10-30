import express from 'express';
import { createAttempt } from '../controllers/challenge.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// A means a user MUST be logged in to view their results
// TODO: Add Swagger documentation
router.route('/attempts').post(protect, createAttempt);

export default router;