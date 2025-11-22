import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

export const validateRegistration = [
  body('firstName').notEmpty().withMessage('First name is required.'),
  body('lastName').notEmpty().withMessage('Last name is required.'),
  body('email').isEmail().withMessage('Please include a valid email.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .matches(/\d/)
    .withMessage('Password must contain a number.')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter.')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('Password must contain a special character.'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {

      // Getting jsut the error msg
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({ messages: errorMessages });
    }
    next();
  },
];

export const validateLogin = [
    body('email').isEmail().withMessage('Please include a valid email.'),
    body('password').notEmpty().withMessage('Password is required.'),

    (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          const errorMessages = errors.array().map(err => err.msg);
          return res.status(400).json({ messages: errorMessages });
        }
        next();
    }
]

// ProfilePage.tx forms for updating profile details
export const validateProfileUpdate = [
  body('firstName').optional().notEmpty().withMessage('First name cannot be empty.'),
  body('lastName').optional().notEmpty().withMessage('Last name cannot be empty.'),
  body('email').optional().isEmail().withMessage('Please include a valid email.'),
  body('bio')
    .optional()
    .isLength({ max: 300 })
    .withMessage('Bio cannot exceed 300 characters.'),
  body('phone')
    .optional({ values: 'falsy' }) // Allows empty string
    // Allow common US formats: (123) 456-7890, 123-456-7890, 123.456.7890, 1234567890
    .matches(/^(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/)
    .withMessage('Please enter a valid phone number (e.g., 123-456-7890).'),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(err => err.msg);
      return res.status(400).json({ messages: errorMessages });
    }
    next();
  },
];