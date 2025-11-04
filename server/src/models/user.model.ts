import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// JSDoc for Swagger documentation
/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user's email address
 *           format: email
 *         role:
 *           type: string
 *           description: The role of the user
 *           enum: [Standard, BCI, Admin]
 *           default: Standard
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the user was created
 *       example:
 *         id: 60d0fe4f5311236168a109ca
 *         email: example@byui.edu
 *         role: Standard
 *         createdAt: 2025-10-227T10:00:00.000Z
 */

// Interface for the User document
export interface IUser extends Document {
  email: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  googleId?: string;
  role: 'Standard' | 'BCI' | 'Admin';
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true, match: /.+\@.+\..+/ },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  password: { type: String, required: false },
  googleId: { type: String, required: false },
  role: { type: String, required: true, enum: ['Standard', 'BCI', 'Admin'], default: 'Standard' },
}, {
  timestamps: true
});

// Compare entered password with the hashed (bcrypt) password
userSchema.methods.matchPassword = async function (enteredPassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware bcrypt to hash password before saving a new user
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model<IUser>('User', userSchema);

export default User;