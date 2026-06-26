const express = require('express');
const { body, param } = require('express-validator');
const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const validate = require('../middleware/validate');
const { FOLLOWUP_PRIORITIES, FOLLOWUP_STATUSES } = require('../constants');

const router = express.Router();

router.post(
  '/',
  [
    body('leadId').isMongoId().withMessage('Valid lead ID is required'),
    body('title').optional().trim(),
    body('reminderDate').isISO8601().withMessage('Reminder date is required'),
    body('priority').optional().isIn(FOLLOWUP_PRIORITIES).withMessage('Invalid priority')
  ],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.findById(req.body.leadId);
      if (!lead) return res.status(404).json({ message: 'Lead not found' });

      const followUp = await FollowUp.create({ ...req.body, createdBy: req.user._id });
      lead.followUpDate = req.body.reminderDate;
      lead.activity.push({
        action: 'followup_scheduled',
        description: `Follow-up scheduled for ${new Date(req.body.reminderDate).toLocaleDateString()}`,
        user: req.user._id
      });
      await lead.save();

      res.status(201).json(followUp);
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  [
    param('id').isMongoId(),
    body('title').optional().trim(),
    body('reminderDate').optional().isISO8601().withMessage('Invalid reminder date'),
    body('priority').optional().isIn(FOLLOWUP_PRIORITIES).withMessage('Invalid priority'),
    body('status').optional().isIn(FOLLOWUP_STATUSES).withMessage('Invalid status')
  ],
  validate,
  async (req, res, next) => {
    try {
      const followUp = await FollowUp.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
      res.json(followUp);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

