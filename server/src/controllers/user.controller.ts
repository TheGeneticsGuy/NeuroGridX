import { Request, Response } from 'express';
import { Types } from 'mongoose'; // Had to import this to resolve TS's issue with not knowing mongoose types
import User from '../models/user.model';
import generateToken from '../utils/generateToken';

// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  // NOTE!!! The reason I am not adding a role to be selected here is I don't want anyone but admin to set user role.
  const { email, password } = req.body;

  try {
    const userExists = await User.findOne({ email }); // Ensure they aren't already registered

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      email,
      password,
      role: 'Standard', // Hardcoding role to 'Standard' for new registrations. Admin can change roles later.
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        email: user.email,
        role: user.role, // This will correctly return 'Standard'
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