const express = require('express');
const { body, query, param } = require('express-validator');
const Lead = require('../models/Lead');
const Note = require('../models/Note');
const FollowUp = require('../models/FollowUp');
const validate = require('../middleware/validate');
const { LEAD_SOURCES, LEAD_STATUSES } = require('../constants');

const router = express.Router();

const createLeadValidators = [
  body('name').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('company').optional({ checkFalsy: true }).trim(),
  body('source').optional().isIn(LEAD_SOURCES).withMessage('Invalid source'),
  body('status').optional().isIn(LEAD_STATUSES).withMessage('Invalid status'),
  body('followUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid follow-up date'),
  body('assignedUser').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid assigned user')
];

const updateLeadValidators = [
  body('name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional({ checkFalsy: true }).trim(),
  body('company').optional({ checkFalsy: true }).trim(),
  body('source').optional().isIn(LEAD_SOURCES).withMessage('Invalid source'),
  body('status').optional().isIn(LEAD_STATUSES).withMessage('Invalid status'),
  body('followUpDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid follow-up date'),
  body('assignedUser').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid assigned user')
];

const buildFilter = (req) => {
  const filter = {};
  const { search, status, source, assignedUser, startDate, endDate } = req.query;

  if (status) filter.status = status;
  if (source) filter.source = source;
  if (assignedUser) filter.assignedUser = assignedUser;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { company: { $regex: search, $options: 'i' } }
    ];
  }

  return filter;
};

router.get(
  '/',
  [
    query('status').optional().isIn(LEAD_STATUSES),
    query('source').optional().isIn(LEAD_SOURCES),
    query('assignedUser').optional().isMongoId(),
    query('startDate').optional().isISO8601(),
    query('endDate').optional().isISO8601()
  ],
  validate,
  async (req, res, next) => {
    try {
      const page = Math.max(Number(req.query.page || 1), 1);
      const limit = Math.min(Math.max(Number(req.query.limit || 50), 1), 100);
      const sortBy = req.query.sortBy || 'createdAt';
      const order = req.query.order === 'asc' ? 1 : -1;
      const filter = buildFilter(req);

      const [leads, total] = await Promise.all([
        Lead.find(filter)
          .populate('assignedUser', 'name email')
          .sort({ [sortBy]: order })
          .skip((page - 1) * limit)
          .limit(limit),
        Lead.countDocuments(filter)
      ]);

      res.json({ data: leads, total, page, pages: Math.ceil(total / limit) });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/:id', [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('assignedUser', 'name email')
      .populate('statusHistory.changedBy', 'name')
      .populate('activity.user', 'name');

    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const [notes, followUps] = await Promise.all([
      Note.find({ leadId: lead._id }).populate('createdBy', 'name').sort({ createdAt: -1 }),
      FollowUp.find({ leadId: lead._id }).sort({ reminderDate: 1 })
    ]);

    res.json({ lead, notes, followUps });
  } catch (error) {
    next(error);
  }
});

router.post('/', createLeadValidators, validate, async (req, res, next) => {
  try {
    const lead = await Lead.create({
      ...req.body,
      statusHistory: [{ status: req.body.status || 'New', changedBy: req.user._id }],
      activity: [
        {
          action: 'created',
          description: 'Lead created manually',
          user: req.user._id
        }
      ]
    });

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', [param('id').isMongoId(), ...updateLeadValidators], validate, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    const previousStatus = lead.status;
    Object.assign(lead, req.body);

    if (req.body.status && req.body.status !== previousStatus) {
      lead.statusHistory.push({ status: req.body.status, changedBy: req.user._id });
      lead.activity.push({
        action: 'status_updated',
        description: `Status changed from ${previousStatus} to ${req.body.status}`,
        user: req.user._id
      });
    } else {
      lead.activity.push({
        action: 'updated',
        description: 'Lead information updated',
        user: req.user._id
      });
    }

    await lead.save();
    res.json(lead);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });

    await Promise.all([
      Note.deleteMany({ leadId: lead._id }),
      FollowUp.deleteMany({ leadId: lead._id }),
      lead.deleteOne()
    ]);

    res.json({ message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
