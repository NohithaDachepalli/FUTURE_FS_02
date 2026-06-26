const express = require('express');
const { body, param } = require('express-validator');
const Note = require('../models/Note');
const Lead = require('../models/Lead');
const validate = require('../middleware/validate');

const router = express.Router();

router.post(
  '/',
  [
    body('leadId').isMongoId().withMessage('Valid lead ID is required'),
    body('content').trim().notEmpty().withMessage('Note content is required')
  ],
  validate,
  async (req, res, next) => {
    try {
      const lead = await Lead.findById(req.body.leadId);
      if (!lead) return res.status(404).json({ message: 'Lead not found' });

      const note = await Note.create({
        leadId: lead._id,
        content: req.body.content,
        createdBy: req.user._id
      });

      lead.notes.push(note._id);
      lead.activity.push({
        action: 'note_added',
        description: 'A note was added',
        user: req.user._id
      });
      await lead.save();

      res.status(201).json(await note.populate('createdBy', 'name'));
    } catch (error) {
      next(error);
    }
  }
);

router.put(
  '/:id',
  [param('id').isMongoId(), body('content').trim().notEmpty().withMessage('Note content is required')],
  validate,
  async (req, res, next) => {
    try {
      const note = await Note.findByIdAndUpdate(
        req.params.id,
        { content: req.body.content },
        { new: true }
      ).populate('createdBy', 'name');
      if (!note) return res.status(404).json({ message: 'Note not found' });
      res.json(note);
    } catch (error) {
      next(error);
    }
  }
);

router.delete('/:id', [param('id').isMongoId()], validate, async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await Promise.all([
      Lead.findByIdAndUpdate(note.leadId, { $pull: { notes: note._id } }),
      note.deleteOne()
    ]);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

