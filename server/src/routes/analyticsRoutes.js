const express = require('express');
const Lead = require('../models/Lead');
const FollowUp = require('../models/FollowUp');
const { LEAD_STATUSES, LEAD_SOURCES } = require('../constants');

const router = express.Router();

router.get('/summary', async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextSevenDays = new Date(now);
    nextSevenDays.setDate(now.getDate() + 7);

    const [
      totalLeads,
      newLeads,
      contactedLeads,
      convertedLeads,
      followUpsDue,
      upcomingFollowUps,
      overdueFollowUps,
      statusBreakdown,
      sourceBreakdown,
      monthlyGrowth,
      conversionTrends
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ status: 'Contacted' }),
      Lead.countDocuments({ status: 'Converted' }),
      FollowUp.countDocuments({ status: 'Pending', reminderDate: { $lte: nextSevenDays } }),
      FollowUp.find({ status: 'Pending', reminderDate: { $gte: now, $lte: nextSevenDays } })
        .populate('leadId', 'name company email')
        .sort({ reminderDate: 1 })
        .limit(8),
      FollowUp.find({ status: 'Pending', reminderDate: { $lt: now } })
        .populate('leadId', 'name company email')
        .sort({ reminderDate: 1 })
        .limit(8),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([
        { $match: { createdAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            leads: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),
      Lead.aggregate([
        { $match: { updatedAt: { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) } } },
        {
          $group: {
            _id: { year: { $year: '$updatedAt' }, month: { $month: '$updatedAt' } },
            converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
            total: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ])
    ]);

    const conversionRate = totalLeads ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    const currentMonthLeads = await Lead.countDocuments({ createdAt: { $gte: startOfMonth } });

    const normalize = (items, allowed) =>
      allowed.map((name) => ({
        name,
        count: items.find((item) => item._id === name)?.count || 0
      }));

    const monthName = (item) =>
      new Date(item._id.year, item._id.month - 1).toLocaleString('default', { month: 'short' });

    res.json({
      cards: {
        totalLeads,
        newLeads,
        contactedLeads,
        convertedLeads,
        followUpsDue,
        monthlyLeadGrowth: currentMonthLeads,
        conversionRate
      },
      statusBreakdown: normalize(statusBreakdown, LEAD_STATUSES),
      sourceDistribution: normalize(sourceBreakdown, LEAD_SOURCES),
      monthlyGrowth: monthlyGrowth.map((item) => ({ month: monthName(item), leads: item.leads })),
      conversionTrends: conversionTrends.map((item) => ({
        month: monthName(item),
        converted: item.converted,
        rate: item.total ? Math.round((item.converted / item.total) * 100) : 0
      })),
      upcomingFollowUps,
      overdueFollowUps
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

