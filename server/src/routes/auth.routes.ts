import express from 'express';
import passport from 'passport';
import { Types } from 'mongoose';
import { IUser } from '../models/user.model';
import generateToken from '../utils/generateToken';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: OAuth routes for Google login
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google OAuth login
 *     tags: [Authentication]
 *     description: Redirects the user to the Google sign-in page.
 *     responses:
 *       302:
 *         description: Redirecting to Google.
 */
router.get('/google', passport.authenticate('google', { session: false }));

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Google OAuth callback URL
 *     tags: [Authentication]
 *     description: Google redirects to this URL after user grants permission. The backend handles the code exchange, user creation/login, and redirects to the frontend with a JWT.
 *     responses:
 *       302:
 *         description: Redirecting to the frontend application with an auth token.
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/login/failed', // A route to handle failed auth
    session: false,
  }),
  (req, res) => {
    // Successful auth
    const user = req.user as IUser;
    const token = generateToken((user._id as Types.ObjectId).toString(), user.role);

    // Redirect to your frontend application, passing the token
    // TODO: Move the frontend URL to a .env variable once I have frontend setup
    res.redirect(`http://localhost:3000?token=${token}`); // PLACEHOLDER FOR NOW TIL I BUILD FRONTEND
  }
);

// The failure route
router.get('/login/failed', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Authentication failed.',
  });
});

export default router;