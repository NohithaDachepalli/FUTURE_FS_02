require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Note = require('../models/Note');
const FollowUp = require('../models/FollowUp');

const sources = ['Website Contact Form', 'Landing Page', 'Social Media', 'LinkedIn', 'Referral', 'Advertisement'];
const statuses = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed'];

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Lead.deleteMany(), Note.deleteMany(), FollowUp.deleteMany()]);

  const admin = await User.create({
    name: 'Avery Stone',
    email: 'admin@leadflowcrm.com',
    password: 'Admin@12345',
    role: 'admin'
  });

  const companies = ['Northstar Labs', 'BrightPath Studio', 'Vertex Finance', 'Orbit Retail', 'Clearline Health', 'Summit Works'];
  const names = ['Priya Mehta', 'Daniel Carter', 'Mia Johnson', 'Arjun Rao', 'Sofia Lee', 'Noah Brooks', 'Isha Kapoor', 'Ethan Wright'];

  for (let index = 0; index < 18; index += 1) {
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - index * 4);
    const status = statuses[index % statuses.length];
    const lead = await Lead.create({
      name: names[index % names.length],
      email: `lead${index + 1}@example.com`,
      phone: `+1 555 010${index}`,
      company: companies[index % companies.length],
      source: sources[index % sources.length],
      status,
      message: 'Interested in CRM implementation and pricing information.',
      assignedUser: admin._id,
      followUpDate: new Date(Date.now() + (index - 6) * 86400000),
      statusHistory: [{ status, changedBy: admin._id, changedAt: createdAt }],
      activity: [{ action: 'created', description: 'Seed lead created', user: admin._id, createdAt }],
      createdAt,
      updatedAt: createdAt
    });

    const note = await Note.create({
      leadId: lead._id,
      content: index % 2 === 0 ? 'Customer requested pricing information.' : 'Follow-up scheduled for next week.',
      createdBy: admin._id,
      createdAt
    });

    await FollowUp.create({
      leadId: lead._id,
      title: 'Check decision timeline',
      reminderDate: new Date(Date.now() + (index - 5) * 86400000),
      priority: index % 3 === 0 ? 'High' : index % 3 === 1 ? 'Medium' : 'Low',
      status: index % 5 === 0 ? 'Completed' : 'Pending',
      createdBy: admin._id
    });

    lead.notes.push(note._id);
    await lead.save();
  }

  console.log('Seed complete: admin@leadflowcrm.com / Admin@12345');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});

