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