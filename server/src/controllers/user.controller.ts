import { Request, Response } from 'express';
import { Types } from 'mongoose'; // Had to import this to resolve TS's issue with not knowing mongoose types
import User from '../models/user.model';
import generateToken from '../utils/generateToken';
import { AuthRequest } from '../middleware/auth.middleware';

// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  try {
    const userExists = await User.findOne({ email }); // No need to register if they already have!!

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: 'Standard',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role,
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
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
// @access  Private
export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.firstName = req.body.firstName || user.firstName;
    user.lastName = req.body.lastName || user.lastName;
    user.email = req.body.email || user.email;
    user.bio = req.body.bio || user.bio;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      avatarUrl: updatedUser.avatarUrl,
      token: generateToken((updatedUser._id as Types.ObjectId).toString(), updatedUser.role),
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};