const express = require('express');
const { body } = require('express-validator');
const Lead = require('../models/Lead');
const validate = require('../middleware/validate');
const { sendMail } = require('../config/mail');

const router = express.Router();

router.post(
  '/contact',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional({ checkFalsy: true }).trim(),
    body('company').optional({ checkFalsy: true }).trim(),
    body('message').trim().notEmpty().withMessage('Message is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.create({
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        company: req.body.company,
        message: req.body.message,
        source: 'Website Contact Form',
        status: 'New',
        statusHistory: [{ status: 'New' }],
        activity: [{ action: 'created', description: 'Lead submitted from website contact form' }]
      });

      await Promise.allSettled([
        sendMail({
          to: process.env.ADMIN_EMAIL,
          subject: `New lead received: ${lead.name}`,
          text: `${lead.name} submitted a contact form.\nEmail: ${lead.email}\nMessage: ${lead.message}`
        }),
        sendMail({
          to: lead.email,
          subject: 'We received your inquiry',
          text: `Hi ${lead.name},\n\nThanks for reaching out. Our team will contact you soon.\n\nLeadFlow CRM`
        })
      ]);

      res.status(201).json({ message: 'Thanks, your inquiry has been received.' });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

