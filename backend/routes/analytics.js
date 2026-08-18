const router = require('express').Router();
const auth = require('../middleware/auth');
const { Income, Expense } = require('../models/index');
const mongoose = require('mongoose');

router.get('/', auth, async (req, res) => {
  try {
    const { period = '6m' } = req.query;
    const monthsCount = period === '3m' ? 3 : period === '12m' ? 12 : 6;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    const scopeStart = new Date();
    scopeStart.setMonth(scopeStart.getMonth() - (monthsCount - 1));
    scopeStart.setDate(1);
    scopeStart.setHours(0, 0, 0, 0);

    const [incomeTrend, expenseTrend, categories] = await Promise.all([
      Income.aggregate([
        { $match: { user: userId, date: { $gte: scopeStart } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: scopeStart } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: scopeStart } } },
        { $group: { _id: '$category', value: { $sum: '$amount' } } },
        { $sort: { value: -1 } },
      ]),
    ]);

    const incomeMap = new Map(incomeTrend.map((item) => [`${item._id.year}-${item._id.month}`, item.total]));
    const expenseMap = new Map(expenseTrend.map((item) => [`${item._id.year}-${item._id.month}`, item.total]));
    const monthly = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() - i);

      const combinedKey = `${targetDate.getFullYear()}-${targetDate.getMonth() + 1}`;
      const income = incomeMap.get(combinedKey) || 0;
      const expenses = expenseMap.get(combinedKey) || 0;
      const savings = income - expenses;
      const score = income > 0 ? Math.max(Math.min(60 + Math.round((savings / income) * 40), 100), 0) : 0;

      monthly.push({
        month: targetDate.toLocaleString('default', { month: 'short' }),
        income,
        expenses,
        savings,
        score,
      });
    }

    const catColors = {
      food: '#F43F5E',
      rent: '#3B82F6',
      travel: '#8B5CF6',
      education: '#10B981',
      shopping: '#F59E0B',
      entertainment: '#EC4899',
      healthcare: '#10B981',
      utilities: '#EF9F27',
      other: '#4A5780',
    };

    const catData = categories.map((category) => ({
      name: category._id ? category._id.charAt(0).toUpperCase() + category._id.slice(1) : 'Other',
      value: category.value,
      color: catColors[category._id] || '#4A5780',
    }));

    res.json({ monthly, catData });
  } catch (err) {
    console.error('Analytics route error:', err.message);
    res.status(500).json({ message: 'Failed to load analytics data' });
  }
});

module.exports = router;
