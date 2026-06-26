const mongoose = require('mongoose');
const { LEAD_SOURCES, LEAD_STATUSES } = require('../constants');

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    company: { type: String, trim: true },
    source: { type: String, enum: LEAD_SOURCES, default: 'Website Contact Form' },
    status: { type: String, enum: LEAD_STATUSES, default: 'New' },
    message: { type: String, trim: true },
    notes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Note' }],
    followUpDate: { type: Date },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    statusHistory: [
      {
        status: { type: String, enum: LEAD_STATUSES },
        changedAt: { type: Date, default: Date.now },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
      }
    ],
    activity: [activitySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);

