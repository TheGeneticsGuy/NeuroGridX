import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import User from '../models/user.model';

// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Specific fields to send back
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 }); // Newest first
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @route   PUT /api/admin/users/:id/bci-status
// @access  Private/Admin
export const updateUserBciStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body; // 'Verified', 'Rejected', 'Pending', 'None'
    const user = await User.findById(req.params.id);

    if (user) {
      user.bciStatus = status;

      // If verifying, I need to upgrade the role to BCI automatically
      if (status === 'Verified' && user.role === 'Standard') {
          user.role = 'BCI';
      }

      // In case an admin makes a mistake, setting it to rejected will revert the
      // role back dwn
      if ((status === 'Rejected' || status === 'None') && user.role === 'BCI') {
          user.role = 'Standard';
      }

      const updatedUser = await user.save();
      res.json({ message: `User status updated to ${status}`, user: updatedUser });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};