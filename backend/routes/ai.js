const router = require('express').Router();
const auth = require('../middleware/auth');
const { Income, Expense, Goal } = require('../models/index');

function calculateContextScore({ totalIncome, totalExpenses, goals, emergencyCoverage }) {
  const hasFinancialData = totalIncome > 0 || totalExpenses > 0 || goals.length > 0 || emergencyCoverage > 0;
  if (!hasFinancialData) return 0;

  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0;
  const savingsScore = Math.min(Math.max(Math.round((savingsRate / 20) * 100), 0), 100);
  const emergencyScore = Math.min(Math.round((emergencyCoverage / 6) * 100), 100);
  const completedGoals = goals.filter((g) => Number(g.savedAmount) >= Number(g.targetAmount)).length;
  const goalScore = goals.length > 0 ? Math.round((completedGoals / goals.length) * 100) : 0;

  return Math.round(savingsScore * 0.45 + emergencyScore * 0.35 + goalScore * 0.20);
}

async function buildContext(userId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);

  const [incomes, expenses, goals] = await Promise.all([
    Income.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    Expense.find({ user: userId, date: { $gte: startOfMonth } }).lean(),
    Goal.find({ user: userId }).lean(),
  ]);

  const totalIncome = incomes.reduce((sum, income) => sum + Number(income.amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
  const savings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((savings / totalIncome) * 100).toFixed(1) : '0.0';

  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + Number(expense.amount || 0);
    return acc;
  }, {});

  const topCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([category, amount]) => `${category}: INR ${amount.toLocaleString('en-IN')}`)
    .join(', ');

  const goalsText = goals
    .slice(0, 3)
    .map((goal) => {
      const target = Number(goal.targetAmount || 0);
      const saved = Number(goal.savedAmount || 0);
      const progress = target > 0 ? Math.round((saved / target) * 100) : 0;
      return `${goal.name} (INR ${saved.toLocaleString('en-IN')}/INR ${target.toLocaleString('en-IN')}, ${progress}%)`;
    })
    .join('; ');

  const emergencyGoal = goals.find((goal) => goal.name?.toLowerCase().includes('emergency'));
  const emergencySavings = Number(emergencyGoal?.savedAmount || 0);
  const emergencyCoverage = totalExpenses > 0 ? emergencySavings / totalExpenses : 0;
  const healthScore = calculateContextScore({ totalIncome, totalExpenses, goals, emergencyCoverage });

  return `You are FinPulse AI Coach, a personalized financial advisor. Be concise, friendly, and actionable. Use Indian Rupee amounts. Keep responses under 150 words.

User's current financial snapshot for this month:
- Total Income: INR ${totalIncome.toLocaleString('en-IN')}
- Total Expenses: INR ${totalExpenses.toLocaleString('en-IN')}
- Net Savings: INR ${savings.toLocaleString('en-IN')}
- Savings Rate: ${savingsRate}%
- Top expense categories: ${topCategories || 'No expenses saved yet'}
- Active goals: ${goalsText || 'No goals saved yet'}
- Emergency coverage: ${emergencyCoverage.toFixed(2)} months
- Financial Health Score: ${healthScore}/100

Give advice only from this saved user data. If there is little data, ask the user to add income, expenses, and goals first.`;
}

router.post('/chat', auth, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message?.trim()) return res.status(400).json({ message: 'Message content is required' });

    const systemPrompt = await buildContext(req.user._id);

    if (process.env.GEMINI_API_KEY) {
      try {
        const sdk = await import('@google/genai');
        const GoogleGenAI = sdk.GoogleGenAI || sdk.default?.GoogleGenAI;
        
        if (!GoogleGenAI) {
          throw new Error('Could not resolve GoogleGenAI constructor from package structural footprint');
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        
        // FIXED: Changed fallback to 'gemini-2.5-flash' to support the newer SDK expectations
        const modelToUse = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
        
        const response = await ai.models.generateContent({
          model: modelToUse,
          contents: `${systemPrompt}\n\nUser: ${message.trim()}`,
        });

        if (response.text) {
          return res.json({ reply: response.text, provider: 'gemini' });
        }
      } catch (err) {
        console.error('Gemini structural engine request failed:', err.message);
      }
    }

    const savingsRate = systemPrompt.match(/Savings Rate: ([\d.]+)%/)?.[1] || '0.0';
    return res.json({
      provider: 'local-fallback',
      reply: `Gemini is not available right now, but I can still read your saved FinPulse data. Your current savings rate is ${savingsRate}%. Add income, expenses, and goals to get more specific coaching, and check GEMINI_API_KEY if you expected a live Gemini response.`,
    });

  } catch (err) {
    console.error('AI execution context failure:', err);
    return res.status(500).json({ message: 'AI processing system unavailable' });
  }
});

module.exports = router;