import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

// Let's Extend Request
export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Getting token from header
      token = req.headers.authorization.split(' ')[1];

      // Verifying
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);

      // Getting user from the token (excluding the password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
          return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, JWT token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no JWT token' });
  }
};