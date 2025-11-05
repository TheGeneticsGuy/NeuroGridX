import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attempt from '../models/attempt.model';

// @route   POST /api/challenges/attempts
// @access  Private
export const createAttempt = async (req: AuthRequest, res: Response) => {
  const { challengeType, score, completionTime, accuracy, ntpm, averageClickAccuracy } = req.body;
  const userId = req.user._id;

  try {
    const attempt = await Attempt.create({
      userId,
      challengeType,
      score,
      completionTime,
      accuracy,
      ntpm,
      averageClickAccuracy,
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(400).json({ message: 'Invalid data (Attempt)', error: error.message });
  }
};

// This will eventually include
export const getMyAttempts = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: 'User not found, not authorized' });
  }

  try {
    const attempts = await Attempt.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(attempts);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};