import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, CheckCheck, Trash2, Tag, RefreshCw, MessageSquare, ShieldAlert, Sparkles, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get('http://localhost:5000/api/notifications', config);
      setNotifications(data.data || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  const markAllAsRead = async () => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put('http://localhost:5000/api/notifications/read-all', {}, config);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const markAsRead = async (id) => {
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, config);
      setNotifications(prev => prev.map(n => n._id === id || n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!user) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, config);
      setNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
    } catch (err) {
      console.error('Delete notification error:', err);
    }
  };

  const getIconAndStyle = (type) => {
    switch (type) {
      case 'swap':
        return {
          icon: <RefreshCw className="text-purple-400" size={18} />,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
      case 'order':
        return {
          icon: <Tag className="text-emerald-400" size={18} />,
          badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        };
      case 'message':
        return {
          icon: <MessageSquare className="text-blue-400" size={18} />,
          badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
        };
      case 'review':
        return {
          icon: <Sparkles className="text-amber-400" size={18} />,
          badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        };
      case 'security':
        return {
          icon: <ShieldAlert className="text-rose-400" size={18} />,
          badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/30'
        };
      default:
        return {
          icon: <Sparkles className="text-purple-400" size={18} />,
          badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30'
        };
    }
  };

  const getTimeAgo = (dateStr) => {
    if (!dateStr) return 'Just now';
    const date = new Date(dateStr);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} mins ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} hours ago`;
    return `${Math.floor(diffSec / 86400)} days ago`;
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-12 text-center glass-panel p-8 rounded-2xl border border-[var(--color-zxaaa-border)] space-y-4">
        <Bell size={44} className="mx-auto text-purple-400 opacity-60" />
        <h2 className="text-xl font-bold text-white">Sign In to View Notifications</h2>
        <p className="text-xs text-[var(--color-zxaaa-muted)]">
          Stay updated on your swap proposals, order receipts, and buyer messages.
        </p>
        <Link
          to="/login"
          className="inline-block px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg shadow-purple-600/30"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'swaps') return n.type === 'swap';
    if (activeTab === 'orders') return n.type === 'order';
    if (activeTab === 'messages') return n.type === 'message';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl glass-panel border border-[var(--color-zxaaa-border)]">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
            <Bell size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white tracking-tight">Notifications</h1>
              {unreadCount > 0 && (
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-purple-600 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-0.5">Alerts for your swaps, orders, and messages</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition-all self-start sm:self-auto"
          >
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[var(--color-zxaaa-border)] pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'all'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setActiveTab('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'unread'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'orders'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Orders
        </button>
        <button
          onClick={() => setActiveTab('swaps')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'swaps'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
              : 'text-[var(--color-zxaaa-muted)] hover:text-white hover:bg-white/[0.05]'
          }`}
        >
          Swaps
        </button>
      </div>

      {/* Notification List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-[var(--color-zxaaa-border)] text-[var(--color-zxaaa-muted)] text-xs">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 rounded-2xl glass-panel border border-[var(--color-zxaaa-border)]">
            <Bell size={40} className="mx-auto text-[var(--color-zxaaa-muted)] mb-3 opacity-40" />
            <h3 className="text-base font-semibold text-white">No notifications yet</h3>
            <p className="text-xs text-[var(--color-zxaaa-muted)] mt-1 max-w-sm mx-auto">
              Notifications will automatically appear here when someone requests a swap, places an order, or sends you a message!
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const notifId = n._id || n.id;
            const { icon, badgeColor } = getIconAndStyle(n.type);

            return (
              <Link
                key={notifId}
                to={n.link || '/notifications'}
                onClick={() => markAsRead(notifId)}
                className={`group flex items-start gap-4 p-4 rounded-2xl border transition-all duration-200 ${
                  n.read
                    ? 'bg-black/20 border-[var(--color-zxaaa-border)] opacity-80 hover:opacity-100 hover:border-purple-500/40'
                    : 'bg-purple-950/20 border-purple-500/40 hover:border-purple-500/70 shadow-lg shadow-purple-950/20'
                }`}
              >
                {/* Type Icon */}
                <div className={`p-2.5 rounded-xl border shrink-0 ${badgeColor}`}>
                  {icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-semibold truncate ${n.read ? 'text-zinc-200' : 'text-white'}`}>
                      {n.title}
                    </h4>
                    <span className="text-[11px] text-[var(--color-zxaaa-muted)] shrink-0">
                      {getTimeAgo(n.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">{n.message}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100">
                  {!n.read && (
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-sm shadow-purple-500/50 animate-pulse" />
                  )}
                  <button
                    onClick={(e) => deleteNotification(notifId, e)}
                    title="Remove notification"
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
