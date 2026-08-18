import { useState, useEffect } from 'react';
import api from '../api/axios'; // Shared network module instance
import { formatINR, EXPENSE_CATEGORIES } from '../utils/helpers';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Trash2, Edit3, Search, Calendar, Tag, CreditCard, Info, AlertTriangle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EMPTY_FORM = { amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch {
      // Fallback mock records if the backend server is unreachable
      setExpenses([
        { _id: '1', amount: 15000, category: 'rent', description: 'Apartment Rent', date: '2026-06-01' },
        { _id: '2', amount: 4500, category: 'food', description: 'Weekly Groceries', date: '2026-06-05' },
        { _id: '3', amount: 2000, category: 'travel', description: 'Metro Monthly Pass', date: '2026-06-08' },
        { _id: '4', amount: 3200, category: 'shopping', description: 'Clothes shopping', date: '2026-06-10' },
        { _id: '5', amount: 1800, category: 'food', description: 'Dinner Delivery', date: '2026-06-12' },
        { _id: '6', amount: 500, category: 'entertainment', description: 'Streaming Subscription', date: '2026-06-15' },
      ]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setModalOpen(true); };
  
  const openEdit = (e) => { 
    setEditItem(e); 
    // ISO string splitter fallback to avoid runtime errors on unformatted dates
    const cleanDate = e.date && typeof e.date === 'string' ? e.date.split('T')[0] : new Date().toISOString().split('T')[0];
    setForm({ 
      amount: e.amount, 
      category: e.category, 
      description: e.description, 
      date: cleanDate 
    }); 
    setModalOpen(true); 
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    if (!form.amount || isNaN(form.amount)) { toast.error('Please enter a valid amount.'); return; }
    setSaving(true);
    try {
      if (editItem) {
        await api.put(`/expenses/${editItem._id}`, form);
        toast.success('Expense updated successfully.');
      } else {
        await api.post('/expenses', form);
        toast.success('Expense logged successfully.');
      }
      setModalOpen(false);
      load();
    } catch { 
      toast.error('Failed to save changes. Please try again.'); 
    } finally { 
      setSaving(false); 
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this record?')) return;
    try {
      await api.delete(`/expenses/${id}`);
      toast.success('Expense deleted.');
      setExpenses(prev => prev.filter(e => e._id !== id));
    } catch { 
      toast.error('Could not delete expense.'); 
    }
  };

  const filtered = expenses.filter(e =>
    (filterCat === 'all' || e.category === filterCat) &&
    (e.description?.toLowerCase().includes(search.toLowerCase()) || !search)
  );

  const total = filtered.reduce((s, e) => s + e.amount, 0);

  const defaultCategories = [
    { value: 'food', label: 'Food', color: '#10B981', icon: '🍲' },
    { value: 'rent', label: 'Rent', color: '#EF4444', icon: '🏠' },
    { value: 'travel', label: 'Travel', color: '#3B82F6', icon: '🚇' },
    { value: 'shopping', label: 'Shopping', color: '#F59E0B', icon: '🛍️' },
    { value: 'entertainment', label: 'Entertainment', color: '#8B5CF6', icon: '🎬' },
    { value: 'other', label: 'Other', color: '#6B7280', icon: '💳' },
  ];

  const catData = (EXPENSE_CATEGORIES || defaultCategories).map(cat => ({
    name: cat.label, 
    value: expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0),
    color: cat.color,
    icon: cat.icon
  })).filter(c => c.value > 0);

  const getCatInfo = (val) => {
    const fallbacks = { food: '🍲', rent: '🏠', travel: '🚇', shopping: '🛍️', entertainment: '🎬', other: '💳' };
    const categories = EXPENSE_CATEGORIES || defaultCategories;
    const found = categories.find(c => c.value === val);
    return found || { label: val.toUpperCase(), icon: fallbacks[val] || '💳', color: '#64748B' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] p-6 lg:p-12 flex items-center justify-center">
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 border-2 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 tracking-widest uppercase">Loading Expense Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 p-6 lg:p-10 font-sans antialiased selection:bg-rose-500/20 selection:text-rose-400">
      
      {/* ─── APP HEADER ─────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-slate-800/60 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-mono text-xs uppercase tracking-widest mb-1">
            <CreditCard size={12} /> Personal Expense Tracker
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Expense <span className="text-slate-400 font-light">Analytics</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Monitor your monthly spending habits, manage categories, and review budget distributions.
          </p>
        </div>
        <button 
          onClick={openAdd} 
          className="flex items-center gap-2 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all duration-200 active:scale-[0.98]"
        >
          <Plus size={16} strokeWidth={2.5} /> Add New Expense
        </button>
      </div>

      {/* ─── ANALYTICS OVERVIEW CARDS ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Total Spend Summary Metric Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0F1524] to-[#090D16] border border-slate-800/80 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Outflows</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-rose-500/10 text-rose-400 border border-rose-500/20">Current View</span>
            </div>
            <div className="text-4xl font-black text-white tracking-tight font-mono">{formatINR(total)}</div>
            <p className="text-xs text-slate-500 mt-1.5">{filtered.length} matching transactions listed below.</p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1"><Info size={12} className="text-slate-500" /> Tracked Overview</span>
            <span className="text-slate-500 font-mono">2026-Q2</span>
          </div>
        </div>

        {/* Recharts Pie Structure View Node */}
        <div className="p-5 rounded-2xl bg-[#0F1524]/60 border border-slate-800/60 shadow-lg relative overflow-hidden">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-2">Category Concentration</h3>
          {catData.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-xs text-slate-600">No chart data to show.</div>
          ) : (
            <div className="flex items-center justify-between h-40">
              <div className="w-[50%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={catData} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={4}>
                      {catData.map((entry, i) => <Cell key={`cell-${i}`} fill={entry.color} stroke="#090D16" strokeWidth={2} />)}
                    </Pie>
                    <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0E1422', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11, color: '#E2E8F0' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-[50%] space-y-1.5 max-h-full overflow-y-auto pr-1 text-slate-300">
                {catData.slice(0, 4).map(c => (
                  <div key={c.name} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="text-slate-400 truncate">{c.name}</span>
                    </div>
                    <span className="font-mono font-medium pl-1">{((c.value / (total || 1)) * 100).toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recharts Bar Distribution Chart Frame */}
        <div className="p-5 rounded-2xl bg-[#0F1524]/60 border border-slate-800/60 shadow-lg">
          <h3 className="font-semibold text-xs text-slate-400 uppercase tracking-widest mb-4">Expense Distribution</h3>
          <div className="h-36">
            {catData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-600">No data available for charts.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} margin={{ top: 0, right: 0, bottom: 0, left: -25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                  <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#475569" tick={{ fontSize: 9, fontFamily: 'monospace' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                  <Tooltip formatter={v => formatINR(v)} contentStyle={{ background: '#0E1422', border: '1px solid #1E293B', borderRadius: 8, fontSize: 11 }} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {catData.map((entry, i) => <Cell key={`bar-${i}`} fill={entry.color} opacity={0.85} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      {/* ─── SEARCH AND FILTERS TOOLBAR ─────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between mb-6 bg-[#0E1422] p-4 rounded-2xl border border-slate-800/80">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#090D16] border border-slate-800 focus:border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 outline-none transition-all" 
            placeholder="Search by description..." 
          />
        </div>
        
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-thin">
          <button 
            onClick={() => setFilterCat('all')}
            className={`text-xs px-3.5 py-2 rounded-lg font-medium border transition-all whitespace-nowrap ${filterCat === 'all' ? 'bg-slate-800 border-slate-700 text-white shadow-md' : 'border-slate-800/40 bg-transparent text-slate-500 hover:text-slate-300'}`}
          >
            All Categories
          </button>
          {(EXPENSE_CATEGORIES || defaultCategories).map(c => (
            <button 
              key={c.value} 
              onClick={() => setFilterCat(c.value)}
              className={`text-xs px-3.5 py-2 rounded-lg border font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${filterCat === c.value ? 'border-current shadow-lg' : 'border-slate-800/80 bg-transparent text-slate-400 hover:border-slate-700 hover:text-slate-200'}`}
              style={filterCat === c.value ? { backgroundColor: `${c.color}15`, borderColor: `${c.color}40`, color: c.color } : {}}
            >
              <span>{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── DATA TABLE LEDGER ─────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-800/40 bg-gradient-to-b from-[#0F1524]/40 to-transparent p-12 text-center max-w-2xl mx-auto mt-6">
          <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 mx-auto mb-4">
            <AlertTriangle className="text-slate-600" size={20} />
          </div>
          <h4 className="text-base font-bold text-slate-200">No expenses found</h4>
          <p className="text-sm text-slate-500 mt-1">There are no entries matches your keywords or filter parameters in the current list.</p>
          <button onClick={openAdd} className="mt-5 inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all">
            <Plus size={14} /> Log First Expense
          </button>
        </div>
      ) : (
        <div className="bg-[#0E1422]/60 rounded-2xl border border-slate-800/60 shadow-xl overflow-hidden backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-[#0F1524]">
                  <th className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4">Expense / Details</th>
                  <th className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4">Category</th>
                  <th className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Amount</th>
                  <th className="text-slate-400 text-[10px] font-bold uppercase tracking-widest px-6 py-4 text-right">Date</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filtered.map((expense) => {
                  const cat = getCatInfo(expense.category);
                  const parsedDate = expense.date ? new Date(expense.date) : new Date();
                  
                  return (
                    <tr key={expense._id} className="group hover:bg-slate-800/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3.5">
                          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center group-hover:border-slate-700 transition-colors">
                            <span className="text-sm">{cat.icon}</span>
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-slate-100 block">{expense.description || 'Unspecified Expense'}</span>
                            {expense.note && <span className="text-xs text-slate-500 block font-normal max-w-xs truncate">{expense.note}</span>}
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <span 
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
                          style={{ backgroundColor: `${cat.color}08`, borderColor: `${cat.color}25`, color: cat.color }}
                        >
                          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.label}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 text-right font-mono text-sm font-bold text-rose-400">
                        -{formatINR(expense.amount)}
                      </td>
                      
                      <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">
                        <span className="flex items-center justify-end gap-1.5">
                          <Calendar size={12} className="text-slate-600" />
                          {isNaN(parsedDate.getTime()) ? 'Invalid Date' : format(parsedDate, 'dd MMM yyyy')}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => openEdit(expense)} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                            title="Edit Expense Details"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button 
                            onClick={() => handleDelete(expense._id)} 
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                            title="Delete Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── ENTRY / EDIT MODAL INTERFACE overlay ─────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          
          <div className="bg-[#0E1422] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative z-10">
            <button 
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="mb-6">
              <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-rose-400 flex items-center gap-1 mb-1">
                <Tag size={10} /> Configuration Panel
              </div>
              <h3 className="text-lg font-bold text-white">
                {editItem ? 'Edit Expense Record' : 'Log New Expense'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">₹</span>
                  <input 
                    type="number" 
                    value={form.amount} 
                    onChange={e => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-[#090D16] border border-slate-800 focus:border-rose-500/50 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-100 placeholder-slate-700 outline-none transition-all font-mono" 
                    placeholder="5000" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Category Mapping</label>
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none transition-all"
                >
                  {(EXPENSE_CATEGORIES || defaultCategories).map(c => (
                    <option key={c.value} value={c.value} className="bg-[#0E1422]">{c.icon} {c.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Description</label>
                <input 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition-all" 
                  placeholder="What did you spend this on?" 
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Date</label>
                <input 
                  type="date" 
                  value={form.date} 
                  onChange={e => setForm({ ...form, date: e.target.value })} 
                  className="w-full bg-[#090D16] border border-slate-800 focus:border-rose-500/50 rounded-xl px-4 py-3 text-sm text-slate-100 outline-none transition-all font-mono" 
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={saving} 
                  className="w-full bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-slate-950 font-bold text-sm rounded-xl py-3 shadow-lg shadow-rose-500/10 hover:shadow-rose-500/20 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? (
                    <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  ) : (
                    editItem ? 'Save Changes' : 'Log Expense'
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