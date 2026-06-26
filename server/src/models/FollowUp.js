const mongoose = require('mongoose');
const { FOLLOWUP_PRIORITIES, FOLLOWUP_STATUSES } = require('../constants');

const followUpSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
    title: { type: String, default: 'Follow up with lead', trim: true },
    reminderDate: { type: Date, required: true },
    priority: { type: String, enum: FOLLOWUP_PRIORITIES, default: 'Medium' },
    status: { type: String, enum: FOLLOWUP_STATUSES, default: 'Pending' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);

