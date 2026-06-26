import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

export const handleValidation = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

export const validateRegister: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('any').withMessage('Invalid phone number'),
];

export const validateLogin: ValidationChain[] = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateCreateDog: ValidationChain[] = [
  body('name').trim().notEmpty().withMessage('Dog name is required'),
  body('breed').trim().notEmpty().withMessage('Breed is required'),
  body('gender').isIn(['MALE', 'FEMALE', 'male', 'female']).withMessage('Gender must be MALE or FEMALE'),
  body('dateOfBirth').isISO8601().withMessage('Valid date of birth is required'),
  body('age').isInt({ min: 0, max: 30 }).withMessage('Age must be a number between 0 and 30'),
  body('weight').isFloat({ min: 0.1 }).withMessage('Weight must be a positive number'),
  body('color').trim().notEmpty().withMessage('Color is required'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('county').trim().notEmpty().withMessage('County is required'),
  body('studFee').optional({ nullable: true }).isFloat({ min: 0 }).withMessage('Stud fee must be a positive number'),
];

export const validateReview: ValidationChain[] = [
  body('dogId').notEmpty().withMessage('Dog ID is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 5 }).withMessage('Comment must be at least 5 characters'),
];

export const validateMessage: ValidationChain[] = [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('receiverId').notEmpty().withMessage('Receiver ID is required'),
];
