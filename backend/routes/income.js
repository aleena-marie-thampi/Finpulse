const router = require('express').Router();
const auth = require('../middleware/auth');
const { Income } = require('../models/index');

// GET all income for user with strict time boxing
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, type } = req.query;
    const filter = { user: req.user._id };
    
    if (month && year) {
      const start = new Date(Date.utc(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
      const end = new Date(Date.utc(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
    if (type) filter.type = type;
    
    const income = await Income.find(filter).sort({ date: -1 });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch income records' });
  }
});

// POST create income
router.post('/', auth, async (req, res) => {
  try {
    const { amount, type, source, date, isRecurring, note } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid positive amount required' });
    }
    if (!source || source.trim() === '') {
      return res.status(400).json({ message: 'Source parameter identification required' });
    }

    const income = await Income.create({
      user: req.user._id,
      amount: parseFloat(amount),
      type,
      source: source.trim(),
      date: date ? new Date(date) : new Date(),
      isRecurring: !!isRecurring,
      note: note ? note.trim() : ''
    });
    
    res.status(201).json(income);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create income record' });
  }
});

// PUT update income safely
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, type, source, date, isRecurring, note } = req.body;
    
    const updates = {};
    if (amount !== undefined) {
      if (isNaN(amount) || parseFloat(amount) <= 0) return res.status(400).json({ message: 'Valid positive amount required' });
      updates.amount = parseFloat(amount);
    }
    if (type !== undefined) updates.type = type;
    if (source !== undefined) updates.source = source.trim();
    if (date !== undefined) updates.date = new Date(date);
    if (isRecurring !== undefined) updates.isRecurring = !!isRecurring;
    if (note !== undefined) updates.note = note.trim();

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!income) return res.status(404).json({ message: 'Income record not found or scope unauthorized' });
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update income record' });
  }
});

// DELETE income
router.delete('/:id', auth, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!income) return res.status(404).json({ message: 'Income record missing' });
    res.json({ message: 'Income source node unallocated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete income record' });
  }
});

module.exports = router;