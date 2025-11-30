import { Request, Response } from 'express';
import { Types } from 'mongoose'; // Had to import this to resolve TS's issue with not knowing mongoose types
import User from '../models/user.model';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth.middleware';

// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName, isBciApplicant, bciCompany  } = req.body;

  try {
    const userExists = await User.findOne({ email }); // No need to register if they already have!!

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // need to determine BCI status
    let bciStatus = 'None';
    let companyToSave = undefined;

    if (isBciApplicant) {
        bciStatus = 'Pending';
        companyToSave = bciCompany || 'Neuralink'; // Default if somehow missed
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'Standard',
      bciStatus,        // 'None' or 'Pending' as above...
      bciCompany: companyToSave,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
        bciStatus: user.bciStatus,  // Immediate status which is nice.
        token: generateToken((user._id as Types.ObjectId).toString(), user.role),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        token: generateToken((user._id as Types.ObjectId).toString(), user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req: AuthRequest, res: Response) => {
  // Note: The "USER" object is already attached to the request by the 'protect' middleware function
  if (req.user) {
    res.json({
      _id: req.user._id,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      email: req.user.email,
      role: req.user.role,
      bio: req.user.bio,
      avatarUrl: req.user.avatarUrl,
      phone: req.user.phone,
      bciStatus: req.user.bciStatus || 'None',
      bciCompany: req.user.bciCompany || '',
      createdAt: req.user.createdAt,
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    // BCI Request Verification
    if (!user.bciStatus) user.bciStatus = 'None';
    const wasBciApplicant = user.bciStatus !== 'None'; // None is default status
    const isNowBciApplicant = req.body.isBciApplicant === true; // Gettin flag from frontend

    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio ?? user.bio; // Keeping optional like most profiles - STRETCH goal to build profile page that you can share.
    user.phone = req.body.phone ?? user.phone;

    if (isNowBciApplicant) {
        const newCompany = req.body.bciCompany || 'Neuralink';

        // Check if company changed
        if (user.bciCompany !== newCompany) {
            user.bciCompany = newCompany;
            // If company changed, marking it modified
            user.markModified('bciCompany');
        }

        if (user.bciStatus !== 'Verified') {
            if (user.bciStatus !== 'Pending') {
                user.bciStatus = 'Pending';
                user.markModified('bciStatus'); // Forcing this to modified - Total QOL thing for me
            }
        }
    } else {
        // User is NOT requesting BCI status (unchecked box)
        if (user.bciStatus !== 'Verified') {
            if (user.bciStatus !== 'None') {
                user.bciStatus = 'None';
                user.markModified('bciStatus');
            }
            user.bciCompany = undefined;
            user.markModified('bciCompany');
        }
    }

    // Check if anything was actually modified - don't want to do unnecessary updates to MongoDB and waste my writes.
    if (!user.isModified()) {
        return res.status(200).json({ message: 'No changes were made to the profile.' });
    }

    const updatedUser = await user.save();
    const justAppliedForBci = isNowBciApplicant && !wasBciApplicant;

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      token: generateToken((updatedUser._id as Types.ObjectId).toString(), updatedUser.role),
      message: 'Profile updated successfully!', // Add a success message
      bciStatusMessage: justAppliedForBci ? 'Your BCI status is now pending review by an administrator.' : null
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }

};

// @route   PUT /api/users/password
  // @access  Private
  export const updateUserPassword = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
      // Verify old p/w
      const { currentPassword, newPassword } = req.body;
      if (await user.matchPassword(currentPassword)) {
        // Set new pw
        user.password = newPassword;
        await user.save();
        res.json({ message: 'Password updated successfully' });
      } else {
        res.status(401).json({ message: 'Invalid current password' });
      }
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  };

  // @route   DELETE /api/users
  // @access  Private
  export const deleteUserAccount = async (req: AuthRequest, res: Response) => {
    const user = await User.findById(req.user._id);

    if (user) {
      //  For now, just doing a hard delete of the user, but eventually I should add something that deletes user from all collections

      await user.deleteOne();
      res.json({ message: 'User removed' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  };