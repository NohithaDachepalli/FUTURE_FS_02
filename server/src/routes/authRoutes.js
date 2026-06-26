const express = require('express');
const { body } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const signToken = require('../utils/token');

const router = express.Router();

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profilePicture: user.profilePicture
});

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validate,
  async (req, res, next) => {
    try {
      const exists = await User.findOne({ email: req.body.email });
      if (exists) return res.status(409).json({ message: 'Email is already registered' });

      const user = await User.create(req.body);
      res.status(201).json({ user: publicUser(user), token: signToken(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+password');
      if (!user || !(await user.comparePassword(req.body.password))) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      res.json({ user: publicUser(user), token: signToken(user) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/me', protect, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('profilePicture').optional().isString()
  ],
  validate,
  async (req, res, next) => {
    try {
      const allowed = ['name', 'email', 'profilePicture'];
      allowed.forEach((key) => {
        if (req.body[key] !== undefined) req.user[key] = req.body[key];
      });
      await req.user.save();
      res.json({ user: publicUser(req.user) });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.user._id).select('+password');
      if (!(await user.comparePassword(req.body.currentPassword))) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      user.password = req.body.newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

