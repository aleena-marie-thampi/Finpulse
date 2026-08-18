const router = require('express').Router();
const auth = require('../middleware/auth');
const { Expense } = require('../models/index');

// GET all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, category } = req.query;
    const filter = { user: req.user._id };
    
    if (month && year) {
      const start = new Date(Date.utc(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
      const end = new Date(Date.utc(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch expense pools' });
  }
});

// POST create expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, category, description, date, note } = req.body;
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ message: 'Valid positive amount allocation required' });
    }

    const expense = await Expense.create({
      user: req.user._id,
      amount: parseFloat(amount),
      category: category || 'other',
      description: description ? description.trim() : '',
      date: date ? new Date(date) : new Date(),
      note: note ? note.trim() : '',
    });
    
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to compile expense statement entry' });
  }
});

// PUT update expense safely
router.put('/:id', auth, async (req, res) => {
  try {
    const { amount, category, description, date, note } = req.body;
    
    const updates = {};
    if (amount !== undefined) {
      if (isNaN(amount) || parseFloat(amount) <= 0) return res.status(400).json({ message: 'Valid positive amount required' });
      updates.amount = parseFloat(amount);
    }
    if (category !== undefined) updates.category = category;
    if (description !== undefined) updates.description = description.trim();
    if (date !== undefined) updates.date = new Date(date);
    if (note !== undefined) updates.note = note.trim();

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!expense) return res.status(404).json({ message: 'Expense record missing or unauthorized scope' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update expense parameters' });
  }
});

// DELETE expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense structure element missing' });
    res.json({ message: 'Expense record purged successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to drop expense item' });
  }
});

module.exports = router;