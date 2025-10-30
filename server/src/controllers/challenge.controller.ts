import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attempt from '../models/attempt.model';

// @route   POST /api/challenges/attempts
// @access  Private
export const createAttempt = async (req: AuthRequest, res: Response) => {
  const { challengeType, score, completionTime, accuracy } = req.body;
  const userId = req.user._id;

  try {
    const attempt = await Attempt.create({
      userId,
      challengeType,
      score,
      completionTime,
      accuracy,
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid data (Attempt)', error: error.message });
  }
};