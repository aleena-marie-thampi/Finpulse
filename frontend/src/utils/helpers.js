export const formatINR = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

export const formatINRCompact = (amount) => {
  if (!amount) return '₹0';
  if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(1)}Cr`;
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount}`;
};

export const getScoreColor = (score) => {
  if (score >= 80) return '#0D9B6A';
  if (score >= 60) return '#1A4FD6';
  if (score >= 40) return '#BA7517';
  return '#E24B4A';
};

export const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
};

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Food', icon: '🍽️', color: '#E24B4A' },
  { value: 'rent', label: 'Rent', icon: '🏠', color: '#1A4FD6' },
  { value: 'travel', label: 'Travel', icon: '✈️', color: '#7C5CFC' },
  { value: 'education', label: 'Education', icon: '📚', color: '#0D9B6A' },
  { value: 'shopping', label: 'Shopping', icon: '🛍️', color: '#BA7517' },
  { value: 'entertainment', label: 'Entertainment', icon: '🎮', color: '#D4537E' },
  { value: 'healthcare', label: 'Healthcare', icon: '💊', color: '#0D9B6A' },
  { value: 'utilities', label: 'Utilities', icon: '⚡', color: '#EF9F27' },
  { value: 'other', label: 'Other', icon: '💳', color: '#4A5780' },
];

export const INCOME_TYPES = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'business', label: 'Business' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
