import express from 'express';
import { registerUser, loginUser, getUserProfile, updateUserProfile } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { validateRegistration, validateLogin, validateProfileUpdate } from '../middleware/validation.middleware';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User authentication and management
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account with a default role of 'Standard'.
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *             # We have removed the 'role' property from this schema
 *     responses:
 *       201:
 *         description: User registered successfully with 'Standard' role.
 *       400:
 *         description: User already exists or invalid data
 */
router.post('/register', validateRegistration, registerUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user and get a token
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful, token returned
 *       401:
 *         description: Invalid email or password
 */
router.post('/login', validateLogin, loginUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, validateProfileUpdate, updateUserProfile)

export default router;