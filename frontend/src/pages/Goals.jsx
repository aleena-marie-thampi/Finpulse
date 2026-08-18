import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatINR } from '../utils/helpers';
import { Plus, Trash2, Edit3, Target, Calendar, TrendingUp, Zap, X, AlertTriangle, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { format, differenceInDays, parseISO } from 'date-fns';

const GOAL_ICONS = ['🎯','💻','🏍️','✈️','🏠','📚','🛡️','💰','🚗','💍','📱','🎓'];
const EMPTY_FORM = { name: '', targetAmount: '', savedAmount: '', deadline: '', icon: '🎯', monthlyContribution: '' };

function GoalCard({ goal, onEdit, onDelete, index }) {
  const target = Number(goal.targetAmount) || 0;
  const saved = Number(goal.savedAmount) || 0;
  const monthly = Number(goal.monthlyContribution) || 0;

  const pct = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
  const remaining = Math.max(target - saved, 0);
  
  // Normalize comparison to the start of today to avoid minor timestamp deviations
  const today = new Date();
  const daysLeft = goal.deadline ? differenceInDays(parseISO(goal.deadline), today) : null;
  
  // Prevent 0 or negative months from breaking calculations
  const monthsLeft = daysLeft !== null ? Math.max(Math.ceil(daysLeft / 30), 1) : null;
  
  const probability = monthly > 0 && monthsLeft && remaining > 0
    ? Math.min(Math.round(((monthly * monthsLeft) / remaining) * 100), 100)
    : null;

  const isOverdue = daysLeft !== null && daysLeft < 0;
  const isUrgent = daysLeft !== null && daysLeft < 30 && daysLeft >= 0;

  return (
    <div 
      className="bg-[#0F1524]/40 border border-slate-800/80 p-5 rounded-2xl shadow-xl relative overflow-hidden group hover:bg-[#0F1524]/80 hover:border-slate-700/60 transition-all duration-300 animate-slide-up"
      style={{ '--animation-delay': `${index * 60}ms` }}
    >
      {/* Structural Progress Radial Background Glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full filter blur-2xl opacity-5 transition-opacity group-hover:opacity-10 pointer-events-none"
        style={{ backgroundColor: pct >= 100 ? '#10B981' : '#4F46E5' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl bg-slate-950 border border-slate-800/80 shadow-inner">
            {goal.icon || '🎯'}
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 tracking-tight transition-colors group-hover:text-white">
              {goal.name}
            </h3>
            {goal.deadline && (
              <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-mono">
                <Calendar size={11} className="text-slate-500" />
                {format(parseISO(goal.deadline), 'MMM yyyy')}
                {isOverdue && <span className="text-rose-400 font-bold ml-1">· OVERDUE</span>}
                {isUrgent && !isOverdue && <span className="text-amber-400 font-bold ml-1">· {daysLeft}d left</span>}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex gap-0.5 opacity-30 group-hover:opacity-100 transition-opacity duration-200">
          <button 
            onClick={() => onEdit(goal)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Edit3 size={13} />
          </button>
          <button 
            onClick={() => onDelete(goal._id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="flex justify-between items-end mb-3 relative z-10">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Amount Saved</span>
          <span className="font-mono text-lg font-black text-slate-100">{formatINR(saved)}</span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Target Goal</span>
          <span className="font-mono text-xs text-slate-400 font-bold">{formatINR(target)}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4 relative z-10">
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/60 p-[1px]">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ 
              width: `${pct}%`,
              backgroundImage: pct >= 100 
                ? 'linear-gradient(to right, #10B981, #059669)' 
                : isOverdue 
                  ? 'linear-gradient(to right, #F43F5E, #E11D48)' 
                  : 'linear-gradient(to right, #4F46E5, #3B82F6)'
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-[11px] font-mono">
          <span 
            className="font-bold" 
            style={{ color: pct >= 100 ? '#10B981' : isOverdue ? '#F43F5E' : '#6366F1' }}
          >
            {pct}% Completed
          </span>
          {remaining > 0 ? (
            <span className="text-slate-500">{formatINR(remaining)} left</span>
          ) : (
            <span className="text-emerald-400 font-bold flex items-center gap-0.5">
              <CheckCircle2 size={10} /> Fully Funded
            </span>
          )}
        </div>
      </div>

      {/* Status Tags */}
      <div className="flex flex-wrap gap-1.5 pt-3 relative z-10 border-t border-slate-800/60">
        {pct >= 100 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ✓ Goal Achieved
          </span>
        )}
        {monthly > 0 && pct < 100 && (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <TrendingUp size={9} /> {formatINR(monthly)}/mo
          </span>
        )}
        {probability !== null && pct < 100 && (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold"
            style={{ 
              backgroundColor: probability >= 70 ? 'rgba(16,185,129,0.08)' : 'rgba(245,158,11,0.08)',
              borderColor: probability >= 70 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)',
              color: probability >= 70 ? '#10B981' : '#F59E0B'
            }}
          >
            <Zap size={9} /> {probability}% on track
          </span>
        )}
        {monthsLeft !== null && daysLeft > 0 && pct < 100 && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
            {monthsLeft} {monthsLeft === 1 ? 'month' : 'months'} left
          </span>
        )}
      </div>
    </div>
  );
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/goals');
      setGoals(res.data);
    } catch {
      setGoals([]);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  
  const openEdit = (g) => {
    setEditItem(g);
    const standardDate = g.deadline ? g.deadline.split('T')[0] : '';
    setForm({ 
      name: g.name, 
      targetAmount: g.targetAmount, 
      savedAmount: g.savedAmount, 
      deadline: standardDate, 
      icon: g.icon || '🎯', 
      monthlyContribution: g.monthlyContribution || '' 
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const parsedForm = {
      ...form,
      targetAmount: Number(form.targetAmount),
      savedAmount: Number(form.savedAmount) || 0,
      monthlyContribution: Number(form.monthlyContribution) || 0
    };

    try {
      if (editItem) { 
        await api.put(`/goals/${editItem._id}`, parsedForm); 
        toast.success('Goal updated successfully!'); 
      } else { 
        await api.post('/goals', parsedForm); 
        toast.success('New savings goal created!'); 
      }
      setModalOpen(false);
      load();
    } catch { 
      toast.error('Failed to save goal. Please try again.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this savings goal?')) return;
    try { 
      await api.delete(`/goals/${id}`); 
      toast.success('Goal removed'); 
      setGoals(p => p.filter(g => g._id !== id)); 
    } catch { 
      toast.error('Failed to delete goal.'); 
    }
  };

  const achieved = goals.filter(g => g.savedAmount >= g.targetAmount).length;
  const totalTarget = goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.savedAmount || 0), 0);

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 p-6 lg:p-10 font-sans antialiased selection:bg-indigo-500/20 selection:text-indigo-400">
      
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.3s ease-out forwards; }
        .animate-slide-up { 
          animation: slideUp 0.4s var(--animation-delay, 0ms) cubic-bezier(0.16, 1, 0.3, 1) forwards; 
          opacity: 0;
        }
      `}</style>

      {/* Header Layer */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800/60 pb-6 animate-fade-in">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs uppercase tracking-widest mb-1.5">
            <Target size={12} /> Savings Targets
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Financial <span className="text-slate-400 font-light">Goals</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Set your long-term savings goals, budget your monthly contributions, and track your overall progress over time.
          </p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-[#4F46E5] hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/10 transition-all duration-300"
        >
          <Plus size={14} /> Add New Goal
        </button>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="py-24 text-center space-y-4">
          <div className="w-10 h-10 border-2 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 tracking-widest uppercase font-mono">Loading your goals...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 animate-fade-in">
            {[
              { label: 'Active Goals', value: goals.length, color: '#38BDF8' },
              { label: 'Completed Goals', value: achieved, color: '#10B981' },
              { label: 'Total Progress', value: totalTarget > 0 ? `${Math.round((totalSaved / totalTarget) * 100)}%` : '0%', color: '#8B5CF6' },
            ].map((s, i) => (
              <div 
                key={i} 
                className="p-5 rounded-2xl bg-[#0F1524]/40 border border-slate-800/80 shadow-md text-center group transition-colors hover:bg-[#0F1524]/70"
              >
                <div 
                  className="font-mono text-3xl font-black mb-1 transition-transform group-hover:scale-102 duration-300" 
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <div className="rounded-2xl border border-slate-800/40 bg-gradient-to-b from-[#0F1524]/40 to-transparent p-12 text-center max-w-2xl mx-auto mt-6 animate-fade-in">
              <div className="w-11 h-11 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mx-auto mb-4">
                <AlertTriangle className="text-slate-600" size={18} />
              </div>
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wide">No goals created yet</h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">You haven't set up any savings goals yet. Create your first goal to start tracking your progress!</p>
              <button onClick={openAdd} className="mt-5 inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all">
                <Plus size={12} /> Create Your First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal, i) => (
                <GoalCard key={goal._id} goal={goal} index={i} onEdit={openEdit} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Form Dialog Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-fade-in">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-[#0E1422] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-1 mb-1">
                <Target size={10} /> Goal Settings
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">
                {editItem ? 'Edit Savings Goal' : 'Create New Savings Goal'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-2">Select Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {GOAL_ICONS.map(ic => (
                    <button 
                      type="button" 
                      key={ic} 
                      onClick={() => setForm({ ...form, icon: ic })}
                      className={`h-10 rounded-xl text-base flex items-center justify-center transition-all duration-200 ${form.icon === ic ? 'bg-indigo-500/10 border-indigo-500 text-white scale-102' : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'}`}
                      style={{ borderStyle: 'solid', borderWidth: '1px' }}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">Goal Name</label>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  className="w-full bg-slate-950 border border-slate-850 focus:border-slate-700 focus:ring-0 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-700 outline-none transition-all" 
                  placeholder="e.g. Emergency Fund" 
                  required 
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">Target Amount (₹)</label>
                  <input 
                    type="number" 
                    value={form.targetAmount} 
                    onChange={e => setForm({ ...form, targetAmount: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 focus:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono" 
                    placeholder="80000" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">Amount Saved So Far (₹)</label>
                  <input 
                    type="number" 
                    value={form.savedAmount} 
                    onChange={e => setForm({ ...form, savedAmount: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 focus:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono" 
                    placeholder="0" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">Target Date</label>
                  <input 
                    type="date" 
                    value={form.deadline} 
                    onChange={e => setForm({ ...form, deadline: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 focus:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono text-slate-400" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">Monthly Contribution (₹)</label>
                  <input 
                    type="number" 
                    value={form.monthlyContribution} 
                    onChange={e => setForm({ ...form, monthlyContribution: e.target.value })} 
                    className="w-full bg-slate-950 border border-slate-850 focus:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 outline-none transition-all font-mono" 
                    placeholder="5000" 
                  />
                </div>
              </div>

              <div className="pt-3">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-[#4F46E5] hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl py-3 shadow-md transition-all duration-300 disabled:opacity-50"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto" />
                  ) : (
                    editItem ? 'Save Changes' : 'Create Goal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}