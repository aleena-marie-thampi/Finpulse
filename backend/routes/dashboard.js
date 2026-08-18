const router = require('express').Router();
const auth = require('../middleware/auth');
const { Income, Expense, Goal } = require('../models/index');
const mongoose = require('mongoose');

// Calculate health score from raw data
function calculateHealthScore({ totalIncome, totalExpenses, totalSavings, goals, emergencyCoverage }) {
  const hasFinancialData = totalIncome > 0 || totalExpenses > 0 || goals.length > 0 || emergencyCoverage > 0;
  if (!hasFinancialData) {
    return {
      score: 0,
      breakdown: { savings: 0, emergency: 0, debt: 0, goals: 0, stability: 0 },
    };
  }

  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
  const savingsScore = Math.min(Math.round((savingsRate / 20) * 100), 100);
  const emergencyScore = Math.min(Math.round((emergencyCoverage / 6) * 100), 100);
  const debtScore = 0;

  const completedGoals = goals.filter(g => g.savedAmount >= g.targetAmount).length;
  const goalScore = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;
  const stabilityScore = savingsRate >= 10 ? Math.min(Math.round(savingsRate * 2), 100) : Math.max(0, Math.round(savingsRate * 3));

  const score = Math.round(
    savingsScore * 0.30 +
    emergencyScore * 0.25 +
    debtScore * 0.20 +
    goalScore * 0.15 +
    stabilityScore * 0.10
  );

  return {
    score: Math.max(Math.min(score, 100), 0),
    breakdown: { savings: savingsScore, emergency: emergencyScore, debt: debtScore, goals: goalScore, stability: stabilityScore },
  };
}

// GET /api/dashboard/summary
router.get('/summary', auth, async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user._id);
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));
    
    // 6 Months ago timeline start point
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Run parallel optimizations safely
    const [currentData, incomeTrend, expenseTrend, incomes, expenses] = await Promise.all([
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: startOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      Income.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } }
      ]),
      Expense.aggregate([
        { $match: { user: userId, date: { $gte: sixMonthsAgo } } },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' } } }
      ]),
      Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
      Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean()
    ]);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.round((totalSavings / totalIncome) * 100) : 0;

    // Build timeline arrays securely using Map lookups
    const monthlyData = [];
    const incomeMap = new Map(incomeTrend.map(i => [`${i._id.year}-${i._id.month}`, i.total]));
    const expenseMap = new Map(expenseTrend.map(e => [`${e._id.year}-${e._id.month}`, e.total]));

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const combinedKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      
      const inc = incomeMap.get(combinedKey) || 0;
      const exp = expenseMap.get(combinedKey) || 0;
      
      monthlyData.push({
        month: d.toLocaleString('default', { month: 'short' }),
        income: inc,
        expenses: exp,
        savings: inc - exp
      });
    }

    const catColors = { food:'#E24B4A', rent:'#1A4FD6', travel:'#7C5CFC', education:'#0D9B6A', shopping:'#BA7517', entertainment:'#D4537E', healthcare:'#0D9B6A', utilities:'#EF9F27', other:'#4A5780' };
    const categoryBreakdown = currentData.map(c => ({
      name: c._id ? c._id.charAt(0).toUpperCase() + c._id.slice(1) : 'Other',
      value: c.total,
      color: catColors[c._id] || '#4A5780'
    }));

    const risks = [];
    if (savingsRate < 10) risks.push(`Your savings rate is only ${savingsRate}% — aim for at least 20%.`);
    if (totalExpenses > totalIncome) risks.push('Your expenses exceeded your income this month.');

    res.json({ totalIncome, totalExpenses, totalSavings, savingsRate, monthlyData, categoryBreakdown, risks });
  } catch (err) {
    console.error('❌ Summary error:', err.message);
    res.status(500).json({ message: 'Failed to load summary analytics cleanly' });
  }
});

// GET /api/dashboard/health-score
router.get('/health-score', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));

    const [incomes, expenses, goals] = await Promise.all([
      Income.find({ user: userId, date: { $gte: startOfMonth } }),
      Expense.find({ user: userId, date: { $gte: startOfMonth } }),
      Goal.find({ user: userId }),
    ]);

    const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
    const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    const totalSavings = totalIncome - totalExpenses;

    const emergencyGoal = goals.find(g => g.name.toLowerCase().includes('emergency'));
    const emergencySavings = emergencyGoal?.savedAmount || 0;
    const monthlyExp = totalExpenses;
    const emergencyCoverage = monthlyExp > 0 ? emergencySavings / monthlyExp : 0;

    const result = calculateHealthScore({ totalIncome, totalExpenses, totalSavings, goals, emergencyCoverage });
    res.json(result);
  } catch (err) {
    console.error('❌ Health score error:', err.message);
    res.status(500).json({ message: 'Failed to calculate health score metrics' });
  }
});

// GET /api/dashboard/emergency
router.get('/emergency', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1, 0, 0, 0));

    const expenses = await Expense.find({ user: userId, date: { $gte: startOfMonth } });
    const monthlyExpenses = expenses.reduce((s, e) => s + e.amount, 0);
    
    const recommended = 6;
    const recommendedAmount = monthlyExpenses * recommended;

    const emergencyGoal = await Goal.findOne({ user: userId, name: /emergency/i });
    const currentSavings = emergencyGoal?.savedAmount || 0;
    const coverage = monthlyExpenses > 0 ? parseFloat((currentSavings / monthlyExpenses).toFixed(2)) : 0;
    const gap = Math.max(recommendedAmount - currentSavings, 0);

    res.json({ currentSavings, monthlyExpenses, coverage, recommended, recommendedAmount, gap });
  } catch (err) {
    console.error('❌ Emergency endpoint error:', err.message);
    res.status(500).json({ message: 'Failed to load emergency fund data parameters' });
  }
});

// POST /api/dashboard/emergency
router.post('/emergency', auth, async (req, res) => {
  try {
    const currentSavings = Math.max(parseFloat(req.body.currentSavings) || 0, 0);
    const monthlyExpenses = Math.max(parseFloat(req.body.monthlyExpenses) || 0, 0);
    const recommended = 6;
    const recommendedAmount = monthlyExpenses * recommended;
    const gap = Math.max(recommendedAmount - currentSavings, 0);
    const coverage = monthlyExpenses > 0 ? parseFloat((currentSavings / monthlyExpenses).toFixed(2)) : 0;

    await Goal.findOneAndUpdate(
      { user: req.user._id, name: /emergency fund/i },
      {
        $set: {
          user: req.user._id,
          name: 'Emergency Fund',
          targetAmount: recommendedAmount,
          savedAmount: currentSavings,
          monthlyContribution: 0,
          icon: 'Shield',
          deadline: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    res.json({ currentSavings, monthlyExpenses, coverage, recommended, recommendedAmount, gap });
  } catch (err) {
    console.error('Emergency save error:', err.message);
    res.status(500).json({ message: 'Failed to save emergency fund data' });
  }
});

module.exports = router;
