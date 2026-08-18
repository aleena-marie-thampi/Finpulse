const router = require('express').Router();
const auth = require('../middleware/auth');
const { Goal } = require('../models/index');

// @route   GET /api/goals
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch goal milestones' });
  }
});

// @route   POST /api/goals
router.post('/', auth, async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline, icon, monthlyContribution } = req.body;
    
    if (!name || !targetAmount || isNaN(targetAmount)) {
      return res.status(400).json({ message: 'Milestone name and structural numeric target amount required' });
    }
    if (!deadline) {
      return res.status(400).json({ message: 'Target target timeline completion deadline date required' });
    }

    const goal = await Goal.create({
      user: req.user._id,
      name: name.trim(),
      icon: icon || '🎯',
      targetAmount: parseFloat(targetAmount),
      savedAmount: parseFloat(savedAmount) || 0,
      deadline: new Date(deadline),
      monthlyContribution: parseFloat(monthlyContribution) || 0,
    });

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to compile target goal node' });
  }
});

// @route   PUT /api/goals/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, targetAmount, savedAmount, deadline, icon, monthlyContribution } = req.body;
    
    // Query document instance first to maintain schema verification hooks execution context
    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Target milestone record missing or unauthorized scope' });

    if (name !== undefined) goal.name = name.trim();
    if (icon !== undefined) goal.icon = icon;
    if (targetAmount !== undefined) goal.targetAmount = parseFloat(targetAmount);
    if (savedAmount !== undefined) goal.savedAmount = parseFloat(savedAmount);
    if (deadline !== undefined) goal.deadline = deadline ? new Date(deadline) : goal.deadline;
    if (monthlyContribution !== undefined) goal.monthlyContribution = parseFloat(monthlyContribution);

    // Save triggers execution of completion checking layer automatically
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update target parameters' });
  }
});

// @route   PATCH /api/goals/:id/contribute
router.patch('/:id/contribute', auth, async (req, res) => {
  try {
    const { incrementAmount } = req.body;
    if (!incrementAmount || isNaN(incrementAmount) || parseFloat(incrementAmount) <= 0) {
      return res.status(400).json({ message: 'Valid positive allocation increment required' });
    }

    const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Target milestone record missing or unauthorized scope' });

    goal.savedAmount += parseFloat(incrementAmount);
    
    await goal.save();
    res.json(goal);
  } catch (err) {
    res.status(500).json({ message: 'Capital contribution sequence rejected' });
  }
});

// @route   DELETE /api/goals/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!goal) return res.status(404).json({ message: 'Target milestone vector unallocated or missing' });
    res.json({ message: 'Milestone structure dropped successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to purge target system node' });
  }
});

module.exports = router;