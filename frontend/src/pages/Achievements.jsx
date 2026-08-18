import { useState, useEffect } from 'react';
import { PageHeader } from '../components/ui';
import { useInView } from '../hooks/useInView';
import { Lock } from 'lucide-react';
import api from "../api/axios"; // Secure axios client instance

const BADGES = [
  { id: 1, name: 'First Steps', icon: '👶', desc: 'Added your first expense', color: '#0D9B6A', trackingKey: 'expensesAdded', target: 1 },
  { id: 2, name: 'Saver Starter', icon: '💰', desc: 'Saved ₹10,000 for the first time', color: '#1A4FD6', trackingKey: 'moneySaved', target: 10000 },
  { id: 3, name: 'Budget Master', icon: '📊', desc: 'Stayed under budget for a full month', color: '#7C5CFC', trackingKey: 'monthsOnBudget', target: 1 },
  { id: 4, name: 'Emergency Hero', icon: '🛡️', desc: 'Saved up 3 months of emergency expenses', color: '#BA7517', trackingKey: 'emergencyFundMonths', target: 3 },
  { id: 5, name: 'Goal Achiever', icon: '🏆', desc: 'Completed your first financial goal', color: '#E24B4A', trackingKey: 'goalsMet', target: 1 },
  { id: 6, name: 'Streak Saver', icon: '🔥', desc: 'Saved consistently for 3 months in a row', color: '#D4537E', trackingKey: 'savingStreakMonths', target: 3 },
  { id: 7, name: 'Debt Slayer', icon: '⚔️', desc: 'Reduced loan payments below 20% of income', color: '#0D9B6A', trackingKey: 'debtToIncomeRatio', target: 20 },
  { id: 8, name: 'Score 80+', icon: '⭐', desc: 'Achieved a financial health score of 80+', color: '#7C5CFC', trackingKey: 'financialHealthScore', target: 80 },
  { id: 9, name: 'Full Fund', icon: '🔒', desc: 'Saved up 6 months of emergency expenses', color: '#1A4FD6', trackingKey: 'emergencyFundMonths', target: 6 },
  { id: 10, name: 'Wealth Builder', icon: '🏗️', desc: 'Total savings crossed ₹1 lakh', color: '#BA7517', trackingKey: 'moneySaved', target: 100000 },
  { id: 11, name: 'AI Student', icon: '🤖', desc: 'Applied 5 AI coach recommendations', color: '#E24B4A', trackingKey: 'aiTipsUsed', target: 5 },
  { id: 12, name: 'Financial Master', icon: '👑', desc: 'Maintained a 90+ score for 3 months', color: '#EF9F27', trackingKey: 'topScoreStreak', target: 90 },
];

const LEVELS = [
  { name: 'Beginner', icon: '🌱', minScore: 0, color: '#8A95B8' },
  { name: 'Planner', icon: '📋', minScore: 20, color: '#0D9B6A' },
  { name: 'Saver', icon: '💎', minScore: 40, color: '#1A4FD6' },
  { name: 'Investor', icon: '🏗️', minScore: 60, color: '#7C5CFC' },
  { name: 'Master', icon: '👑', minScore: 80, color: '#EF9F27' },
];

