import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { Types } from 'mongoose';
import User from '../models/user.model';
import generateToken from '../utils/generateToken';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * @swagger
 * /api/auth/google-token:
 *   post:
 *     summary: Authenticate with Google using an ID token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: The ID token received from Google Sign-In on the client.
 *     responses:
 *       200:
 *         description: Authentication successful, returns user info and JWT.
 *       401:
 *         description: Invalid Google token.
 */
router.post('/google-token', async (req, res) => {
  const { token } = req.body;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload || !payload.email) {
      return res.status(401).json({ message: 'Invalid Google token' });
    }

    const { sub: googleId, email, given_name: firstName, family_name: lastName } = payload;

    let user = await User.findOne({ googleId });

    if (!user) {
      // If no user with googleId, checking if one exists with the same email
      user = await User.findOne({ email });

      if (user) {
        // User exists, lets link their Google account
        // I might grab other additional info from user account here, like profile image
        user.googleId = googleId;
        user.firstName = user.firstName || firstName; // Only update if not set
        user.lastName = user.lastName || lastName;
        await user.save();

      } else {
        // No user found, create a new one
        user = await User.create({
          googleId,
          email,
          firstName,
          lastName,
          role: 'Standard',
        });
      }
    }

    const appToken = generateToken((user._id as Types.ObjectId).toString(), user.role);
    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      token: appToken,
    });

  } catch (error) {
    console.error('Google auth error:', error);
    res.status(401).json({ message: 'Google authentication failed' });
  }
});

export default router;