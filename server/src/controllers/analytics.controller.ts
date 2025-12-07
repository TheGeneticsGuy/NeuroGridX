import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Attempt from '../models/attempt.model';
import User from '../models/user.model';

// @route   GET /api/admin/analytics/global?days=30
// @access  Private/Admin
export const getGlobalAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const { days, role } = req.query;

    // Determine the date filter
    let matchStage: any = {};
    let userQuery: any = {};

    if (days && days !== 'all') {
        const d = parseInt(days as string);
        if (!isNaN(d)) {
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - d);
            matchStage.createdAt = { $gte: startDate };
        }
    }

    // Need to look up the user first
    if (role && role !== 'all') {
        const users = await User.find({ role: role }).select('_id');
        const userIds = users.map(u => u._id);
        matchStage.userId = { $in: userIds };
        userQuery.role = role;
    }

    // Total Attempts per Challenge Type (Filtered by date)
    const attemptsByType = await Attempt.aggregate([
      { $match: matchStage },
      { $group: { _id: "$challengeType", count: { $sum: 1 }, avgScore: { $avg: "$score" } } }
    ]);

    // Activity Over Time (Grouped by Day)
    const activityOverTime = await Attempt.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // User Growth (Total users vs New users in range)
    const totalUsers = await User.countDocuments(userQuery);

    res.json({ attemptsByType, activityOverTime, totalUsers });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   GET /api/admin/analytics/user/:userId
// @access  Private/Admin
export const getUserAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    // Get all attempts for this user, sorted by date
    const attempts = await Attempt.find({ userId }).sort({ createdAt: 1 });

    // Get user details
    const user = await User.findById(userId).select('firstName lastName email');

    res.json({ user, attempts });
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};