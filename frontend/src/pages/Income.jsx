import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatINR, INCOME_TYPES, MONTHS } from '../utils/helpers';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Plus, Trash2, Edit3, TrendingUp, RefreshCw, Sparkles, Calendar, Briefcase, X, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_FORM = { amount: '', type: 'salary', source: '', date: new Date().toISOString().split('T')[0], isRecurring: false };

export default function Income() {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

 const load = async () => {
  try {
    const res = await api.get('/income');
    setIncomes(res.data || []);
  } catch (err) {
    console.error('Failed to load incomes:', err);
    setIncomes([]);
    toast.error('Failed to load income data');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { 
    load(); 
  }, []);

  const total = incomes.reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const recurring = incomes.filter(i => i.isRecurring).reduce((s, i) => s + parseFloat(i.amount || 0), 0);
  const oneTime = total - recurring;

  const defaultTypes = [
    { value: 'salary', label: 'Salary' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'business', label: 'Business' },
    { value: 'investment', label: 'Investment' },
    { value: 'other', label: 'Other' }
  ];

  const typeBreakdown = (INCOME_TYPES || defaultTypes).map((t, idx) => ({
    name: t.label,
    value: incomes.filter(i => i.type === t.value).reduce((s, i) => s + parseFloat(i.amount || 0), 0),
    color: ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#64748B'][idx] || '#10B981',
  })).filter(t => t.value > 0);

  const monthlyTrend = MONTHS.map(month => ({
  month,
  amount: 0
}));

incomes.forEach(income => {
  const date = new Date(income.date);
  const monthName = MONTHS[date.getMonth()];

  const entry = monthlyTrend.find(m => m.month === monthName);

  if (entry) {
    entry.amount += Number(income.amount || 0);
  }
});

  const handleSave = async (e) => {
    e.preventDefault();
    const parsedAmount = parseFloat(form.amount);
    if (!form.amount || isNaN(parsedAmount) || parsedAmount <= 0) { 
      toast.error('Enter a valid numerical value'); 
      return; 
    }
    setSaving(true);
    try {
      if (editItem) { 
        await api.put(`/income/${editItem._id}`, { ...form, amount: parsedAmount }); 
        toast.success('Income source updated successfully.'); 
      } else { 
        await api.post('/income', { ...form, amount: parsedAmount }); 
        toast.success('New income source added successfully.'); 
      }
      setModalOpen(false);
      load();
    } catch { 
      toast.error('Failed to save income record to the ledger'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this income record?')) return;
    try { 
      await api.delete(`/id`); 
      toast.success('Record deleted successfully'); 
      setIncomes(p => p.filter(i => i._id !== id)); 
    } catch { 
      toast.error('Failed to delete income record'); 
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] p-6 lg:p-12 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 tracking-widest uppercase font-mono">Loading Income Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 p-4 sm:p-6 lg:p-10 font-sans antialiased selection:bg-emerald-500/20 selection:text-emerald-400">
      
      {/* ─── TERMINAL HEADER LAYER ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs uppercase tracking-widest mb-1">
            <TrendingUp size={12} /> Income Tracker
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Income <span className="text-slate-400 font-light font-display">Inflows</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Monitor your earnings, track incoming financial sources, and optimize your overall cash flow.
          </p>
        </div>
        <button 
          onClick={() => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); }} 
          className="flex items-center gap-2 w-full sm:w-auto justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} /> Add Income Source
        </button>
      </div>

      {/* ─── STATISTICAL OVERVIEW STRUCTURAL CARDS ──────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {/* Total Inflow Tracker Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F1524] to-[#090D16] border border-slate-800/80 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full filter blur-xl transition-all group-hover:bg-emerald-500/10" />
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Revenue</span>
            <TrendingUp size={16} className="text-emerald-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">{formatINR(total)}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Sparkles size={11} className="text-emerald-400/80" /> Cumulative baseline earnings pool.
          </div>
        </div>

        {/* Regular Commit Pipeline Card */}
        <div className="p-6 rounded-2xl bg-[#0F1524]/40 border border-slate-800/60 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Recurring Income</span>
            <RefreshCw size={14} className="text-blue-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">{formatINR(recurring)}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Makes up <span className="text-blue-400 font-semibold">{total > 0 ? ((recurring / total) * 100).toFixed(0) : 0}%</span> of your predictable cash flow.
          </div>
        </div>

        {/* Volatile Assets Card */}
        <div className="p-6 rounded-2xl bg-[#0F1524]/40 border border-slate-800/60 shadow-lg">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">One-Time Income</span>
            <Briefcase size={15} className="text-purple-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white tracking-tight">{formatINR(oneTime)}</div>
          <div className="text-[11px] text-slate-500 mt-2">
            Includes freelance work, bonuses, and occasional windfalls.
          </div>
        </div>
      </div>

      {/* ─── VISUAL DATA ANALYTICS GRID NODE ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recharts Area Flow Velocity Chart Grid Frame */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0F1524]/50 border border-slate-800/80 shadow-xl">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4">Monthly Income Trend</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 5, right: 5, bottom: 0, left: -25 }}>
                <defs>
                  <linearGradient id="incGradMatrix" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="month" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#475569" tick={{ fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v / 1000}k`} />
                <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0E1422', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }} />
                <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2.5} fill="url(#incGradMatrix)" dot={{ r: 3, fill: '#090D16', stroke: '#10B981', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Vertical Type Segmentation Matrix Map */}
        <div className="p-5 rounded-2xl bg-[#0F1524]/50 border border-slate-800/80 shadow-xl flex flex-col justify-between gap-4">
          <div>
            <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4">Income Distribution</h3>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeBreakdown} layout="vertical" margin={{ left: -30, right: 10 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" stroke="#475569" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={70} />
                  <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0E1422', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={12}>
                    {typeBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} opacity={0.9} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="space-y-2 border-t border-slate-800/60 pt-3">
            {typeBreakdown.map(t => (
              <div key={t.name} className="flex justify-between items-center text-[11px]">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: t.color }} />
                  <span className="text-slate-400 font-medium">{t.name}</span>
                </div>
                <span className="font-mono text-slate-200 font-semibold">{formatINR(t.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── DATA GRID TRANSACTION HISTORY ROWS ─────────────────────────────── */}
      {incomes.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/40 bg-gradient-to-b from-[#0F1524]/40 to-transparent p-12 text-center max-w-2xl mx-auto mt-6">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mx-auto mb-4">
            <AlertTriangle className="text-slate-600" size={20} />
          </div>
          <h4 className="text-base font-bold text-slate-200">No income streams found</h4>
          <p className="text-sm text-slate-500 mt-1">You haven't logged any income records in your account yet.</p>
          <button onClick={() => setModalOpen(true)} className="mt-5 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus size={14} /> Add First Record
          </button>
        </div>
      ) : (
        <div className="bg-[#0E1422]/60 rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0F1524]">
                  <th scope="col" className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4">Source Label</th>
                  <th scope="col" className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4">Category</th>
                  <th scope="col" className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Amount</th>
                  <th scope="col" className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Date Received</th>
                  <th scope="col" className="px-6 py-4 text-right"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {incomes.map((inc) => (
                  <tr key={inc._id} className="group hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-100 block">{inc.source || 'Income Entry'}</span>
                        {inc.isRecurring && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <RefreshCw size={8} /> Recurring
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-medium text-slate-400 uppercase tracking-wider bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg capitalize">
                        {inc.type}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-emerald-400 whitespace-nowrap">
                      +{formatINR(inc.amount)}
                    </td>
                    
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono whitespace-nowrap">
                      <span className="flex items-center justify-end gap-1.5">
                        <Calendar size={12} className="text-slate-600" />
                        {format(new Date(inc.date), 'dd MMM yyyy')}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => {
                            setEditItem(inc);
                            setForm({ amount: inc.amount, type: inc.type, source: inc.source, date: inc.date.split('T')[0], isRecurring: inc.isRecurring });
                            setModalOpen(true);
                          }} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                          title="Edit Record"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button 
                          onClick={() => handleDelete(inc._id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── FORM MODAL DIALOG CONTAINER OVERLAY ────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-[#0E1422] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-1 mb-1">
                <TrendingUp size={10} /> Configuration
              </div>
              <h3 className="text-lg font-bold text-white">
                {editItem ? 'Edit Income Source' : 'Add New Income Source'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Income Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">₹</span>
                  <input 
                    type="number" 
                    value={form.amount} 
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-[#090D16] border border-slate-800 focus:border-emerald-500/50 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 placeholder-slate-700 outline-none transition-all font-mono" 
                    placeholder="65000" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({ ...form, type: e.target.value })} 
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                >
                  {(INCOME_TYPES || defaultTypes).map(t => (
                    <option key={t.value} value={t.value} className="bg-[#0E1422]">{t.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Income Source Name</label>
                <input 
                  value={form.source} 
                  onChange={e => setForm({ ...form, source: e.target.value })}
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all" 
                  placeholder="e.g. Company Salary, Client Remittance" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date Received</label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-emerald-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all font-mono" 
                />
              </div>

              <div className="bg-[#090D16] border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-200">Recurring Income</span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">Automatically log this transaction every month.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, isRecurring: !form.isRecurring })}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-200 outline-none ${form.isRecurring ? 'bg-emerald-500' : 'bg-slate-800'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${form.isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm rounded-xl py-3 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    editItem ? 'Save Changes' : 'Add Income Source'
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