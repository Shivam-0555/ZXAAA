import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, Package, ShieldCheck, TrendingUp, Trash2, CheckCircle, XCircle, RefreshCw, Crown } from 'lucide-react';

const API = 'http://localhost:5000/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats]       = useState(null);
  const [users, setUsers]       = useState([]);
  const [products, setProducts] = useState([]);
  const [tab, setTab]           = useState('overview');
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const isAdmin = user?.role === 'admin';

  const flash = (msg) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000); };

  const fetchAll = useCallback(async () => {
    if (!isAdmin) { setLoading(false); return; }
    setLoading(true);
    const cfg = { headers: { Authorization: `Bearer ${user?.token}` } };
    try {
      const [statsRes, usersRes, prodsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`,    cfg),
        axios.get(`${API}/admin/users`,    cfg),
        axios.get(`${API}/admin/products`, cfg),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data);
      setProducts(prodsRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const getConfig = () => ({ headers: { Authorization: `Bearer ${user?.token}` } });

  const toggleUserRole = async (uid, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await axios.patch(`${API}/admin/users/${uid}/role`, { role: newRole }, getConfig());
      setUsers(prev => prev.map(u => u._id === uid ? { ...u, role: newRole } : u));
      flash(`User role changed to ${newRole}`);
    } catch { flash('Role update failed'); }
  };

  const updateProductStatus = async (pid, status) => {
    try {
      await axios.patch(`${API}/admin/products/${pid}/status`, { status }, getConfig());
      setProducts(prev => prev.map(p => p._id === pid ? { ...p, status } : p));
      flash(`Product marked as ${status}`);
    } catch { flash('Status update failed'); }
  };

  const deleteProduct = async (pid) => {
    if (!confirm('Delete this product listing permanently?')) return;
    try {
      await axios.delete(`${API}/admin/products/${pid}`, getConfig());
      setProducts(prev => prev.filter(p => p._id !== pid));
      flash('Product deleted');
    } catch { flash('Delete failed'); }
  };

  // Access denied
  if (!user) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-yellow-500/50">
        <h2 className="text-2xl font-bold text-yellow-400 mb-2">Sign In Required</h2>
        <p className="text-[var(--color-zxaaa-muted)]">Please sign in to access the Admin Dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-red-500/50 space-y-4">
        <h2 className="text-2xl font-bold text-red-400">🚫 Access Denied</h2>
        <p className="text-[var(--color-zxaaa-muted)]">Your account <strong className="text-white">{user.email}</strong> does not have admin privileges.</p>
        <div className="bg-[var(--color-zxaaa-card)] rounded-xl p-4 border border-[var(--color-zxaaa-border)] text-sm text-left max-w-md mx-auto">
          <p className="text-yellow-400 font-bold mb-2">🔧 Developer Setup</p>
          <p className="text-[var(--color-zxaaa-muted)] mb-3">To elevate your account to admin, use this endpoint while logged in:</p>
          <code className="block bg-[var(--color-zxaaa-bg)] text-emerald-400 p-3 rounded-lg text-xs font-mono">
            POST /api/auth/elevate-admin<br/>
            Authorization: Bearer {'<your-token>'}
          </code>
          <button
            onClick={async () => {
              try {
                const { data } = await axios.post(`${API}/auth/elevate-admin`, {}, getConfig());
                localStorage.setItem('userInfo', JSON.stringify(data.data));
                window.location.reload();
              } catch (e) {
                alert(e.response?.data?.message || 'Failed to elevate');
              }
            }}
            className="mt-4 w-full py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <Crown size={16} /> Claim Admin Access (Dev Mode)
          </button>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users',    label: '👥 Users' },
    { id: 'products', label: '📦 Products' },
  ];

  const statCards = stats ? [
    { label: 'Total Users',      value: stats.users,          color: 'from-blue-600 to-indigo-600',   icon: <Users size={20} /> },
    { label: 'Total Products',   value: stats.products,       color: 'from-purple-600 to-pink-600',   icon: <Package size={20} /> },
    { label: 'Active Listings',  value: stats.activeProducts, color: 'from-emerald-500 to-teal-600',  icon: <CheckCircle size={20} /> },
    { label: 'Total Orders',     value: stats.orders,         color: 'from-amber-500 to-orange-600',  icon: <TrendingUp size={20} /> },
    { label: 'Swap Proposals',   value: stats.swaps,          color: 'from-pink-500 to-rose-600',     icon: <RefreshCw size={20} /> },
    { label: 'Revenue (₹)',      value: `₹${(stats.revenue || 0).toLocaleString()}`, color: 'from-teal-500 to-cyan-600', icon: <ShieldCheck size={20} /> },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold gradient-text">Admin Dashboard</h1>
          <p className="text-[var(--color-zxaaa-muted)] text-sm mt-1">
            Logged in as <span className="text-white font-semibold">{user.name}</span>
            <span className="ml-2 text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30 uppercase font-bold">Admin</span>
          </p>
        </div>
        <div className="flex gap-3 items-center">
          {actionMsg && (
            <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full animate-pulse">
              ✓ {actionMsg}
            </span>
          )}
          <button
            onClick={fetchAll}
            className="flex items-center gap-2 bg-[var(--color-zxaaa-card)] border border-[var(--color-zxaaa-border)] text-sm text-white px-4 py-2 rounded-xl hover:border-[var(--color-zxaaa-purple)] transition-all"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <div className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold text-xs">
            🟢 System Online
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-[var(--color-zxaaa-card)] rounded-2xl border border-[var(--color-zxaaa-border)] w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === t.id
                ? 'bg-gradient-to-r from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] text-white shadow-md'
                : 'text-[var(--color-zxaaa-muted)] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48 text-[var(--color-zxaaa-muted)]">
          <RefreshCw className="animate-spin mr-3" size={20} /> Loading admin data...
        </div>
      ) : error ? (
        <div className="text-red-400 bg-red-500/10 border border-red-500/30 p-4 rounded-xl">{error}</div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map(card => (
                  <div
                    key={card.label}
                    className="glass-panel p-6 rounded-2xl border border-[var(--color-zxaaa-border)] hover:border-[var(--color-zxaaa-purple)] transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[var(--color-zxaaa-muted)] text-sm font-medium">{card.label}</p>
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${card.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                        {card.icon}
                      </div>
                    </div>
                    <p className="text-3xl font-extrabold text-white">{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Activity Log */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-zxaaa-border)]">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">🚩 Recent Flags</h2>
                  <div className="space-y-3">
                    {[
                      { title: 'Suspicious Activity', sub: 'User: John Doe', time: '2m ago' },
                      { title: 'Prohibited Item Listed', sub: 'Product ID: #99281', time: '15m ago' },
                      { title: 'Duplicate Account', sub: 'IP: 103.56.89.12', time: '1h ago' },
                    ].map(flag => (
                      <div key={flag.title} className="flex justify-between items-center p-3 bg-[var(--color-zxaaa-bg)] rounded-xl border border-[var(--color-zxaaa-border)]">
                        <div>
                          <p className="font-semibold text-sm text-white">{flag.title}</p>
                          <p className="text-xs text-[var(--color-zxaaa-muted)]">{flag.sub} · {flag.time}</p>
                        </div>
                        <button className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-1 rounded-lg hover:bg-red-500/30 transition-colors">
                          Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-panel p-6 rounded-2xl border border-[var(--color-zxaaa-border)]">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2">📋 System Logs</h2>
                  <div className="space-y-2 font-mono text-xs text-[var(--color-zxaaa-muted)] bg-[var(--color-zxaaa-bg)] p-4 rounded-xl border border-[var(--color-zxaaa-border)]">
                    <p><span className="text-emerald-400">[INFO]</span> Database backup completed successfully.</p>
                    <p><span className="text-yellow-400">[WARN]</span> High traffic detected in region: Vadodara.</p>
                    <p><span className="text-emerald-400">[INFO]</span> Admin session started: {user.email}</p>
                    <p><span className="text-emerald-400">[INFO]</span> Trust Score Algorithm run complete.</p>
                    <p><span className="text-blue-400">[CRON]</span> QR token cleanup job executed.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="glass-panel rounded-2xl border border-[var(--color-zxaaa-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--color-zxaaa-border)] flex justify-between items-center">
                <h2 className="font-bold text-lg">All Users <span className="text-[var(--color-zxaaa-muted)] text-sm font-normal">({users.length})</span></h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)]">
                      {['Name', 'Email', 'City', 'Role', 'Trust', 'Joined', 'Action'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[var(--color-zxaaa-muted)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u._id} className="border-b border-[var(--color-zxaaa-border)] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[var(--color-zxaaa-blue)] to-[var(--color-zxaaa-purple)] flex items-center justify-center text-xs font-bold text-white shrink-0">
                              {u.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <span className="font-semibold text-white truncate max-w-[120px]">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-zxaaa-muted)] text-xs truncate max-w-[150px]">{u.email}</td>
                        <td className="px-4 py-3 text-[var(--color-zxaaa-muted)] text-xs">{u.city || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            u.role === 'admin'
                              ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                              : 'bg-[var(--color-zxaaa-bg)] text-[var(--color-zxaaa-muted)] border-[var(--color-zxaaa-border)]'
                          }`}>{u.role}</span>
                        </td>
                        <td className="px-4 py-3 text-emerald-400 font-bold text-xs">{u.trustScore ?? 50}</td>
                        <td className="px-4 py-3 text-[var(--color-zxaaa-muted)] text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleUserRole(u._id, u.role)}
                            disabled={u._id === user._id}
                            className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                              u._id === user._id
                                ? 'opacity-30 cursor-not-allowed bg-[var(--color-zxaaa-card)] border-[var(--color-zxaaa-border)] text-gray-500'
                                : u.role === 'admin'
                                ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                                : 'bg-purple-500/10 text-purple-400 border-purple-500/30 hover:bg-purple-500/20'
                            }`}
                          >
                            {u._id === user._id ? 'You' : u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="p-8 text-center text-[var(--color-zxaaa-muted)]">No users found.</div>
                )}
              </div>
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="glass-panel rounded-2xl border border-[var(--color-zxaaa-border)] overflow-hidden">
              <div className="p-4 border-b border-[var(--color-zxaaa-border)]">
                <h2 className="font-bold text-lg">All Products <span className="text-[var(--color-zxaaa-muted)] text-sm font-normal">({products.length})</span></h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-zxaaa-border)] bg-[var(--color-zxaaa-bg)]">
                      {['Title', 'Category', 'Price', 'Seller', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[var(--color-zxaaa-muted)] uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p._id} className="border-b border-[var(--color-zxaaa-border)] hover:bg-white/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {p.images?.[0] ? (
                              <img src={p.images[0]} alt={p.title} className="w-9 h-9 rounded-lg object-cover border border-[var(--color-zxaaa-border)]" onError={e => e.target.style.display='none'} />
                            ) : (
                              <div className="w-9 h-9 rounded-lg bg-[var(--color-zxaaa-bg)] border border-[var(--color-zxaaa-border)] flex items-center justify-center text-base">📦</div>
                            )}
                            <span className="font-semibold text-white truncate max-w-[140px]">{p.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[var(--color-zxaaa-muted)] text-xs">{p.category}</td>
                        <td className="px-4 py-3 font-bold text-emerald-400">₹{p.price?.toLocaleString()}</td>
                        <td className="px-4 py-3 text-[var(--color-zxaaa-muted)] text-xs">{p.seller?.name || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            p.status === 'ACTIVE'    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                            p.status === 'SOLD'      ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                            p.status === 'REJECTED'  ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                            'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}>{p.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {p.status !== 'ACTIVE' && (
                              <button
                                onClick={() => updateProductStatus(p._id, 'ACTIVE')}
                                title="Activate"
                                className="p-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/20 transition-colors"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            {p.status !== 'REJECTED' && (
                              <button
                                onClick={() => updateProductStatus(p._id, 'REJECTED')}
                                title="Reject"
                                className="p-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/20 transition-colors"
                              >
                                <XCircle size={14} />
                              </button>
                            )}
                            <button
                              onClick={() => deleteProduct(p._id)}
                              title="Delete"
                              className="p-1.5 bg-red-900/20 text-red-500 border border-red-700/30 rounded-lg hover:bg-red-900/40 transition-colors"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {products.length === 0 && (
                  <div className="p-8 text-center text-[var(--color-zxaaa-muted)]">No products found.</div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
