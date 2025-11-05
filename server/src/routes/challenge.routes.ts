import express from 'express';
import { createAttempt, getMyAttempts  } from '../controllers/challenge.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET
router.route('/attempts/my-attempts').get(protect, getMyAttempts);

// A user MUST be logged in to view their results
// TODO: Add Swagger documentation
// POST
router.route('/attempts').post(protect, createAttempt);

export default router;