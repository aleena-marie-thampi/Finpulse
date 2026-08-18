const mongoose = require('mongoose');

// ─── Income ──────────────────────────────────────────────────────────────────
const incomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['salary', 'freelance', 'business', 'investment', 'other'], default: 'salary' },
  source: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  isRecurring: { type: Boolean, default: false },
  note: { type: String },
}, { timestamps: true });

// ─── Expense ─────────────────────────────────────────────────────────────────
const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['food', 'rent', 'travel', 'education', 'shopping', 'entertainment', 'healthcare', 'utilities', 'other'],
    default: 'other',
  },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  receipt: { type: String },
  note: { type: String },
}, { timestamps: true });

// ─── Goal ────────────────────────────────────────────────────────────────────
const goalSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  targetAmount: { type: Number, required: true, min: 0 },
  savedAmount: { type: Number, default: 0, min: 0 },
  deadline: { type: Date },
  icon: { type: String, default: '🎯' },
  monthlyContribution: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
}, { timestamps: true });

goalSchema.virtual('progressPercent').get(function () {
  return this.targetAmount > 0 ? Math.min((this.savedAmount / this.targetAmount) * 100, 100) : 0;
});

goalSchema.pre('save', function (next) {
  if (this.savedAmount >= this.targetAmount && !this.completed) {
    this.completed = true;
    this.completedAt = new Date();
  }
  next();
});

// ─── Health Score ─────────────────────────────────────────────────────────────
const healthScoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  score: { type: Number, required: true, min: 0, max: 100 },
  breakdown: {
    savings: Number,
    emergency: Number,
    debt: Number,
    goals: Number,
    stability: Number,
  },
  month: { type: String }, // "2025-06"
}, { timestamps: true });

// 🔥 Check mongoose.models first to prevent "OverwriteModelError"
module.exports = {
  Income: mongoose.models.Income || mongoose.model('Income', incomeSchema),
  Expense: mongoose.models.Expense || mongoose.model('Expense', expenseSchema),
  Goal: mongoose.models.Goal || mongoose.model('Goal', goalSchema),
  HealthScore: mongoose.models.HealthScore || mongoose.models.HealthScore || mongoose.model('HealthScore', healthScoreSchema),
};