function BadgeCard({ badge, index, userProgress }) {
  const [ref, inView] = useInView();
  const userCurrentValue = userProgress[badge.trackingKey] || 0;
  
  // Custom logic processing: lower debt ratio means progress completed successfully
  const isEarned = badge.trackingKey === 'debtToIncomeRatio' 
    ? userCurrentValue <= badge.target && userCurrentValue > 0
    : userCurrentValue >= badge.target;

  const progressPercentage = isEarned 
    ? 100 
    : Math.min(Math.round((userCurrentValue / badge.target) * 100), 99);

  return (
    <div 
      ref={ref} 
      className="glass-card p-4 flex flex-col items-center text-center transition-all duration-200 hover:-translate-y-1 relative overflow-hidden"
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? 'scale(1)' : 'scale(0.95)',
        transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: `${index * 30}ms`,
        border: `0.5px solid ${isEarned ? `${badge.color}40` : 'rgba(74,87,128,0.2)'}`,
        filter: isEarned ? 'none' : 'grayscale(0.5)',
      }}
    >
      {isEarned && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${badge.color}08, transparent 70%)` }} />
      )}
      <div 
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3 relative"
        style={{
          background: isEarned ? `${badge.color}20` : 'rgba(26,39,64,0.4)',
          border: `0.5px solid ${isEarned ? `${badge.color}40` : 'rgba(74,87,128,0.2)'}`,
          boxShadow: isEarned ? `0 0 20px ${badge.color}30` : 'none',
        }}
      >
        {isEarned ? badge.icon : <Lock size={18} className="text-[#4A5780]" />}
      </div>
      <h3 className="font-display font-500 text-xs text-[#E8EBF4] mb-1">{badge.name}</h3>
      <p className="text-xs text-[#4A5780] leading-relaxed mb-2 h-8 flex items-center justify-center">{badge.desc}</p>
      
      {isEarned ? (
        <span 
          className="text-xs px-2 py-0.5 rounded-full font-500"
          style={{ background: `${badge.color}20`, color: badge.color, border: `0.5px solid ${badge.color}40` }}
        >
          ✓ Unlocked
        </span>
      ) : (
        <div className="w-full">
          <div className="flex justify-between text-xs text-[#4A5780] mb-1">
            <span>Progress</span><span>{Math.max(0, progressPercentage)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2740' }}>
            <div className="h-full rounded-full" style={{ width: `${Math.max(0, progressPercentage)}%`, background: badge.color, transition: 'width-full 1s ease' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Achievements() {
  const [currentScore, setCurrentScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState({});

  useEffect(() => {
    async function fetchAndCalculateMetrics() {
      try {
        const [scoreRes, summaryRes, emergencyRes, goalsRes, expensesRes] = await Promise.all([
          api.get('/dashboard/health-score'),
          api.get('/dashboard/summary'),
          api.get('/dashboard/emergency'),
          api.get('/goals'),
          api.get('/expenses')
        ]);

        // 🚨 TEMP DEBUG LOGS - Open your browser console (F12) to view these!
        console.log("--- LIVE DATABASE RESPONSES ---");
        console.log("Health Score API:", scoreRes.data);
        console.log("Summary API:", summaryRes.data);
        console.log("Emergency API:", emergencyRes.data);
        console.log("Goals API List:", goalsRes.data);
        console.log("Expenses API List:", expensesRes.data);
        console.log("--------------------------------");

        const scoreData = scoreRes.data || {};
        const summaryData = summaryRes.data || {};
        const emergencyData = emergencyRes.data || {};
        const goalsList = goalsRes.data || [];
        const expensesList = expensesRes.data || [];

        // Dynamic Calculations
        const liveScore = typeof scoreData === 'number' ? scoreData : (scoreData.score || scoreData.currentScore || 0);
        const totalExpensesCount = expensesList.length;
        const totalSavedMoney = summaryData.totalSavings || summaryData.savings || 0;
        const emergencyMonthsCount = emergencyData.coverage || emergencyData.monthsSaved || 0;
        
        const completedGoalsCount = goalsList.filter(g => 
          Number(g.savedAmount || g.currentAmount || 0) >= Number(g.targetAmount || g.target || 0)
        ).length;

        // Check if these match your database schema fields:
        const budgetStreakMonths = summaryData.budgetStreak || summaryData.streak || 0;
        const consecutiveSavingMonths = summaryData.savingStreak || summaryData.savingsStreak || 0;
        const calculatedDebtRatio = summaryData.debtRatio || summaryData.debtToIncome || 0;
        const aiRecommendationsUsed = summaryData.aiTipsCount || summaryData.aiRecommendations || 0;
        const historicalMaxScore = scoreData.maxScore || scoreData.highestScore || liveScore;

        setCurrentScore(liveScore);
        
        setUserProgress({
          expensesAdded: totalExpensesCount,
          moneySaved: totalSavedMoney,
          monthsOnBudget: budgetStreakMonths,
          emergencyFundMonths: emergencyMonthsCount,
          goalsMet: completedGoalsCount,
          savingStreakMonths: consecutiveSavingMonths,
          debtToIncomeRatio: calculatedDebtRatio,
          financialHealthScore: liveScore,
          aiTipsUsed: aiRecommendationsUsed,
          topScoreStreak: historicalMaxScore
        });

      } catch (err) {
        console.error('Error computing database metrics:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchAndCalculateMetrics();
  }, []);

  const currentLevel = LEVELS.filter(l => l.minScore <= currentScore).pop() || LEVELS[0];
  const nextLevel = LEVELS.find(l => l.minScore > currentScore);
const levelProgress = nextLevel
  ? Math.max(
      0,
      Math.min(
        100,
        ((currentScore - currentLevel.minScore) /
          (nextLevel.minScore -
            currentLevel.minScore)) *
          100
      )
    )
  : 100;
  const earnedCount = BADGES.filter(badge => {
    const val = userProgress[badge.trackingKey] || 0;
    return badge.trackingKey === 'debtToIncomeRatio' ? (val <= badge.target && val > 0) : (val >= badge.target);
  }).length;

  if (loading) {
    return (
      <div className="p-6 lg:p-8 max-w-5xl flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl animate-fade-in">
      <PageHeader title="Milestones" subtitle={`${earnedCount} badges unlocked · Keep going!`} />

      {/* Level card */}
      <div 
        className="glass-card p-6 mb-6 relative overflow-hidden"
        style={{ border: `0.5px solid ${currentLevel.color}30`, background: `radial-gradient(ellipse at 0% 50%, ${currentLevel.color}08, transparent 60%)` }}
      >
        <div className="flex items-center gap-6">
          <div 
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl flex-shrink-0"
            style={{ background: `${currentLevel.color}20`, border: `0.5px solid ${currentLevel.color}40`, boxShadow: `0 0 24px ${currentLevel.color}30` }}
          >
            {currentLevel.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-xs text-[#8A95B8] uppercase tracking-wider">Your Rank</span>
            </div>
            <h2 className="font-display font-600 text-xl mb-3" style={{ color: currentLevel.color }}>{currentLevel.name}</h2>
            {nextLevel && (
              <>
                <div className="flex justify-between text-xs text-[#8A95B8] mb-1.5">
                  <span>Next rank: <span style={{ color: nextLevel.color }}>{nextLevel.name}</span></span>
                  <span className="font-mono">{Math.round(levelProgress)}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1A2740' }}>
                  <div 
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${currentLevel.color}, ${nextLevel.color})`, boxShadow: `0 0 8px ${currentLevel.color}60` }} 
                  />
                </div>
                <p className="text-xs text-[#4A5780] mt-1.5">Reach a score of {nextLevel.minScore} to level up to {nextLevel.icon} {nextLevel.name}</p>
              </>
            )}
            {!nextLevel && <p className="text-sm text-emerald-400 font-500">🎉 Highest Rank Reached!</p>}
          </div>
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className="font-mono text-4xl font-500" style={{ color: currentLevel.color }}>{earnedCount}</div>
            <div className="text-xs text-[#4A5780]">badges unlocked</div>
          </div>
        </div>
      </div>

      {/* Level ladder */}
      <div className="glass-card p-5 mb-6">
        <h3 className="font-display font-500 text-sm text-[#E8EBF4] mb-4">Rank Pathway</h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 invisible-scrollbar">
          {LEVELS.map((level, i) => {
            const reached = currentScore >= level.minScore;
            return (
              <div key={i} className="flex items-center gap-2 flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all"
                    style={{
                      background: reached ? `${level.color}20` : 'rgba(26,39,64,0.4)',
                      border: `0.5px solid ${reached ? `${level.color}40` : 'rgba(74,87,128,0.2)'}`,
                      boxShadow: reached ? `0 0 12px ${level.color}30` : 'none',
                      filter: reached ? 'none' : 'grayscale(0.7) opacity(0.5)',
                    }}
                  >
                    {level.icon}
                  </div>
                  <span className="text-xs font-500" style={{ color: reached ? level.color : '#4A5780' }}>{level.name}</span>
                </div>
                {i < LEVELS.length - 1 && (
                  <div 
                    className="w-8 h-0.5 flex-shrink-0 rounded-full"
                    style={{ background: currentScore >= LEVELS[i+1].minScore ? level.color : '#1A2740' }} 
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges grid */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-500 text-base text-[#E8EBF4]">All Badges</h3>
          <span className="text-xs text-[#8A95B8]">{earnedCount} / {BADGES.length} unlocked</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {BADGES.map((badge, i) => (
            <BadgeCard 
              key={badge.id} 
              badge={badge} 
              index={i} 
              userProgress={userProgress} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}